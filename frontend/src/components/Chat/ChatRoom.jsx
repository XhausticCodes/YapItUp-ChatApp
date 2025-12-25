import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../services/socket";
import { roomAPI } from "../../services/api";
import RoomList from "./RoomList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [socketConnected, setSocketConnected] = useState(false);

  const [latestMessage, setLatestMessage] = useState(null);

  const [roomListRefreshKey, setRoomListRefreshKey] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleConnect = () => {
        setSocketConnected(true);
        console.log("Socket connected");

        if (selectedRoom) {
          console.log("Rejoining room:", selectedRoom.id);
          socket.emit("join_room", { roomId: selectedRoom.id });
        }
      };

      const handleDisconnect = () => {
        setSocketConnected(false);
        console.log("Socket disconnected");
      };

      const handleError = (error) => {
        console.error("Socket error:", error);
        if (error.message === "Unauthorized") {
          logout();
          navigate("/login");
        }
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("error", handleError);

      if (socket.connected) {
        handleConnect();
      }

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("error", handleError);
      };
    }
  }, [logout, navigate, selectedRoom]);

  const handleSelectRoom = async (room) => {
    if (selectedRoom) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("leave_room", { roomId: selectedRoom.id });
      }
    }

    setSelectedRoom(room);

    try {
      await roomAPI.join(room.id);
      console.log("Joined room via REST API:", room.id);
    } catch (error) {
      console.error("Error joining room:", error);
    }

    const socket = getSocket();
    if (socket) {
      if (socket.connected) {
        console.log("Socket connected, joining room:", room.id);
        socket.emit("join_room", { roomId: room.id });
      } else {
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

  const handleNewMessage = (message) => {
    console.log("New message sent, showing optimistically:", message);
    setLatestMessage(message);

    setTimeout(() => {
      setLatestMessage(null);
    }, 100);
  };

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

  const handleLogout = () => {
    if (selectedRoom) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("leave_room", { roomId: selectedRoom.id });
      }
    }

    logout();

    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-neutral-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">YapItUp Chat</h1>
          <div className="text-sm opacity-90">
            Welcome, {user?.username}!
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

      <div className="flex flex-1 overflow-hidden">
        <RoomList
          onSelectRoom={handleSelectRoom}
          selectedRoomId={selectedRoom?.id}
          refreshKey={roomListRefreshKey}
          onCreateRoom={() => setRoomListRefreshKey((prev) => prev + 1)}
        />

        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              <div className="bg-neutral-700 p-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl text-white font-semibold">
                    {selectedRoom.name}
                  </h2>
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

              <MessageList
                roomId={selectedRoom.id}
                onNewMessage={latestMessage}
              />

              <MessageInput
                roomId={selectedRoom.id}
                onMessageSent={handleNewMessage}
              />
            </>
          ) : (
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
