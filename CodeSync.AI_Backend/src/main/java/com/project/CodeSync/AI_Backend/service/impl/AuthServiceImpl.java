
package com.project.CodeSync.AI_Backend.service.impl;


import com.project.CodeSync.AI_Backend.dto.auth.AuthResponse;
import com.project.CodeSync.AI_Backend.dto.auth.LoginRequest;
import com.project.CodeSync.AI_Backend.dto.auth.SignupRequest;
import com.project.CodeSync.AI_Backend.entity.User;
import com.project.CodeSync.AI_Backend.error.BadRequestException;
import com.project.CodeSync.AI_Backend.mapper.UserMapper;
import com.project.CodeSync.AI_Backend.repository.UserRepository;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthServiceImpl implements AuthService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    AuthUtil authUtil;
    AuthenticationManager authenticationManager;

    @Override
    public AuthResponse signup(SignupRequest request) {
        System.out.println("Entered Signup Service");

        userRepository.findByUsername(request.username()).ifPresent(user -> {
            System.out.println("Entered ok fine");

            throw new BadRequestException("User already exists with username: "+request.username());
        });

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        String token = authUtil.generateAccessToken(user);
        return new AuthResponse(token, userMapper.toUserProfileResponse(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = (User) authentication.getPrincipal();

        String token = authUtil.generateAccessToken(user);
        System.out.println("Entered into login service Impl");
        return new AuthResponse(token, userMapper.toUserProfileResponse(user));
    }
}
