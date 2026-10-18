package com.project.CodeSync.AI_Backend.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
public class GroqClient {

    private final WebClient groqWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    public void streamMessage(
            String systemPrompt,
            String userPrompt,
            Consumer<String> onToken,
            Consumer<Integer> onComplete,
            Consumer<Throwable> onError) {

        Map<String, Object> body = Map.of(
                "model", model,
                "stream", true,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", systemPrompt
                        ),
                        Map.of(
                                "role", "user",
                                "content", userPrompt
                        )
                )
        );


        groqWebClient
                .post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .flatMap(errorBody -> {

                                    String message = buildGroqErrorMessage(
                                            response.statusCode().value(),
                                            errorBody
                                    );

                                    return Mono.error(
                                            new RuntimeException(message)
                                    );
                                })
                )
                .bodyToFlux(
                        new ParameterizedTypeReference<
                                org.springframework.http.codec.ServerSentEvent<String>>() {
                        }
                )
                .subscribe(
                        event -> handleEvent(event, onToken),

                        error -> {
                            System.err.println();


                            onError.accept(error);
                        },

                        () -> {
                            System.out.println("Groq stream completed.");
                            onComplete.accept(0);
                        }
                );
    }

    private void handleEvent(
            org.springframework.http.codec.ServerSentEvent<String> event,
            Consumer<String> onToken) {

        String data = event.data();

        if (data == null || data.isBlank()) {
            return;
        }

        if ("[DONE]".equals(data.trim())) {
            return;
        }

        try {
            JsonNode node = objectMapper.readTree(data);
            JsonNode choices = node.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                return;
            }

            JsonNode delta = choices
                    .get(0)
                    .path("delta");

            String content = delta
                    .path("content")
                    .asText("");

            if (!content.isEmpty()) {
                onToken.accept(content);
            }

        } catch (Exception e) {
            System.err.println("Failed to parse Groq stream chunk.");
            System.err.println("Chunk: " + data);
            System.err.println("Reason: " + e.getMessage());
        }
    }

    private String buildGroqErrorMessage(
            int status,
            String body) {

        String defaultMessage =
                "Groq API request failed with HTTP " + status;

        if (body == null || body.isBlank()) {
            return defaultMessage;
        }

        try {
            JsonNode node = objectMapper.readTree(body);

            String message = node
                    .path("error")
                    .path("message")
                    .asText("");

            if (!message.isBlank()) {
                return "Groq API error (" + status + "): " + message;
            }

        } catch (Exception ignored) {
            // Keep fallback message.
        }

        return defaultMessage + ": " + body;
    }
}

