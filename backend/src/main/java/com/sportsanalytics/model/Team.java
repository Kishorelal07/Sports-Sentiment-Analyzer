package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {
    @Id
    private String id;
    private String teamId;
    private String name;
    private String country;
    private Map<String, Object> statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

