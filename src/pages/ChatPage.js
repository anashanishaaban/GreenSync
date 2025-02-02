import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Use environment variable for backend API URL, default to same origin
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
const CHAT_API_URL = `${API_BASE_URL}/chat`;
const METRICS_API_URL = `${API_BASE_URL}/current-hardware-metrics`;

const INITIAL_MESSAGE = "Hello! I'm your eco-friendly AI assistant. Let's chat while saving the planet! 🌍";

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ text: INITIAL_MESSAGE, sender: "bot" }]);
  const [input, setInput] = useState("");
  const [usageMetrics, setUsageMetrics] = useState({ cpu: 0, gpu: 0 });
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodically fetch hardware metrics from the backend
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

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, user_id: user?.uid || "guest-user" }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.response && data.response.content) {
        setMessages((prev) => [...prev, { text: data.response.content, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Error: No response from AI!", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "Server error. Please try again later!", sender: "bot" }]);
    }

    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-md p-4 text-center text-xl font-bold">
        🌱 EcoChat Assistant
      </div>

      {/* Display current CPU usage */}
      <div className="bg-gray-200 p-2 text-center text-sm">
        CPU Usage: {usageMetrics.cpu}%
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