package com.yapitup.chat.controller;

import com.yapitup.chat.dto.ChatRoomDTO;
import com.yapitup.chat.dto.CreateRoomRequest;
import com.yapitup.chat.service.ChatRoomService;
import com.yapitup.chat.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for chat room endpoints
 */
@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatRoomController {
    
    @Autowired
    private ChatRoomService chatRoomService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Get current user ID from JWT token
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        return null;
    }
    
    /**
     * Get all rooms
     */
    @GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getAllRooms() {
        List<ChatRoomDTO> rooms = chatRoomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * Get room by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoomDTO> getRoomById(@PathVariable Long id) {
        Optional<ChatRoomDTO> room = chatRoomService.getRoomById(id);
        return room.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new room
     */
    @PostMapping
    public ResponseEntity<?> createRoom(@Valid @RequestBody CreateRoomRequest request, 
                                       HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }
        
        try {
            ChatRoomDTO room = chatRoomService.createRoom(
                request.getName(), 
                request.getDescription(), 
                userId
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(room);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Join a room
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<Map<String, String>> joinRoom(@PathVariable Long roomId,
                                                      HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }
        
        boolean success = chatRoomService.joinRoom(roomId, userId);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Joined room successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to join room"));
        }
    }
    
    /**
     * Leave a room
     */
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Map<String, String>> leaveRoom(@PathVariable Long roomId,
                                                         HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }
        
        boolean success = chatRoomService.leaveRoom(roomId, userId);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Left room successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to leave room"));
        }
    }
}