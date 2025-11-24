import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { getSocket } from "../services/socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on initial load
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Connect socket if token exists
        connectSocket(token);
        
        // If user info is not in state but token exists, restore from localStorage
        if (!user) {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token, user]);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token: newToken, username: userUsername, userId } = response.data;

      const userData = { username: userUsername, userId };
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // Connect socket
      connectSocket(newToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register({ username, email, password });
      const { token: newToken, username: userUsername, userId } = response.data;

      const userData = { username: userUsername, userId };
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // Connect socket
      connectSocket(newToken);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);

      let errorMessage = "Registration failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Is the backend running?";
      } else {
        errorMessage = error.message || "Registration failed";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    // Leave room if in one
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.disconnect();
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};