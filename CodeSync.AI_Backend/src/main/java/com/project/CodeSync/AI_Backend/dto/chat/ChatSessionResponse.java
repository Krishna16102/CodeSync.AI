package com.project.CodeSync.AI_Backend.dto.chat;


import java.time.Instant;

public record ChatSessionResponse(
        Long id,
        String title,
        Instant createdAt,
        Instant updatedAt
) {
}