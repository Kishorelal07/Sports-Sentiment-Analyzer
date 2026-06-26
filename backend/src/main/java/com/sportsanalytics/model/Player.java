package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    @Id
    private String id;
    private String playerId;
    private String name;
    private String teamId;
    private String role; // batsman, bowler, allrounder, wicketkeeper
    private Map<String, Object> statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

