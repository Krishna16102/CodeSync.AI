package com.project.CodeSync.AI_Backend.dto.project;

import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        Instant createdAt,
        Instant updatedAt,
        UserProfileResponse owner
) {
}
