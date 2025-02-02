import React, { useState, useEffect, useRef } from "react";

// Update for local testing
const API_BASE = "http://localhost:8000";
const CREDITS_API_URL = `${API_BASE}/calculate-credits`;
const HARDWARE_METRICS_URL = `${API_BASE}/current-hardware-metrics`;

// Initial greeting message from the bot.
const INITIAL_MESSAGE = "Hello! I'm your eco-friendly AI assistant. Let's chat while saving the planet! 🌍";

const ChatPage = () => {
  const [messages, setMessages] = useState([{ text: INITIAL_MESSAGE, sender: "bot" }]);
  const [input, setInput] = useState("");
  const [usageMetrics, setUsageMetrics] = useState({ cpu: 0 });
  const [cumulativeMetrics, setCumulativeMetrics] = useState({
    totalSavedEmissions: 0,
    totalGreenCredits: 0,
    totalDataCenterEquivalent: 0,
  });
  const chatEndRef = useRef(null);

  // Poll the backend for real hardware metrics every second.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(HARDWARE_METRICS_URL);
        if (response.ok) {
          const data = await response.json();
          setUsageMetrics({ cpu: data.cpu_usage });
        }
      } catch (error) {
        console.error("Error fetching hardware metrics:", error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update hardware metrics polling
useEffect(() => {
  const fetchMetrics = async () => {
    try {
      const response = await fetch(HARDWARE_METRICS_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUsageMetrics({ cpu: data.cpu_usage || 0 });
    } catch (error) {
      console.error("Error fetching hardware metrics:", error);
      setUsageMetrics(prev => ({ ...prev, error: true }));
    }
  };

  const interval = setInterval(fetchMetrics, 1000);
  return () => clearInterval(interval);
}, []);

  // Auto-scroll to the latest message.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const startTime = Date.now();
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Call the chat endpoint (replace this with your Ollama implementation).
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      let botText = "No content received";
      if (response.ok && data.response) {
        botText = data.response.content || "No content received";
      } else {
        botText = "Error: No response from AI!";
      }
      setMessages((prev) => [...prev, { text: botText, sender: "bot" }]);

      const duration = (Date.now() - startTime) / 1000;
      const metricsPayload = {
        duration: duration,
        cpu_usage: usageMetrics.cpu,
        user_id: "test-user" // Replace with your authenticated user's ID.
      };

      const creditsResponse = await fetch(CREDITS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metricsPayload)
      });
      const creditsData = await creditsResponse.json();
      if (creditsResponse.ok) {
        setCumulativeMetrics((prev) => ({
          totalSavedEmissions: prev.totalSavedEmissions + creditsData.saved_emissions,
          totalGreenCredits: prev.totalGreenCredits + creditsData.green_credits,
          totalDataCenterEquivalent: prev.totalDataCenterEquivalent + creditsData.data_center_comparison,
        }));
      } else {
        console.error("Error calculating credits:", creditsData);
      }
    } catch (error) {
      console.error("Error in chat processing:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Server error. Please try again later!", sender: "bot" }
      ]);
    }
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-md p-4 text-center text-xl font-bold">
        🌱 EcoChat Assistant
      </div>

      {/* Hardware Usage Metrics */}
      <div className="bg-green-50 p-2 text-sm text-center">
        🖥 CPU: {usageMetrics.cpu.toFixed(1)}%
      </div>

      {/* Cumulative Chat Credits and Emissions */}
      <div className="bg-green-100 p-2 text-sm text-center">
        🌿 Saved emissions: {cumulativeMetrics.totalSavedEmissions.toFixed(2)} kg CO₂e |{" "}
        💚 Green credits earned: {cumulativeMetrics.totalGreenCredits.toFixed(2)} |{" "}
        🏭 Data center equivalent: {cumulativeMetrics.totalDataCenterEquivalent.toFixed(2)} kg
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
            {msg.text.split("\n").map((line, i) => (
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
