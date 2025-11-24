package com.yapitup.chat.service;

import com.yapitup.chat.dto.MessageDTO;
import com.yapitup.chat.model.ChatRoom;
import com.yapitup.chat.model.Message;
import com.yapitup.chat.model.User;
import com.yapitup.chat.repository.ChatRoomRepository;
import com.yapitup.chat.repository.MessageRepository;
import com.yapitup.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for message operations
 */
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Send a message
     */
    public MessageDTO sendMessage(Long roomId, Long userId, String content) {
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (roomOpt.isEmpty()) {
            throw new RuntimeException("Room not found");
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Message message = new Message();
        message.setRoom(roomOpt.get());
        message.setUser(userOpt.get());
        message.setContent(content);

        Message savedMessage = messageRepository.save(message);
        return convertToDTO(savedMessage);
    }

    /**
     * Get messages for a room (with pagination)
     */
    public List<MessageDTO> getMessagesByRoom(Long roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, pageable);

        List<MessageDTO> messageDTOs = new ArrayList<>();
        for (Message message : messagePage.getContent()) {
            messageDTOs.add(convertToDTO(message));
        }

        return messageDTOs;
    }

    /**
     * Get all messages for a room (no pagination - for simplicity)
     */
    public List<MessageDTO> getAllMessagesByRoom(Long roomId) {
        List<Message> messages = messageRepository.findByRoomIdOrderByCreatedAtAsc(roomId);
        List<MessageDTO> messageDTOs = new ArrayList<>();

        for (Message message : messages) {
            messageDTOs.add(convertToDTO(message));
        }

        return messageDTOs;
    }

    /**
     * Convert Message entity to DTO
     */
    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setRoomId(message.getRoom().getId());
        dto.setUserId(message.getUser().getId());
        dto.setUsername(message.getUser().getUsername());
        dto.setContent(message.getContent());
        if (message.getCreatedAt() != null) {
            dto.setCreatedAt(message.getCreatedAt().toString());
        }


        
        return dto;
    }
}