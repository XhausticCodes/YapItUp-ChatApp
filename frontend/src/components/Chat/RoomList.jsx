import React, { useState, useEffect } from "react";
import { roomAPI } from "../../services/api";

const RoomList = ({
  onSelectRoom,
  selectedRoomId,
  onCreateRoom,
  refreshKey = 0,
}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  useEffect(() => {
    loadRooms();
    // Refresh rooms every 5 seconds
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reload rooms when refreshKey changes
  useEffect(() => {
    loadRooms();
  }, [refreshKey]);

  const loadRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomAPI.create({
        name: roomName,
        description: roomDescription,
      });
      setRoomName("");
      setRoomDescription("");
      setShowCreateForm(false);
      loadRooms();
      if (onCreateRoom) onCreateRoom();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create room");
    }
  };

  if (loading) {
    return <div className="p-4">Loading rooms...</div>;
  }

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-2">Chat Rooms</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
        >
          {showCreateForm ? "Cancel" : "+ Create Room"}
        </button>
      </div>

      {showCreateForm && (
        <div className="p-4 border-b border-gray-700 bg-gray-700">
          <form onSubmit={handleCreateRoom} className="space-y-2">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
            >
              Create
            </button>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">No rooms available</div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`p-4 cursor-pointer hover:bg-gray-700 border-b border-gray-700 ${
                selectedRoomId === room.id ? "bg-gray-700" : ""
              }`}
            >
              <div className="font-semibold">{room.name}</div>
              {room.description && (
                <div className="text-sm text-gray-400 mt-1">
                  {room.description}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {room.memberCount} member{room.memberCount !== 1 ? "s" : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;
