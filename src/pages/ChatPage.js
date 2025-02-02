import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Use environment variable for backend API URL, default to same origin
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
const CHAT_API_URL = `${API_BASE_URL}/chat`;
const METRICS_API_URL = `${API_BASE_URL}/current-hardware-metrics`;
const CREDIT_API_URL = `${API_BASE_URL}/calculate-credits`;
const USER_CREDITS_API_URL = `${API_BASE_URL}/user-credits`;
const API_URL = "http://35.21.142.150:8000/chat";
const INITIAL_MESSAGE = "Hello! I'm your eco-friendly AI assistant. Let's chat while saving the planet! 🌍";

const ChatPage = () => {
  const navigate = useNavigate();
  // Assume the user is logged in; if not, use "guest-user" as fallback.
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ text: INITIAL_MESSAGE, sender: "bot" }]);
  const [input, setInput] = useState("");
  const [usageMetrics, setUsageMetrics] = useState({ cpu: 0, gpu: 0 });
  const [greenCredits, setGreenCredits] = useState(0);
  const chatEndRef = useRef(null);

  // On mount, fetch the user's already accumulated green credits.
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch(`${USER_CREDITS_API_URL}?user_id=${user?.uid || "guest-user"}`);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        setGreenCredits(data.green_credits);
      } catch (error) {
        console.error("Error fetching user credits:", error);
      }
    };
    fetchUserCredits();
  }, [user]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodically fetch hardware metrics (CPU usage) from the backend.
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(METRICS_API_URL);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        setUsageMetrics({ cpu: data.cpu_usage, gpu: data.gpu_usage || 0 });
      } catch (error) {
        console.error("Error fetching hardware metrics:", error);
      }
    };

    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Append the user's message.
    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    // Record the starting time of this exchange.
    const startTime = Date.now();

    try {
      // Call the chat endpoint.
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, user_id: user?.uid || "guest-user" })
      });
      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.response) {
        const botMessage = data.response || "No content received"; 
        setMessages(prev => [...prev, { text: botMessage, sender: "bot" }]);
      } else {
        setMessages(prev => [...prev, { text: "Error: No response from AI!", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [...prev, { text: "Server error. Please try again later!", sender: "bot" }]);
    }

    setInput("");

    // Calculate the duration (in seconds) of the exchange.
    const duration = (Date.now() - startTime) / 1000;

    // Call the /calculate-credits endpoint with the duration and latest CPU usage.
    try {
      const creditResponse = await fetch(CREDIT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: duration,
          cpu_usage: usageMetrics.cpu,
          user_id: user?.uid || "guest-user"
        })
      });
      const creditData = await creditResponse.json();
      console.log("Credit API Response:", creditData);
      if (creditResponse.ok && creditData.green_credits != null) {
        // Update the running total of green credits.
        setGreenCredits(prev => prev + creditData.green_credits);
      }
    } catch (error) {
      console.error("Error calculating green credits:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
  {/* Header with title centered */}
  <div className="bg-white shadow-md p-4 flex justify-center items-center">
    <div className="text-xl font-bold">🌱 EcoChat Assistant</div>
    <button
          onClick={() => navigate("/dashboard")}
          className="absolute right-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Dashboard
        </button>
  </div>

  {/* CPU Usage (centered) and Green Credits (right-aligned) */}
  <div className="bg-gray-200 p-2 flex justify-between items-center text-sm px-4">
    <div className="flex-1"></div> {/* Empty div for spacing */}
    <div className="text-center flex-1 font-medium">CPU Usage: {usageMetrics.cpu}%</div>
    <div className="text-lg font-bold flex-1 text-right">Green Credits: {greenCredits} 🌿</div>
  </div>

  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`p-3 max-w-lg rounded-lg ${
          msg.sender === "user" ? "bg-green-600 text-white self-end ml-auto" : "bg-white text-gray-800 self-start shadow-sm"
        }`}
      >
        {msg.text.split("\n").map((line, i) => (
          <p key={i} className="mb-1 last:mb-0">{line}</p>
        ))}
      </div>
    ))}
    <div ref={chatEndRef} />
  </div>

  <div className="bg-white p-4 flex items-center border-t">
    <input
      type="text"
      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Type your message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
    />
    <button onClick={handleSend} className="ml-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
      Send
    </button>
  </div>
</div>

  );
};

export default ChatPage;
