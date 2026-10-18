package com.project.CodeSync.AI_Backend.service;


import com.project.CodeSync.AI_Backend.dto.auth.AuthResponse;
import com.project.CodeSync.AI_Backend.dto.auth.LoginRequest;
import com.project.CodeSync.AI_Backend.dto.auth.SignupRequest;
import org.jspecify.annotations.Nullable;

public interface AuthService {
    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);
}
