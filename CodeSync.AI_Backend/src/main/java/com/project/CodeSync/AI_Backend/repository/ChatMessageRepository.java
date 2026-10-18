package com.project.CodeSync.AI_Backend.repository;

import com.project.CodeSync.AI_Backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByChatSessionIdOrderByCreatedAtAsc(Long chatSessionId);
}