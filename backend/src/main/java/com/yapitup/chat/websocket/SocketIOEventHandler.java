package com.yapitup.chat.websocket;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.yapitup.chat.dto.MessageDTO;
import com.yapitup.chat.model.ChatRoom;
import com.yapitup.chat.model.Message;
import com.yapitup.chat.model.User;
import com.yapitup.chat.repository.ChatRoomRepository;
import com.yapitup.chat.repository.MessageRepository;
import com.yapitup.chat.repository.UserRepository;
import com.yapitup.chat.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Socket.IO Event Handler Handles real-time events like joining rooms, sending
 * messages, typing indicators
 */
@Component
public class SocketIOEventHandler {

    @Autowired
    private SocketIOServer socketIOServer;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Store user's current room
    private Map<String, Long> userRooms = new HashMap<>();

    @PostConstruct
    public void start() {
        socketIOServer.start();
        System.out.println("🚀 Socket.IO server started on port " + socketIOServer.getConfiguration().getPort());
    }

    @PreDestroy
    public void stop() {
        socketIOServer.stop();
        System.out.println("Socket.IO server stopped");
    }

    /**
     * Handle client connection
     */
    @OnConnect
    public void onConnect(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        if (token != null && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.extractUserId(token);
            String username = jwtUtil.extractUsername(token);

            // Store user info in client session
            client.set("userId", userId);
            client.set("username", username);

            // Update user online status
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setIsOnline(true);
                userRepository.save(user);
            }

            System.out.println("Client connected: " + username + " (ID: " + userId + ")");
        } else {
            System.out.println("Client connected without valid token");
        }
    }

    /**
     * Handle client disconnection
     */
    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        Long userId = client.get("userId");
        if (userId != null) {
            // Update user online status
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setIsOnline(false);
                userRepository.save(user);
            }

            // Remove from room tracking
            String sessionId = client.getSessionId().toString();
            Long roomId = userRooms.remove(sessionId);

            if (roomId != null) {
                // Notify others in the room that user left
                client.getNamespace().getRoomOperations(String.valueOf(roomId))
                        .sendEvent("user_left_room", Map.of("userId", userId));
            }

            System.out.println("Client disconnected: " + userId);
        }
    }

    /**
     * Handle join room event
     */
    @OnEvent("join_room")
    public void onJoinRoom(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        if (userId == null) {
            client.sendEvent("error", Map.of("message", "Unauthorized"));
            return;
        }

        Long roomId = Long.valueOf(data.get("roomId").toString());
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);

        if (roomOpt.isEmpty()) {
            client.sendEvent("error", Map.of("message", "Room not found"));
            return;
        }

        // Leave previous room if any
        String sessionId = client.getSessionId().toString();
        Long previousRoomId = userRooms.get(sessionId);
        if (previousRoomId != null && !previousRoomId.equals(roomId)) {
            client.leaveRoom(String.valueOf(previousRoomId));
        }

        // Join new room
        client.joinRoom(String.valueOf(roomId));
        userRooms.put(sessionId, roomId);

        // Get user info
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> userInfo = Map.of(
                    "userId", user.getId(),
                    "username", user.getUsername()
            );

            // Notify others in the room
            client.getNamespace().getRoomOperations(String.valueOf(roomId))
                    .sendEvent("user_joined_room", userInfo);

            // Confirm to client
            client.sendEvent("room_joined", Map.of("roomId", roomId, "message", "Joined room successfully"));

            System.out.println("User " + user.getUsername() + " joined room " + roomId);
        }
    }

    /**
     * Handle leave room event
     */
    @OnEvent("leave_room")
    public void onLeaveRoom(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        if (userId == null) {
            client.sendEvent("error", Map.of("message", "Unauthorized"));
            return;
        }

        Long roomId = Long.valueOf(data.get("roomId").toString());
        String sessionId = client.getSessionId().toString();

        client.leaveRoom(String.valueOf(roomId));
        userRooms.remove(sessionId);

        Optional<User> userOpt = userRepository.findById(userId);
        String username = userOpt.map(User::getUsername).orElse("User");

        // Notify others in the room
        client.getNamespace().getRoomOperations(String.valueOf(roomId))
                .sendEvent("user_left_room", Map.of(
                        "userId", userId,
                        "username", username
                ));

        client.sendEvent("room_left", Map.of("roomId", roomId, "message", "Left room successfully"));

        System.out.println("User " + userId + " left room " + roomId);
    }

    /**
     * Handle send message event
     */
    @OnEvent("send_message")
    public void onSendMessage(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        if (userId == null) {
            client.sendEvent("error", Map.of("message", "Unauthorized"));
            return;
        }

        Long roomId = Long.valueOf(data.get("roomId").toString());
        String content = data.get("content").toString();

        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (roomOpt.isEmpty() || userOpt.isEmpty()) {
            client.sendEvent("error", Map.of("message", "Room or user not found"));
            return;
        }

        // Ensure client is in the room (join if not already)
        String roomIdStr = String.valueOf(roomId);
        if (!client.getAllRooms().contains(roomIdStr)) {
            client.joinRoom(roomIdStr);
            System.out.println("Auto-joined user " + userId + " to room " + roomId);
        }

        // Save message to database
        Message message = new Message();
        message.setRoom(roomOpt.get());
        message.setUser(userOpt.get());
        message.setContent(content);
        Message savedMessage = messageRepository.save(message);

        // Convert to DTO
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(savedMessage.getId());
        messageDTO.setRoomId(savedMessage.getRoom().getId());
        messageDTO.setUserId(savedMessage.getUser().getId());
        messageDTO.setUsername(savedMessage.getUser().getUsername());
        messageDTO.setContent(savedMessage.getContent());
        if (savedMessage.getCreatedAt() != null) {
            messageDTO.setCreatedAt(savedMessage.getCreatedAt().toString());
        }

        // Get room operations for broadcasting
        var roomOps = client.getNamespace().getRoomOperations(roomIdStr);

        // Get number of clients in the room for debugging
        int clientsInRoom = roomOps.getClients().size();
        System.out.println("📢 Broadcasting message to room " + roomId + " - Clients in room: " + clientsInRoom);
        System.out.println("Message content: " + content);
        System.out.println("Message from user: " + userOpt.get().getUsername() + " (ID: " + userId + ")");

        // Broadcast to all clients in the room (including sender)
        roomOps.sendEvent("message_received", messageDTO);

        System.out.println("✅ Message event sent to " + clientsInRoom + " client(s) in room " + roomId);

        System.out.println("✅ Message broadcasted to room " + roomId + " by user " + userId);
    }

    /**
     * Handle typing start event
     */
    @OnEvent("typing_start")
    public void onTypingStart(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        if (userId == null) {
            return;
        }

        Long roomId = Long.valueOf(data.get("roomId").toString());
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            Map<String, Object> typingInfo = Map.of(
                    "userId", userId,
                    "username", userOpt.get().getUsername()
            );

            // Notify others in the room (except sender)
            client.getNamespace().getRoomOperations(String.valueOf(roomId))
                    .sendEvent("user_typing", typingInfo);
        }
    }

    /**
     * Handle typing stop event
     */
    @OnEvent("typing_stop")
    public void onTypingStop(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        if (userId == null) {
            return;
        }

        Long roomId = Long.valueOf(data.get("roomId").toString());

        // Notify others in the room
        client.getNamespace().getRoomOperations(String.valueOf(roomId))
                .sendEvent("user_stopped_typing", Map.of("userId", userId));
    }
}
