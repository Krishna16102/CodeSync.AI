package com.project.CodeSync.AI_Backend.controller;


import com.project.CodeSync.AI_Backend.dto.auth.AuthResponse;
import com.project.CodeSync.AI_Backend.dto.auth.LoginRequest;
import com.project.CodeSync.AI_Backend.dto.auth.SignupRequest;
import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.AuthService;
import com.project.CodeSync.AI_Backend.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthController {

    AuthService authService;
    UserService userService;
    AuthUtil authUtil;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("Entered into Auth controller login method");
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

}


// @RequestBody is used to read the HTTP request body and convert it into a Java object.
