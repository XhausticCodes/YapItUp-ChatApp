package com.yapitup.chat.controller;

import com.yapitup.chat.dto.MessageDTO;
import com.yapitup.chat.dto.SendMessageRequest;
import com.yapitup.chat.service.MessageService;
import com.yapitup.chat.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for message endpoints
 */
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
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
     * Send a message
     */
    @PostMapping
    public ResponseEntity<?> sendMessage(@Valid @RequestBody SendMessageRequest request,
                                       HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }
        
        try {
            MessageDTO message = messageService.sendMessage(
                request.getRoomId(), 
                userId, 
                request.getContent()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Get messages for a room
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByRoom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<MessageDTO> messages = messageService.getMessagesByRoom(roomId, page, size);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Get all messages for a room (simpler endpoint)
     */
    @GetMapping("/room/{roomId}/all")
    public ResponseEntity<List<MessageDTO>> getAllMessagesByRoom(@PathVariable Long roomId) {
        List<MessageDTO> messages = messageService.getAllMessagesByRoom(roomId);
        return ResponseEntity.ok(messages);
    }
}