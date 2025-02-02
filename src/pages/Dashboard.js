import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Conversion factors (adjust these relative factors as needed)
const DATA_CENTER_EMISSION_FACTOR = 0.012 / 20; // kg CO₂ per credit
const LOCAL_COMPUTE_EMISSION_FACTOR = 0.002 / 20; // kg CO₂ per credit
const WATER_SAVING_LITERS_PER_CREDIT = 0.1 / 20; // liters saved per credit

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [greenCredits, setGreenCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

// In fetchCredits function:
const fetchCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      // Match the ChatPage's API URL structure exactly
      const response = await fetch(
        `http://localhost:8000/user-credits?user_id=${user?.uid || "guest-user"}`
      );
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      // Ensure we're using the same response structure as ChatPage
      setGreenCredits(data.green_credits || 0);
    } catch (err) {
      setError("Failed to load credits. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // In useEffect for initial load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch credits immediately after auth resolves
        await fetchCredits();
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Calculate environmental impact
  const dataCenterEmissions = greenCredits * DATA_CENTER_EMISSION_FACTOR;
  const localEmissions = greenCredits * LOCAL_COMPUTE_EMISSION_FACTOR;
  const savedEmissions = dataCenterEmissions - localEmissions;
  const waterSavedLiters = greenCredits * WATER_SAVING_LITERS_PER_CREDIT;
  const waterSavedFlOz = waterSavedLiters * 33.814;

  // Format numbers with commas
  const formatNumber = (num, decimals = 2) => 
    new Intl.NumberFormat(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }).format(num);

  // Loading spinner component
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 font-bold text-xl hover:text-green-800 transition-colors"
        >
          GreenSync
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Chat Now
          </button>
          <button
            onClick={() => auth.signOut()}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={fetchCredits}
              className="ml-4 text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Account Overview</h3>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="text-lg font-bold mb-2">Green Credits</h4>
              <p className="text-2xl">
                {formatNumber(greenCredits, 0)} 🌿
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="text-lg font-bold mb-2">Emissions (kg CO₂)</h4>
              <p>
                <strong>Data Center:</strong>{" "}
                {formatNumber(dataCenterEmissions, 3)}
              </p>
              <p>
                <strong>Local Compute:</strong>{" "}
                {formatNumber(localEmissions, 3)}
              </p>
              <p className="text-green-600">
                <strong>Total Saved:</strong>{" "}
                {formatNumber(savedEmissions, 3)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="text-lg font-bold mb-2">Water Savings</h4>
              <p>
                <strong>Liters:</strong> {formatNumber(waterSavedLiters)} L
              </p>
              <p>
                <strong>Fluid Ounces:</strong> {formatNumber(waterSavedFlOz)} fl oz
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;