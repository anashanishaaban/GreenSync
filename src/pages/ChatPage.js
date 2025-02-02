import React, { useState, useEffect, useRef } from "react";

const API_URL = "http://35.21.142.150:8000/chat"; // Replace with your local IP
const INITIAL_MESSAGE = "Hello! I'm your eco-friendly AI assistant. Let's chat while saving the planet! 🌍";

const ChatPage = () => {
  const [messages, setMessages] = useState([{ text: INITIAL_MESSAGE, sender: "bot" }]);
  const [input, setInput] = useState("");
  const [chatStart, setChatStart] = useState(null);
  const [usageMetrics, setUsageMetrics] = useState({ cpu: 0, gpu: 0 });
  const chatEndRef = useRef(null);

  // Simulate hardware monitoring (replace with actual metrics collection)
  useEffect(() => {
    const interval = setInterval(() => {
      setUsageMetrics({
        cpu: Math.random() * 30 + 10,  // Simulated CPU usage 10-40%
        gpu: Math.random() * 20 + 15   // Simulated GPU usage 15-35%
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;
  
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
  
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
  
      const data = await response.json();
      console.log("API Response:", data); // ✅ Debugging output
  
      if (response.ok && data.response) {
        const botMessage = data.response.content || "No content received"; // ✅ Extract content
        setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Error: No response from AI!", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "Server error. Please try again later!", sender: "bot" }]);
    }
  
    setInput(""); // Clear input field
  };
  

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-md p-4 text-center text-xl font-bold">
        🌱 EcoChat Assistant
      </div>

      {/* System Metrics */}
      <div className="bg-green-50 p-2 text-sm text-center">
        🖥 CPU: {usageMetrics.cpu.toFixed(1)}% | 🎮 GPU: {usageMetrics.gpu.toFixed(1)}%
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 max-w-lg rounded-lg ${
              msg.sender === "user"
                ? "bg-green-600 text-white self-end ml-auto"
                : "bg-white text-gray-800 self-start shadow-sm"
            }`}
          >
            {msg.text.split('\n').map((line, i) => (
              <p key={i} className="mb-1 last:mb-0">{line}</p>
            ))}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <div className="bg-white p-4 flex items-center border-t">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;