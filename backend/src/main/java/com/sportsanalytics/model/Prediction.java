package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {
    @Id
    private String id;
    private String matchId;
    private String predictionType; // match_winner, next_wicket, next_over_runs
    private LocalDateTime timestamp;
    private Map<String, Double> probabilities; // e.g., {"team1": 0.65, "team2": 0.30, "tie": 0.05}
    private List<FeatureImportance> featureImportances;
    private String explanation;
    private LocalDateTime createdAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureImportance {
        private String feature;
        private Double score;
        private String description;
    }
}

