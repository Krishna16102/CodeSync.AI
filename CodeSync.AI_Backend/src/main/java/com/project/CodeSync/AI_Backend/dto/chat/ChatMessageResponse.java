package com.project.CodeSync.AI_Backend.dto.chat;
import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        String role,
        String content,
        Instant createdAt
) {
}