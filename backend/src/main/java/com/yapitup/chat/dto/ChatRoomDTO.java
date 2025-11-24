package com.yapitup.chat.dto;

import java.time.LocalDateTime;

/**
 * DTO for chat room data
 */
public class ChatRoomDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private Long createdById;
    private String createdByUsername;
    private Integer memberCount;
    
    // Constructors
    public ChatRoomDTO() {
    }
    
    public ChatRoomDTO(Long id, String name, String description, LocalDateTime createdAt, 
                     Long createdById, String createdByUsername, Integer memberCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.createdById = createdById;
        this.createdByUsername = createdByUsername;
        this.memberCount = memberCount;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getCreatedById() {
        return createdById;
    }
    
    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
    
    public String getCreatedByUsername() {
        return createdByUsername;
    }
    
    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }
    
    public Integer getMemberCount() {
        return memberCount;
    }
    
    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }
}