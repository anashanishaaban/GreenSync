import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-green-100 text-center p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Chat & Save the Environment 🌱
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Start a conversation powered by sustainable AI!
      </p>
      <button
        onClick={() => navigate("/chat")}
        className="bg-green-600 text-white px-6 py-3 rounded-full text-lg hover:bg-green-700 transition"
      >
        Start Chatting 🌍
      </button>
    </div>
  );
};

export default LandingPage;
