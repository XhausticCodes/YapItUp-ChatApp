import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ColorBends from "../../../public/ColorBends/ColorBends.jsx";
import FloatingLines from "../../../public/FloatingLines/FloatingLines.jsx";
import Particles from "../../../public/Particles/Particles.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const errors = {
      username: "",
      password: "",
    };

    if (!trimmedUsername) {
      errors.username = "Username is required.";
    } else if (trimmedUsername.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }

    if (!trimmedPassword) {
      errors.password = "Password is required.";
    } else if (trimmedPassword.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    setUsername(trimmedUsername);
    setPassword(trimmedPassword);

    setLoading(true);

    try {
      const result = await login(trimmedUsername, trimmedPassword);

      if (result.success) {
        navigate("/chat");
      } else {
        setError(result.error || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login failed", err);
      setError(err?.message || "Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* <ColorBends
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ position: "absolute", backgroundColor: "black" }}
        colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
        rotation={0}
        autoRotate={0}
        speed={0.2}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.5}
        noise={0.1}
        transparent
      /> */}
      <FloatingLines
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ position: "absolute" }}
        enabledWaves={["top", "middle", "bottom"]}
        // Array - specify line count per wave; Number - same count for all waves
        lineCount={[5, 5, 5]}
        // Array - specify line distance per wave; Number - same distance for all waves
        lineDistance={[100, 100, 100]}
        bendRadius={30}
        bendStrength={15}
        interactive={true}
        parallax={true}
      />
      <Particles
        className="absolute inset-0 -z-110 pointer-events-none bg-black"
        style={{ position: "absolute" }}
        particleColors={["#3B82F6","#A855F7"]}
        particleCount={150}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl px-10 py-10 rounded-2xl shadow-xl w-[400px] max-w-md">
        <h2 className="text-5xl font-bold text-center mb-10 text-white tracking-wider">
          LOGIN
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            {fieldErrors.username && (
              <p className="text-center mt-1 text-sm text-red-500">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            {fieldErrors.password && (
              <p className="text-center mt-1 text-sm text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
