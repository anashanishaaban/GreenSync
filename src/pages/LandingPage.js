import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../firebase"; // Import logout function

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      logout(); // Log out if user is logged in
    } else {
      navigate("/login"); // Navigate to login if not logged in
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Header with Logo & Auth Button */}
      <div className="absolute top-4 left-0 w-full flex justify-between items-center px-8">
        <span className="text-white text-xl font-bold">GreenSync</span>
        <button
          onClick={handleAuthAction}
          className="text-white text-xl font-bold hover:text-gray-400 transition-colors"
        >
          {isLoggedIn ? "Sign Out" : "Login"}
        </button>
      </div>

      {/* Blurry Moving Background */}
      <div className="blurry-bg">
        <div className="blurry-shape top-0 left-0"></div>
        <div className="blurry-shape top-1/3 right-1/3"></div>
        <div className="blurry-shape bottom-0 left-1/2"></div>
      </div>

      {/* Main Content */}
      <h1 className="text-5xl font-bold text-white mb-6">
        Chat & Save the Environment 🌱
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Join the decentralized AI movement for a sustainable future.
      </p>
      <button
        onClick={() => navigate(isLoggedIn ? "/chat" : "/login")}
        className="bg-white text-black px-6 py-3 rounded-full text-lg hover:bg-gray-300 transition"
      >
        {isLoggedIn ? "Go to Chat" : "Start Chatting"}
      </button>
    </div>
  );
};

export default LandingPage;
