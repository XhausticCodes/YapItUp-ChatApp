import React, { useState, useEffect, useRef } from "react";
import { messageAPI } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

/**
 * MessageList Component
 * This component displays all messages in a chat room
 * It listens for new messages from the server via Socket.IO
 */
const MessageList = ({ roomId, onNewMessage }) => {
  // State to store all messages
  const [messages, setMessages] = useState([]);

  // State to show loading indicator
  const [loading, setLoading] = useState(true);

  // State to track who is typing
  const [typingUsers, setTypingUsers] = useState([]);

  // Reference to scroll to bottom of messages
  const messagesEndRef = useRef(null);

  // Get current user info
  const { user } = useAuth();

  /**
   * Load messages from the server
   */
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getByRoom(roomId);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove Socket.IO listeners to prevent memory leaks
   */
  const cleanupSocketListeners = () => {
    const socket = getSocket();
    if (socket) {
      socket.off("message_received");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      socket.off("user_joined_room");
      socket.off("user_left_room");
    }
  };

  /**
   * Helper to add system notification messages (join/leave, etc.)
   */
  const addSystemMessage = (text) => {
    if (!text) return;

    const systemMessage = {
      id: `system-${Date.now()}-${Math.random()}`,
      roomId: Number(roomId),
      userId: null,
      username: "System",
      content: text,
      createdAt: new Date().toISOString(),
      isSystem: true,
    };

    setMessages((prev) => [...prev, systemMessage]);
  };

  /**
   * Set up Socket.IO listeners to receive real-time messages
   */
  const setupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) {
      console.warn("Socket not available for room:", roomId);
      return;
    }

    if (!socket.connected) {
      console.warn(
        "Socket not connected! Cannot set up listeners for room:",
        roomId
      );
      // Wait for connection
      socket.once("connect", () => {
        console.log("Socket connected, setting up listeners now");
        setupSocketListeners();
      });
      return;
    }

    console.log("Setting up socket listeners for room:", roomId);
    console.log("Socket connected:", socket.connected, "Socket ID:", socket.id);

    // Remove old listeners first to avoid duplicates
    cleanupSocketListeners();

    // Listen for new messages from the server
    const handleMessageReceived = (message) => {
      console.log("=== 🔔 MESSAGE RECEIVED EVENT TRIGGERED ===");
      console.log("Full message:", JSON.stringify(message, null, 2));
      console.log("Current roomId:", roomId, "(type:", typeof roomId, ")");
      console.log(
        "Message roomId:",
        message.roomId,
        "(type:",
        typeof message.roomId,
        ")"
      );

      // Convert both to numbers for comparison (in case one is string, one is number)
      const currentRoomId = Number(roomId);
      const messageRoomId = Number(message.roomId);

      // Only add message if it's for the current room
      if (messageRoomId === currentRoomId) {
        console.log("Room IDs match! Adding message to list");
        setMessages((prevMessages) => {
          // Check if message already exists by ID (avoid duplicates)
          const messageExists = prevMessages.find((m) => m.id === message.id);

          if (messageExists) {
            console.log(
              "Message already exists (ID:",
              message.id,
              "), skipping"
            );
            return prevMessages;
          }

          // Remove any optimistic message with the same content and user
          const filteredMessages = prevMessages.filter(
            (m) =>
              !(
                m.isOptimistic &&
                m.content === message.content &&
                m.userId === message.userId
              )
          );

          console.log(
            "Adding new message to list. Total messages:",
            filteredMessages.length + 1
          );
          return [...filteredMessages, message];
        });
      } else {
        console.log("Room IDs don't match! Ignoring message.");
        console.log("Expected:", currentRoomId, "Got:", messageRoomId);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      // Don't show typing indicator for yourself
      if (data.userId !== user?.userId) {
        setTypingUsers((prevUsers) => {
          // Check if user is already in the typing list
          const userExists = prevUsers.find((u) => u.userId === data.userId);
          if (!userExists) {
            return [...prevUsers, data];
          }
          return prevUsers;
        });
      }
    };

    // Listen for when user stops typing
    const handleUserStoppedTyping = (data) => {
      setTypingUsers((prevUsers) =>
        prevUsers.filter((u) => u.userId !== data.userId)
      );
    };

    const handleUserJoined = (data) => {
      console.log("👤 User joined event received:", data);
      addSystemMessage(`${data.username || "Someone"} joined the room`);
    };

    const handleUserLeft = (data) => {
      console.log("🚪 User left event received:", data);
      const displayName = data.username || `User ID ${data.userId}`;
      addSystemMessage(`${displayName} left the room`);
    };

    // Register the event listeners (these persist until cleaned up)
    socket.on("message_received", handleMessageReceived);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("user_joined_room", handleUserJoined);
    socket.on("user_left_room", handleUserLeft);

    console.log("✅ Socket listeners registered for room:", roomId);
    console.log("Listeners will receive messages for room:", roomId);
  };

  // Load messages when room changes
  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Set up socket listeners when room changes
  useEffect(() => {
    if (roomId) {
      // Set up listeners immediately
      setupSocketListeners();

      // Also listen for room_joined confirmation to ensure we're in the room
      const socket = getSocket();
      if (socket) {
        const handleRoomJoined = (data) => {
          console.log("Room joined confirmation received:", data);
          // Re-setup listeners after room join confirmation
          setupSocketListeners();
        };

        socket.on("room_joined", handleRoomJoined);

        // Clean up listeners when component unmounts or room changes
        return () => {
          socket.off("room_joined", handleRoomJoined);
          cleanupSocketListeners();
        };
      } else {
        // Clean up if no socket
        return () => {
          cleanupSocketListeners();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new optimistic messages from parent
  useEffect(() => {
    if (onNewMessage && onNewMessage.roomId === roomId) {
      console.log("Adding optimistic message:", onNewMessage);
      // Add the new message to the list immediately
      setMessages((prevMessages) => {
        // Check if message already exists (avoid duplicates)
        const messageExists = prevMessages.find(
          (m) =>
            m.id === onNewMessage.id ||
            (m.isOptimistic && m.content === onNewMessage.content)
        );
        if (!messageExists) {
          return [...prevMessages, onNewMessage];
        }
        return prevMessages;
      });
    }
  }, [onNewMessage, roomId]);

  /**
   * Scroll to the bottom of the message list
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Format the time to display (e.g., "2:30 PM")
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Show loading indicator while fetching messages
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-neutral-200">
      {/* Show message if no messages exist */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display each message */}
          {messages.map((message) =>
            message.isSystem ? (
              <div
                key={message.id}
                className="flex justify-center text-sm text-gray-500 italic"
              >
                <div className="bg-gray-200 px-3 py-1 rounded-full text-center">
                  {message.content}
                </div>
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === user?.userId
                    ? "justify-end" // Your messages on the right
                    : "justify-start" // Other messages on the left
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.userId === user?.userId
                      ? "bg-blue-500 text-white" // Your messages are blue
                      : "bg-white text-gray-800" // Other messages are white
                  }`}
                >
                  {/* Show username for other users' messages */}
                  {message.userId !== user?.userId && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.username}
                    </div>
                  )}
                  {/* Message content */}
                  <div>{message.content}</div>
                  {/* Message timestamp */}
                  <div
                    className={`text-xs mt-1 ${
                      message.userId === user?.userId
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Show typing indicator */}
      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 italic mt-2">
          {typingUsers.map((u) => u.username).join(", ")} typing...
        </div>
      )}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
