package com.sportsanalytics.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CohereAIService {

    private final WebClient webClient;
    private final boolean enabled;

    public CohereAIService(
            @Value("${cohere.api.key:}") String apiKey,
            @Value("${cohere.api.base-url:https://api.cohere.com/v2}") String baseUrl,
            @Value("${cohere.api.enabled:true}") boolean enabled
    ) {
        this.enabled = enabled && apiKey != null && !apiKey.isBlank();

        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /* =============================================================
       PUBLIC API
       ============================================================= */

    public String generatePrediction(String matchId, String team1, String team2, Map<String, Object> stats) {

        String prompt = """
                You are a cricket analytics expert.

                Match: %s vs %s
                Match ID: %s
                Stats: %s

                Provide:
                - Predicted winner
                - Win probability
                - Reasoning
                - Key influencing factors
                """.formatted(team1, team2, matchId, stats);

        if (!enabled)
            return mockPrediction(team1);

        try {
            String response = callCohereChat(prompt);
            return (response == null || response.isBlank()) ? mockPrediction(team1) : response;
        } catch (Exception e) {
            log.error("Prediction generation failed. Using mock.", e);
            return mockPrediction(team1);
        }
    }

    public String answerQuestion(String question, String context) {

        String prompt = """
                Context:
                %s

                Question:
                %s

                Provide a short, clear cricket-specific answer.
                """.formatted(context, question);

        if (!enabled)
            return mockQA(question);

        try {
            String response = callCohereChat(prompt);
            return (response == null || response.isBlank()) ? mockQA(question) : response;

        } catch (Exception e) {
            log.error("QA generation failed. Using mock.", e);
            return mockQA(question);
        }
    }

    /* =============================================================
       PRIVATE — Chat API Caller
       ============================================================= */

    @SuppressWarnings("unchecked")
    private String callCohereChat(String prompt) {

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", "command-a-03-2025",
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    )
            );

            Map<String, Object> response = webClient.post()
                    .uri("/chat")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) return null;

            Map<String, Object> message = (Map<String, Object>) response.get("message");
            if (message == null) return null;

            List<Map<String, Object>> content = (List<Map<String, Object>>) message.get("content");
            if (content == null || content.isEmpty()) return null;

            return content.get(0).get("text").toString();

        } catch (Exception ex) {
            log.warn("Cohere chat call failed: {}", ex.getMessage());
            return null;
        }
    }

    /* =============================================================
       PRIVATE — Mock Fallbacks
       ============================================================= */

    private String mockPrediction(String team1) {
        return "Mock prediction: " + team1 + " has a slight advantage today (56%).";
    }

    private String mockQA(String question) {
        return "Mock answer for: \"" + question + "\" (Cohere disabled or failed).";
    }
}
