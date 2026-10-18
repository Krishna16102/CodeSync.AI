package com.project.CodeSync.AI_Backend.controller;

import com.project.CodeSync.AI_Backend.dto.chat.ChatMessageResponse;
import com.project.CodeSync.AI_Backend.dto.chat.SendMessageRequest;
import com.project.CodeSync.AI_Backend.security.AuthUtil;
import com.project.CodeSync.AI_Backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthUtil authUtil;


    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                chatService.getMessages(
                        projectId,
                        authUtil.getCurrentUserId()
                )
        );
    }

    @PostMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter sendPrompt(
            @PathVariable Long projectId,
            @RequestBody @Valid SendMessageRequest request
    ) {

        Long userId =
                authUtil.getCurrentUserId();

        SseEmitter emitter =
                new SseEmitter(0L);

        chatService.streamPrompt(
                projectId,
                userId,
                request.prompt(),
                emitter
        );

        return emitter;
    }
}