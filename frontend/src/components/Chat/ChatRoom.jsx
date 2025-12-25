import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../services/socket";
import { roomAPI } from "../../services/api";
import RoomList from "./RoomList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

/**
 * ChatRoom Component
 * This is the main chat interface component
 * It manages the selected room and coordinates between RoomList, MessageList, and MessageInput
 */
const ChatRoom = () => {
  // Get user info and logout function from context
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State to store the currently selected room
  const [selectedRoom, setSelectedRoom] = useState(null);

  // State to track if socket is connected
  const [socketConnected, setSocketConnected] = useState(false);

  // State to store the latest message (for optimistic updates)
  const [latestMessage, setLatestMessage] = useState(null);

  // State to force room list reloads
  const [roomListRefreshKey, setRoomListRefreshKey] = useState(0);

  // Set up socket connection listeners
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      // When socket connects
      const handleConnect = () => {
        setSocketConnected(true);
        console.log("Socket connected");

        // If we have a selected room, rejoin it
        if (selectedRoom) {
          console.log("Rejoining room:", selectedRoom.id);
          socket.emit("join_room", { roomId: selectedRoom.id });
        }
      };

      // When socket disconnects
      const handleDisconnect = () => {
        setSocketConnected(false);
        console.log("Socket disconnected");
      };

      // When socket error occurs
      const handleError = (error) => {
        console.error("Socket error:", error);
        if (error.message === "Unauthorized") {
          // If unauthorized, logout and go to login page
          logout();
          navigate("/login");
        }
      };

      // Register event listeners
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("error", handleError);

      // If already connected, call handleConnect immediately
      if (socket.connected) {
        handleConnect();
      }

      // Clean up listeners when component unmounts
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("error", handleError);
      };
    }
  }, [logout, navigate, selectedRoom]);

  /**
   * Handle when user selects a room from the room list
   */
  const handleSelectRoom = async (room) => {
    // Leave the previous room if one was selected
    if (selectedRoom) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("leave_room", { roomId: selectedRoom.id });
      }
    }

    // Set the new room as selected
    setSelectedRoom(room);

    // Join the room via REST API (adds user to room in database)
    try {
      await roomAPI.join(room.id);
      console.log("Joined room via REST API:", room.id);
    } catch (error) {
      console.error("Error joining room:", error);
    }

    // Join the room via Socket.IO (for real-time messaging)
    const socket = getSocket();
    if (socket) {
      if (socket.connected) {
        // If socket is already connected, join immediately
        console.log("Socket connected, joining room:", room.id);
        socket.emit("join_room", { roomId: room.id });
      } else {
        // If socket is not connected, wait for connection then join
        console.log("Socket not connected, waiting for connection...");
        socket.once("connect", () => {
          console.log("Socket connected, joining room:", room.id);
          socket.emit("join_room", { roomId: room.id });
        });
      }
    } else {
      console.error("Socket not available!");
    }
  };

  /**
   * Handle when a new message is sent
   * This receives the optimistic message from MessageInput
   */
  const handleNewMessage = (message) => {
    console.log("New message sent, showing optimistically:", message);
    // Store the message so MessageList can display it immediately
    setLatestMessage(message);

    // Clear it after a short delay (MessageList will have received it by then)
    setTimeout(() => {
      setLatestMessage(null);
    }, 100);
  };

  /**
   * Leave the currently selected room
   */
  const handleLeaveRoom = async () => {
    if (!selectedRoom) return;

    try {
      await roomAPI.leave(selectedRoom.id);
      console.log("Left room via REST:", selectedRoom.id);
    } catch (error) {
      console.error("Error leaving room:", error);
      alert("Something went wrong while leaving the room.");
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("leave_room", { roomId: selectedRoom.id });
    }

    setSelectedRoom(null);
    setLatestMessage(null);
    setRoomListRefreshKey((prev) => prev + 1);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // Leave the current room if one is selected
    if (selectedRoom) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("leave_room", { roomId: selectedRoom.id });
      }
    }

    // Call logout function from context
    logout();

    // Navigate to login page
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Bar */}
      <div className="bg-neutral-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">YapItUp Chat</h1>
          <div className="text-sm opacity-90">
            Welcome, {user?.username}!{/* Show connection status */}
            <span
              className={`ml-2 ${
                socketConnected ? "text-green-300" : "text-red-300"
              }`}
            >
              {socketConnected ? "● Connected" : "● Disconnected"}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Room List Sidebar */}
        <RoomList
          onSelectRoom={handleSelectRoom}
          selectedRoomId={selectedRoom?.id}
          refreshKey={roomListRefreshKey}
          onCreateRoom={() => setRoomListRefreshKey((prev) => prev + 1)}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Room Header */}
              <div className="bg-neutral-700 p-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl text-white font-semibold">{selectedRoom.name}</h2>
                  {selectedRoom.description && (
                    <p className="text-sm text-white/70">
                      {selectedRoom.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="self-start md:self-auto bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 text-sm font-semibold"
                >
                  Leave Room
                </button>
              </div>

              {/* Message List */}
              <MessageList
                roomId={selectedRoom.id}
                onNewMessage={latestMessage}
              />

              {/* Message Input */}
              <MessageInput
                roomId={selectedRoom.id}
                onMessageSent={handleNewMessage}
              />
            </>
          ) : (
            // Show message when no room is selected
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl mb-2">
                  Select a room to start chatting
                </h2>
                <p>Choose a room from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
