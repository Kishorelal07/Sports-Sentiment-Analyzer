package com.sportsanalytics.controller;

import com.sportsanalytics.dto.AIPredictionResult;
import com.sportsanalytics.service.CohereAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Cohere AI integration APIs")
public class AIController {

    private final CohereAIService cohereAIService;

    public AIController(CohereAIService cohereAIService) {
        this.cohereAIService = cohereAIService;
    }

    @PostMapping("/predict")
    @Operation(summary = "Generate AI-powered match prediction")
    public ResponseEntity<Map<String, Object>> generatePrediction(@RequestBody Map<String, Object> request) {
        String matchId = (String) request.get("matchId");
        String team1 = (String) request.get("team1");
        String team2 = (String) request.get("team2");
        Map<String, Object> stats = (Map<String, Object>) request.getOrDefault("stats", Map.of());

        if (matchId == null || team1 == null || team2 == null) {
            return ResponseEntity.badRequest().build();
        }

        AIPredictionResult result = cohereAIService.generatePrediction(matchId, team1, team2, stats);
        Map<String, Object> response = new HashMap<>();
        response.put("matchId", matchId);
        response.put("prediction", result.getPrediction());
        response.put("confidence", result.getConfidence());
        response.put("reasoning", result.getReasoning());
        response.put("source", "cohere-ai");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/summary")
    @Operation(summary = "Generate AI narrative match summary")
    public ResponseEntity<Map<String, Object>> generateSummary(@RequestBody Map<String, Object> matchState) {
        if (matchState == null || matchState.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String summary = cohereAIService.generateMatchSummary(matchState);
        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("source", "cohere-ai");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with the AI assistant")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> request) {
        String question = (String) request.get("question");
        String context = (String) request.getOrDefault("context", "You are a helpful cricket analytics assistant.");

        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String answer = cohereAIService.answerQuestion(question, context);
        Map<String, Object> response = new HashMap<>();
        response.put("question", question);
        response.put("answer", answer);
        response.put("source", "cohere-ai");
        return ResponseEntity.ok(response);
    }
}

