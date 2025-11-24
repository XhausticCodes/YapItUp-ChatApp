import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

/**
 * MessageInput Component
 * This component allows users to type and send messages
 * It also handles typing indicators
 */
const MessageInput = ({ roomId, onMessageSent }) => {
  // State to store the message being typed
  const [message, setMessage] = useState("");

  // State to track if user is currently typing
  const [isTyping, setIsTyping] = useState(false);

  // Reference to store the typing timeout
  const typingTimeoutRef = useRef(null);

  // Get current user info
  const { user } = useAuth();

  /**
   * Stop the typing indicator
   */
  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      const socket = getSocket();
      if (socket && socket.connected && roomId) {
        socket.emit("typing_stop", { roomId });
      }
    }
  };

  // Clean up when component unmounts or room changes
  useEffect(() => {
    return () => {
      // Clear the typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing indicator
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /**
   * Handle when user starts typing
   * This sends a "typing" indicator to other users
   */
  const handleTyping = () => {
    // If not already typing, start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      const socket = getSocket();
      if (socket && socket.connected && roomId) {
        socket.emit("typing_start", { roomId });
      }
    }

    // Clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  /**
   * Handle form submission (when user presses Enter or clicks Send)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Don't send empty messages
    if (!message.trim() || !roomId) return;

    const messageContent = message.trim();

    // Clear the input field immediately
    setMessage("");
    stopTyping();

    // Create a temporary message object to show immediately (optimistic update)
    const tempMessage = {
      id: Date.now(), // Temporary ID (will be replaced by server)
      roomId: roomId,
      userId: user?.userId,
      username: user?.username,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // Mark as temporary
    };

    // Notify parent component about the new message (to show it immediately)
    if (onMessageSent) {
      onMessageSent(tempMessage);
    }

    // Send message to server via Socket.IO
    const socket = getSocket();
    if (socket) {
      if (socket.connected) {
        console.log(
          "Sending message via socket:",
          messageContent,
          "to room:",
          roomId
        );
        socket.emit("send_message", {
          roomId: roomId,
          content: messageContent,
        });
      } else {
        console.error("Socket not connected! Waiting for connection...");
        // Wait for connection and then send
        socket.once("connect", () => {
          console.log("Socket connected, sending message now");
          socket.emit("send_message", {
            roomId: roomId,
            content: messageContent,
          });
        });
      }
    } else {
      console.error("Socket not available!");
      alert("Not connected to server. Please refresh the page.");
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-300">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping(); // Show typing indicator
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
