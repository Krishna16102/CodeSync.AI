package com.project.CodeSync.AI_Backend.repository;


import com.project.CodeSync.AI_Backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession>
    findFirstByProjectIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long projectId
    );


    List<ChatSession>
    findAllByProjectIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
            Long projectId
    );


    Optional<ChatSession>
    findByIdAndProjectIdAndDeletedAtIsNull(
            Long sessionId,
            Long projectId
    );

}