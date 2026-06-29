package com.sportsanalytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsanalytics.dto.AIPredictionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class CohereAIService {

    private static final Pattern JSON_BLOCK_PATTERN =
            Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final boolean enabled;

    public CohereAIService(
            @Value("${cohere.api.key:}") String apiKey,
            @Value("${cohere.api.base-url:https://api.cohere.com/v2}") String baseUrl,
            @Value("${cohere.api.enabled:true}") boolean enabled
    ) {
        this.enabled = enabled && apiKey != null && !apiKey.isBlank();
        this.objectMapper = new ObjectMapper();

        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + (apiKey != null ? apiKey : ""))
                .defaultHeader("Content-Type", "application/json")
                .build();

        if (this.enabled) {
            log.info("Cohere AI enabled (base-url: {})", baseUrl);
        } else {
            log.warn(
                    "Cohere AI disabled — set cohere.api.key in application.yml or COHERE_API_KEY env var, then restart the backend"
            );
        }
    }

    public AIPredictionResult generatePrediction(String matchId, String team1, String team2, Map<String, Object> stats) {

        String prompt = """
                You are a cricket analytics expert.

                Match: %s vs %s
                Match ID: %s
                Stats: %s

                You MUST respond with ONLY a valid JSON object (no markdown, no extra text) with exactly these fields:
                {
                  "prediction": "<predicted winner as a string>",
                  "confidence": "<High | Medium | Low>",
                  "reasoning": "<one sentence>"
                }
                """.formatted(team1, team2, matchId, stats);

        if (!enabled) {
            return mockPrediction(team1);
        }

        try {
            String response = callCohereChat(prompt);
            if (response == null || response.isBlank()) {
                return mockPrediction(team1);
            }
            return parsePredictionResponse(response, team1);
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

        if (!enabled) {
            return mockQA(question);
        }

        try {
            String response = callCohereChat(prompt);
            return (response == null || response.isBlank()) ? mockQA(question) : response;

        } catch (Exception e) {
            log.error("QA generation failed. Using mock.", e);
            return mockQA(question);
        }
    }

    public String generateMatchSummary(Map<String, Object> matchState) {

        String prompt = """
                You are an experienced cricket analyst.

                Current match state:
                %s

                Write exactly 3 sentences narrating the current state of this match from a cricket analyst perspective.
                Be concise and insightful. Return only the summary text, no JSON or bullet points.
                """.formatted(matchState);

        if (!enabled) {
            return mockSummary(matchState);
        }

        try {
            String response = callCohereChat(prompt);
            return (response == null || response.isBlank()) ? mockSummary(matchState) : response.trim();
        } catch (Exception e) {
            log.error("Match summary generation failed. Using mock.", e);
            return mockSummary(matchState);
        }
    }

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

            Object firstBlock = content.get(0);
            if (firstBlock instanceof Map<?, ?> block) {
                Object text = block.get("text");
                if (text != null) {
                    return text.toString();
                }
            }
            if (firstBlock instanceof String text) {
                return text;
            }

            log.warn("Cohere response missing text content: {}", response);
            return null;

        } catch (WebClientResponseException ex) {
            log.error(
                    "Cohere API error {}: {}",
                    ex.getStatusCode(),
                    ex.getResponseBodyAsString()
            );
            return null;
        } catch (Exception ex) {
            log.warn("Cohere chat call failed: {}", ex.getMessage());
            return null;
        }
    }

    private AIPredictionResult parsePredictionResponse(String response, String fallbackTeam) {
        try {
            String json = extractJson(response);
            JsonNode node = objectMapper.readTree(json);

            String prediction = node.path("prediction").asText("");
            String confidence = normalizeConfidence(node.path("confidence").asText(""));
            String reasoning = node.path("reasoning").asText("");

            if (prediction.isBlank()) {
                return mockPrediction(fallbackTeam);
            }

            if (confidence.isBlank()) {
                confidence = "Medium";
            }
            if (reasoning.isBlank()) {
                reasoning = "Based on current match statistics and momentum.";
            }

            return new AIPredictionResult(prediction, confidence, reasoning);
        } catch (Exception e) {
            log.warn("Failed to parse AI prediction JSON, using raw response: {}", e.getMessage());
            return new AIPredictionResult(
                    response.trim(),
                    "Medium",
                    "Based on current match statistics and momentum."
            );
        }
    }

    private String extractJson(String response) {
        Matcher matcher = JSON_BLOCK_PATTERN.matcher(response);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return response.substring(start, end + 1);
        }

        return response.trim();
    }

    private String normalizeConfidence(String confidence) {
        if (confidence == null || confidence.isBlank()) {
            return "Medium";
        }
        String normalized = confidence.trim();
        if (normalized.equalsIgnoreCase("high")) return "High";
        if (normalized.equalsIgnoreCase("medium")) return "Medium";
        if (normalized.equalsIgnoreCase("low")) return "Low";
        return "Medium";
    }

    private AIPredictionResult mockPrediction(String team1) {
        return new AIPredictionResult(
                team1 + " has a slight advantage today.",
                "Medium",
                "Based on current run rate and wickets in hand."
        );
    }

    private String mockQA(String question) {
        return "Mock answer for: \"" + question + "\" (Cohere disabled or failed).";
    }

    private String mockSummary(Map<String, Object> matchState) {
        Object score = matchState.getOrDefault("score", "unknown");
        Object overs = matchState.getOrDefault("overs", "unknown");
        return "The match is unfolding with steady momentum as both sides look to seize the initiative. "
                + "Current score stands at " + score + " after " + overs + " overs, with the run rate shaping the chase. "
                + "Key moments in the next few overs could decisively shift the balance of this contest.";
    }
}
