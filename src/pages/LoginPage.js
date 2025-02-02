import React, { useState } from "react";
import { login } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/chat"); // Redirect to chat after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Login to GreenSync</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Login
        </button>
      </form>
      <button
        onClick={() => navigate("/register")}
        className="mt-4 text-gray-400 hover:underline"
      >
        Don't have an account? Register
      </button>
    </div>
  );
};

export default LoginPage;