package com.yapitup.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for sending a message
 */
public class SendMessageRequest {
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    @NotBlank(message = "Message content is required")
    private String content;
    
    // Getters and Setters
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
}