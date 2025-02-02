import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Firebase for user authentication

const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
const USER_CREDITS_API_URL = `${API_BASE_URL}/user-credits`;
const USER_STATS_API_URL = `${API_BASE_URL}/user-statistics`; // New API to fetch emissions & water savings

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    greenCredits: 0,
    savedEmissions: 0,
    consumedEmissions: 0,
    waterSavedLiters: 0,
    waterSavedFlOz: 0
  });

  // Fetch authenticated user info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserStats(user.uid);
      } else {
        navigate("/login"); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch user statistics (Green Credits, Emissions, Water Saved)
  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`${USER_STATS_API_URL}?user_id=${userId}`);
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      const data = await response.json();
      setStats({
        greenCredits: data.green_credits,
        savedEmissions: data.saved_emissions,
        consumedEmissions: data.consumed_emissions,
        waterSavedLiters: data.water_saved_liters,
        waterSavedFlOz: data.water_saved_fl_oz
      });
    } catch (error) {
      console.error("Error fetching user statistics:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center px-6">
        {/* GreenSync Button (Top Left) */}
        <button
          onClick={() => navigate("/")}
          className="text-green-600 font-semibold hover:text-green-800 transition text-lg"
        >
          GreenSync
        </button>

        <div className="text-xl font-bold">Dashboard</div>

        {/* Chat Now Button (Top Right) */}
        <button
          onClick={() => navigate("/chat")}
          className="text-green-600 font-semibold hover:text-green-800 transition text-lg"
        >
          Chat Now
        </button>
      </div>

      {/* User Info Section */}
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold">Welcome, {user?.email}</h2>
        <p className="text-gray-500">Your environmental impact overview</p>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Green Credits */}
        <div className="bg-white shadow-md p-6 rounded-lg w-3/4 text-center">
          <h3 className="text-lg font-bold text-green-600">🌿 Green Credits</h3>
          <p className="text-2xl font-semibold">{stats.greenCredits}</p>
        </div>

        {/* Saved Emissions */}
        <div className="bg-white shadow-md p-6 rounded-lg w-3/4 text-center">
          <h3 className="text-lg font-bold text-blue-600">🌎 CO₂ Saved</h3>
          <p className="text-2xl font-semibold">{stats.savedEmissions} kg</p>
        </div>

        {/* Consumed Emissions */}
        <div className="bg-white shadow-md p-6 rounded-lg w-3/4 text-center">
          <h3 className="text-lg font-bold text-red-600">🔥 CO₂ Consumed</h3>
          <p className="text-2xl font-semibold">{stats.consumedEmissions} kg</p>
        </div>

        {/* Water Saved */}
        <div className="bg-white shadow-md p-6 rounded-lg w-3/4 text-center">
          <h3 className="text-lg font-bold text-blue-500">💧 Water Saved</h3>
          <p className="text-2xl font-semibold">
            {stats.waterSavedLiters} L ({stats.waterSavedFlOz} fl oz)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
