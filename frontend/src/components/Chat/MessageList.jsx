import React, { useState, useEffect, useRef } from "react";
import { messageAPI } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const MessageList = ({ roomId, onNewMessage }) => {
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);

  const { user } = useAuth();

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
      socket.once("connect", () => {
        console.log("Socket connected, setting up listeners now");
        setupSocketListeners();
      });
      return;
    }

    console.log("Setting up socket listeners for room:", roomId);
    console.log("Socket connected:", socket.connected, "Socket ID:", socket.id);

    cleanupSocketListeners();

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

      const currentRoomId = Number(roomId);
      const messageRoomId = Number(message.roomId);

      if (messageRoomId === currentRoomId) {
        console.log("Room IDs match! Adding message to list");
        setMessages((prevMessages) => {
          const messageExists = prevMessages.find((m) => m.id === message.id);

          if (messageExists) {
            console.log(
              "Message already exists (ID:",
              message.id,
              "), skipping"
            );
            return prevMessages;
          }

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

    const handleUserTyping = (data) => {
      if (data.userId !== user?.userId) {
        setTypingUsers((prevUsers) => {
          const userExists = prevUsers.find((u) => u.userId === data.userId);
          if (!userExists) {
            return [...prevUsers, data];
          }
          return prevUsers;
        });
      }
    };

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

    socket.on("message_received", handleMessageReceived);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("user_joined_room", handleUserJoined);
    socket.on("user_left_room", handleUserLeft);

    console.log("✅ Socket listeners registered for room:", roomId);
    console.log("Listeners will receive messages for room:", roomId);
  };

  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      setupSocketListeners();

      const socket = getSocket();
      if (socket) {
        const handleRoomJoined = (data) => {
          console.log("Room joined confirmation received:", data);
          setupSocketListeners();
        };

        socket.on("room_joined", handleRoomJoined);

        return () => {
          socket.off("room_joined", handleRoomJoined);
          cleanupSocketListeners();
        };
      } else {
        return () => {
          cleanupSocketListeners();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (onNewMessage && onNewMessage.roomId === roomId) {
      console.log("Adding optimistic message:", onNewMessage);
      setMessages((prevMessages) => {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-neutral-200">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
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
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.userId === user?.userId
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {message.userId !== user?.userId && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.username}
                    </div>
                  )}
                  <div>{message.content}</div>
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

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 italic mt-2">
          {typingUsers.map((u) => u.username).join(", ")} typing...
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
