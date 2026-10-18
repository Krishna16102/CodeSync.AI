package com.project.CodeSync.AI_Backend.dto.auth;

public record AuthResponse(
        String token,
        UserProfileResponse user
) {

}
