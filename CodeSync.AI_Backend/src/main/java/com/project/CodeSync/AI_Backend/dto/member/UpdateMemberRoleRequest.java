package com.project.CodeSync.AI_Backend.dto.member;


import com.project.CodeSync.AI_Backend.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(
        @NotNull ProjectRole role) {
}
