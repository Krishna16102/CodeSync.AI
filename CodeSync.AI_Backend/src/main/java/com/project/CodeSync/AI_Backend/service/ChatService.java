package com.project.CodeSync.AI_Backend.service;

import com.project.CodeSync.AI_Backend.dto.chat.ChatMessageResponse;
import com.project.CodeSync.AI_Backend.dto.chat.ChatSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface ChatService {

    List<ChatMessageResponse> getMessages(
            Long projectId,
            Long userId
    );


    void streamPrompt(
            Long projectId,
            Long userId,
            String prompt,
            SseEmitter emitter
    );


    List<ChatSessionResponse> getSessions(
            Long projectId,
            Long userId
    );
}