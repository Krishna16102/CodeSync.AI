package com.project.CodeSync.AI_Backend.service.impl;

import com.project.CodeSync.AI_Backend.dto.auth.UserProfileResponse;
import com.project.CodeSync.AI_Backend.entity.User;
import com.project.CodeSync.AI_Backend.error.ResourceNotFoundException;
import com.project.CodeSync.AI_Backend.mapper.UserMapper;
import com.project.CodeSync.AI_Backend.repository.UserRepository;
import com.project.CodeSync.AI_Backend.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserProfileResponse getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", userId.toString()));

        return userMapper.toUserProfileResponse(user);

    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", username));
    }
}
