package com.sportsanalytics.service;

import com.sportsanalytics.adapter.SentimentAdapter;
import com.sportsanalytics.model.Sentiment;
import com.sportsanalytics.repository.SentimentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class SentimentService {
    
    private final List<SentimentAdapter> adapters;
    private final SentimentRepository sentimentRepository;
    
    @Autowired
    public SentimentService(List<SentimentAdapter> adapters, SentimentRepository sentimentRepository) {
        this.adapters = adapters;
        this.sentimentRepository = sentimentRepository;
        loadSentimentData();
    }
    
    private void loadSentimentData() {
        SentimentAdapter activeAdapter = adapters.stream()
            .filter(SentimentAdapter::isEnabled)
            .findFirst()
            .orElse(null);
        
        if (activeAdapter == null) {
            log.warn("No enabled sentiment adapter found");
            return;
        }
        
        log.info("Loading sentiment data using adapter: {}", activeAdapter.getAdapterName());
        
        // Load sentiment for default match
        String defaultMatchId = "eng-aus-t20-2025-11-24";
        List<Sentiment> sentiments = activeAdapter.fetchSentiment(defaultMatchId, 10000);
        
        for (Sentiment sentiment : sentiments) {
            sentiment.setCreatedAt(LocalDateTime.now());
            sentimentRepository.save(sentiment);
        }
        
        log.info("Loaded {} sentiment entries into database", sentiments.size());
    }
    
    public List<Sentiment> getMatchSentiment(String matchId) {
        return sentimentRepository.findByMatchIdOrderByTimestampAsc(matchId);
    }
    
    public List<Sentiment> getPlayerSentiment(String playerId) {
        return sentimentRepository.findByPlayerIdOrderByTimestampAsc(playerId);
    }
}
