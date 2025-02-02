import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Donations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditData, setCreditData] = useState({ current: 0, donated: 0 });
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchCurrentCredits();
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Fetch current credits from backend
  const fetchCurrentCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/user-credits?user_id=${user?.uid || "guest-user"}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setCreditData(prev => ({ ...prev, current: data.green_credits }));
    } catch (err) {
      setError("Failed to load credits. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle donation submission
  const handleDonation = async (e) => {
    e.preventDefault();
    const amount = parseInt(donationAmount, 10);
  
    if (isNaN(amount) || amount < 1 || amount > creditData.current) {
      setError("Invalid donation amount");
      return;
    }
  
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/donate-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.uid || "guest-user",
          amount: amount,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Donation failed");
  
      setCreditData((prev) => ({
        current: prev.current - amount,
        donated: prev.donated + amount,
      }));
  
      setDonationAmount("");
      alert("Donation successful! Thank you for your contribution! 🌍");
    } catch (err) {
      setError(err.message || "Donation failed. Please try again.");
      console.error("Donation error:", err);
    }
  };
  

  // Format numbers with commas
  const formatNumber = (num, decimals = 2) => 
    new Intl.NumberFormat(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }).format(num);

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
            onClick={() => navigate("/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => auth.signOut()}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6">
            Support The Ocean Cleanup
          </h2>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img
              src="https://purewater.eu/wp-content/uploads/2017/12/TheOceanCleanup_Header-768x432.jpg"
              alt="The Ocean Cleanup logo"
              className="w-85 h-48 object-contain mx-auto"
            />
            <div>
              <p className="mb-4">
                The Ocean Cleanup is a non-profit organization developing and scaling
                technologies to rid the world's oceans of plastic. For every 100
                green credits you donate, we'll contribute $1 to support their efforts.
              </p>
              <p className="font-semibold">
                Your available credits: {formatNumber(creditData.current, 0)} 🌿
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleDonation} className="flex flex-col gap-4">
            <div>
              <label htmlFor="credits" className="block mb-2 font-medium">
                Credits to donate (100 credits = $1)
              </label>
              <input
                type="number"
                id="credits"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter credits to donate"
                min="1"
                max={creditData.current}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition self-start"
            >
              Donate Credits
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Donations;