import React, { useState } from "react";
import { register } from "../firebase";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate("/chat"); // Redirect after signup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg">
          Sign Up
        </button>
      </form>
      <button onClick={() => navigate("/login")} className="mt-4 text-gray-400 hover:underline">
        Already have an account? Login
      </button>
    </div>
  );
};

export default RegisterPage;
