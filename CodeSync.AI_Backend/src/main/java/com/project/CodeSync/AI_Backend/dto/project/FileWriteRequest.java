package com.project.CodeSync.AI_Backend.dto.project;

import jakarta.validation.constraints.NotBlank;

public record FileWriteRequest(
        @NotBlank String path,
        String content
) {
}