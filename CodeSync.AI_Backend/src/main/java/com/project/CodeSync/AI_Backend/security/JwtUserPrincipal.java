package com.project.CodeSync.AI_Backend.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public record JwtUserPrincipal(
        Long userId,
        String username,
        List<GrantedAuthority> authorities
) {
}
