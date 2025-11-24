package com.yapitup.chat.repository;

import com.yapitup.chat.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ChatRoom entity
 */
@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}