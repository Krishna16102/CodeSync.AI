package com.project.CodeSync.AI_Backend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendMessageRequest(
//        @NotNull Long sessionId,
        @NotBlank String prompt
) {
}