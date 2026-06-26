package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;
    private String eventId;
    private String eventType;
    private String subType;
    private String matchId;
    private Integer innings;
    private Integer overNumber;
    private Integer ballNumber;
    private LocalDateTime timestamp;
    private String source;
    private LocalDateTime sourceTimestamp;
    private Map<String, Object> data;
    private LocalDateTime createdAt;
}

