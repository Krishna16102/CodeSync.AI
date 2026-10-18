package com.project.CodeSync.AI_Backend.service;


import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;
import org.jspecify.annotations.Nullable;

public interface UserService {
    UserProfileResponse getProfile(Long userId);
}
