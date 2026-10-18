package com.project.CodeSync.AI_Backend.dto.auth;

public record UserProfileResponse(
        Long id,
        String username,
        String name
) {
}
