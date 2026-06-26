package com.sportsanalytics.adapter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sportsanalytics.model.Sentiment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class MockSentimentAdapter implements SentimentAdapter {
    
    private final String basePath;
    private final String sentimentFile;
    private final ObjectMapper objectMapper;
    private final Map<String, List<Sentiment>> sentimentCache = new HashMap<>();
    
    public MockSentimentAdapter(
        @Value("${cricket.data.base-path:../cricket-data}") String basePath,
        @Value("${cricket.data.sentiment-mock-file:sentiment-mock.json}") String sentimentFile
    ) {
        this.basePath = basePath;
        this.sentimentFile = sentimentFile;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        loadSentiment();
    }
    
    private void loadSentiment() {
        try {
            Path filePath = Paths.get(basePath, sentimentFile);
            if (Files.exists(filePath)) {
                List<Map<String, Object>> sentiments = objectMapper.readValue(
                    filePath.toFile(),
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                
                for (Map<String, Object> sentimentMap : sentiments) {
                    Sentiment sentiment = convertToSentiment(sentimentMap);
                    String matchId = sentiment.getMatchId();
                    sentimentCache.computeIfAbsent(matchId, k -> new ArrayList<>()).add(sentiment);
                }
                
                sentimentCache.values().forEach(list -> 
                    list.sort(Comparator.comparing(Sentiment::getTimestamp))
                );
                
                log.info("Loaded {} sentiment entries from {}", sentiments.size(), sentimentFile);
            } else {
                log.warn("Sentiment file not found: {}. Creating sample data.", filePath);
                createSampleSentiment();
            }
        } catch (IOException e) {
            log.error("Error loading sentiment data", e);
            createSampleSentiment();
        }
    }
    
    private void createSampleSentiment() {
        // Create sample sentiment data based on match metadata
        String matchId = "eng-aus-t20-2025-11-24";
        List<Sentiment> sampleSentiments = new ArrayList<>();
        
        LocalDateTime baseTime = LocalDateTime.of(2025, 11, 24, 19, 11, 0);
        String[] players = {"warner_d", "finch_a", "smith_s", "maxwell_g", "buttler_j", "root_j"};
        
        for (int i = 0; i < 50; i++) {
            String playerId = players[i % players.length];
            Sentiment sentiment = new Sentiment();
            sentiment.setId(UUID.randomUUID().toString());
            sentiment.setMatchId(matchId);
            sentiment.setPlayerId(playerId);
            sentiment.setTimestamp(baseTime.plusMinutes(i * 2));
            sentiment.setSentimentScore((Math.random() * 2) - 1.0); // -1 to 1
            sentiment.setSentimentLabel(
                sentiment.getSentimentScore() > 0.3 ? "positive" :
                sentiment.getSentimentScore() < -0.3 ? "negative" : "neutral"
            );
            sentiment.setMentionCount((int)(Math.random() * 100) + 10);
            sentiment.setSource("mock");
            sentiment.setSourceTimestamp(sentiment.getTimestamp());
            sentiment.setCreatedAt(LocalDateTime.now());
            sampleSentiments.add(sentiment);
        }
        
        sentimentCache.put(matchId, sampleSentiments);
        log.info("Created {} sample sentiment entries", sampleSentiments.size());
    }
    
    private Sentiment convertToSentiment(Map<String, Object> sentimentMap) {
        Sentiment sentiment = new Sentiment();
        sentiment.setId(UUID.randomUUID().toString());
        sentiment.setMatchId((String) sentimentMap.get("match_id"));
        sentiment.setPlayerId((String) sentimentMap.get("player_id"));
        sentiment.setTeamId((String) sentimentMap.get("team_id"));
        
        String timestampStr = (String) sentimentMap.get("timestamp");
        if (timestampStr != null) {
            sentiment.setTimestamp(LocalDateTime.parse(timestampStr.replace("Z", "")));
        } else {
            sentiment.setTimestamp(LocalDateTime.now());
        }
        
        Object scoreObj = sentimentMap.get("sentiment_score");
        if (scoreObj instanceof Number) {
            sentiment.setSentimentScore(((Number) scoreObj).doubleValue());
        }
        
        sentiment.setSentimentLabel((String) sentimentMap.get("sentiment_label"));
        
        Object mentionObj = sentimentMap.get("mention_count");
        if (mentionObj instanceof Number) {
            sentiment.setMentionCount(((Number) mentionObj).intValue());
        }
        
        sentiment.setSource((String) sentimentMap.getOrDefault("source", "mock"));
        sentiment.setSourceTimestamp(sentiment.getTimestamp());
        sentiment.setCreatedAt(LocalDateTime.now());
        
        return sentiment;
    }
    
    @Override
    public String getAdapterName() {
        return "MockSentimentAdapter";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public List<Sentiment> fetchSentiment(String matchId, int limit) {
        return sentimentCache.getOrDefault(matchId, Collections.emptyList())
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Sentiment> fetchPlayerSentiment(String playerId, int limit) {
        return sentimentCache.values().stream()
            .flatMap(List::stream)
            .filter(s -> playerId.equals(s.getPlayerId()))
            .limit(limit)
            .collect(Collectors.toList());
    }
}
