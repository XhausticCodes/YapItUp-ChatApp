package com.yapitup.chat.service;

import com.yapitup.chat.dto.ChatRoomDTO;
import com.yapitup.chat.model.ChatRoom;
import com.yapitup.chat.model.User;
import com.yapitup.chat.repository.ChatRoomRepository;
import com.yapitup.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for chat room operations
 */
@Service
public class ChatRoomService {
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all chat rooms
     */
    public List<ChatRoomDTO> getAllRooms() {
        List<ChatRoom> rooms = chatRoomRepository.findAll();
        List<ChatRoomDTO> roomDTOs = new ArrayList<>();
        
        for (ChatRoom room : rooms) {
            roomDTOs.add(convertToDTO(room));
        }
        
        return roomDTOs;
    }
    
    /**
     * Get room by ID
     */
    public Optional<ChatRoomDTO> getRoomById(Long id) {
        Optional<ChatRoom> room = chatRoomRepository.findById(id);
        return room.map(this::convertToDTO);
    }
    
    /**
     * Create a new room
     */
    public ChatRoomDTO createRoom(String name, String description, Long createdById) {
        Optional<User> userOpt = userRepository.findById(createdById);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setDescription(description);
        room.setCreatedBy(userOpt.get());
        
        // Add creator as a member
        room.getMembers().add(userOpt.get());
        
        ChatRoom savedRoom = chatRoomRepository.save(room);
        return convertToDTO(savedRoom);
    }
    
    /**
     * Join a room
     */
    public boolean joinRoom(Long roomId, Long userId) {
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (roomOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }
        
        ChatRoom room = roomOpt.get();
        User user = userOpt.get();
        
        // Add user to room if not already a member
        if (!room.getMembers().contains(user)) {
            room.getMembers().add(user);
            chatRoomRepository.save(room);
        }
        
        return true;
    }
    
    /**
     * Leave a room
     */
    public boolean leaveRoom(Long roomId, Long userId) {
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (roomOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }
        
        ChatRoom room = roomOpt.get();
        User user = userOpt.get();
        
        // Remove user from room
        room.getMembers().remove(user);
        chatRoomRepository.save(room);
        
        return true;
    }
    
    /**
     * Convert ChatRoom entity to DTO
     */
    private ChatRoomDTO convertToDTO(ChatRoom room) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setDescription(room.getDescription());
        dto.setCreatedAt(room.getCreatedAt());
        
        if (room.getCreatedBy() != null) {
            dto.setCreatedById(room.getCreatedBy().getId());
            dto.setCreatedByUsername(room.getCreatedBy().getUsername());
        }
        
        dto.setMemberCount(room.getMembers() != null ? room.getMembers().size() : 0);
        
        return dto;
    }
}