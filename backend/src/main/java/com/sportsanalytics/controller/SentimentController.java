package com.sportsanalytics.controller;

import com.sportsanalytics.model.Sentiment;
import com.sportsanalytics.service.SentimentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/sentiment")
@Tag(name = "Sentiment", description = "Social sentiment analysis APIs")
public class SentimentController {
    
    private final SentimentService sentimentService;
    
    @Autowired
    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }
    
    @GetMapping("/match/{matchId}")
    @Operation(summary = "Get sentiment for a match")
    public ResponseEntity<List<Sentiment>> getMatchSentiment(@PathVariable String matchId) {
        List<Sentiment> sentiments = sentimentService.getMatchSentiment(matchId);
        return ResponseEntity.ok(sentiments);
    }
    
    @GetMapping("/player/{playerId}")
    @Operation(summary = "Get sentiment for a player")
    public ResponseEntity<List<Sentiment>> getPlayerSentiment(@PathVariable String playerId) {
        List<Sentiment> sentiments = sentimentService.getPlayerSentiment(playerId);
        return ResponseEntity.ok(sentiments);
    }
}
