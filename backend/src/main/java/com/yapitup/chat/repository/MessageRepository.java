package com.yapitup.chat.repository;

import com.yapitup.chat.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Message entity
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find all messages in a room, ordered by creation date
    List<Message> findByRoomIdOrderByCreatedAtAsc(Long roomId);
    
    // Find messages in a room with pagination
    Page<Message> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
}