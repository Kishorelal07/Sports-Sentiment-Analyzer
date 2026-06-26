package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "sentiment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sentiment {
    @Id
    private String id;
    private String matchId;
    private String playerId;
    private String teamId;
    private LocalDateTime timestamp;
    private Double sentimentScore; // -1.0 to 1.0
    private String sentimentLabel; // positive, negative, neutral
    private Integer mentionCount;
    private String source; // twitter, reddit, mock
    private LocalDateTime sourceTimestamp;
    private LocalDateTime createdAt;
}

