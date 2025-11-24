package com.yapitup.chat.dto;

/**
 * DTO for message data
 */
public class MessageDTO {

    private Long id;
    private Long roomId;
    private Long userId;
    private String username;
    private String content;
    private String createdAt;

    // Constructors
    public MessageDTO() {
    }

    public MessageDTO(Long id, Long roomId, Long userId, String username, String content, String createdAt) {
        this.id = id;
        this.roomId = roomId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
