package com.project.CodeSync.AI_Backend.dto.member;


import com.project.CodeSync.AI_Backend.enums.ProjectRole;

import java.time.Instant;

public record MemberResponse(
        Long userId,
        String username,
        String name,
        ProjectRole projectRole,
        Instant invitedAt
) {
}
