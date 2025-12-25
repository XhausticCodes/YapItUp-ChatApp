import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const MessageInput = ({ roomId, onMessageSent }) => {
  const [message, setMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);

  const { user } = useAuth();

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      const socket = getSocket();
      if (socket && socket.connected && roomId) {
        socket.emit("typing_stop", { roomId });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const socket = getSocket();
      if (socket && socket.connected && roomId) {
        socket.emit("typing_start", { roomId });
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !roomId) return;

    const messageContent = message.trim();

    setMessage("");
    stopTyping();

    const tempMessage = {
      id: Date.now(),
      roomId: roomId,
      userId: user?.userId,
      username: user?.username,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    if (onMessageSent) {
      onMessageSent(tempMessage);
    }

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
    <div className="p-4 bg-neutral-700 border-t border-gray-300">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
