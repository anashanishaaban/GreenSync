import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">

    {/* Header with Logo */}
    <div className="absolute top-4 left-4 flex items-center space-x-2">
        {/* Logo will be here*/}
        <span className="text-white text-xl font-bold">GreenSync</span>
    </div>

    {/* Top Right - Login Button */}
    <button
        onClick={() => navigate("/login")}
        className="absolute top-4 right-4 text-white bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
      >
        Login
    </button>


    {/* Blurry Moving Background */}
    <div className="blurry-bg">
    <div className="blurry-shape top-0 left-0"></div>
    <div className="blurry-shape top-1/3 right-1/3"></div>
    <div className="blurry-shape bottom-0 left-1/2"></div>
    </div>

      {/* Main Content */}
      <h1 className="text-5xl font-bold text-white mb-6">Chat & Save the Environment 🌱</h1>
      <p className="text-lg text-gray-300 mb-8">
        Join the decentralized AI movement for a sustainable future.
      </p>
      <button
        onClick={() => navigate("/chat")}
        className="bg-white text-black px-6 py-3 rounded-full text-lg hover:bg-gray-300 transition"
      >
        Start Chatting 🌍
      </button>
    </div>
  );
};

export default LandingPage;
