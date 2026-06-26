package com.sportsanalytics.service;

import com.sportsanalytics.model.Match;
import com.sportsanalytics.model.Sentiment;
import com.sportsanalytics.repository.EventRepository;
import com.sportsanalytics.repository.MatchRepository;
import com.sportsanalytics.repository.SentimentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SimplePredictionService {
    
    private final MatchRepository matchRepository;
    private final EventRepository eventRepository;
    private final SentimentRepository sentimentRepository;
    private final CohereAIService cohereAIService;
    
    @Autowired
    public SimplePredictionService(
        MatchRepository matchRepository,
        EventRepository eventRepository,
        SentimentRepository sentimentRepository,
        CohereAIService cohereAIService
    ) {
        this.matchRepository = matchRepository;
        this.eventRepository = eventRepository;
        this.sentimentRepository = sentimentRepository;
        this.cohereAIService = cohereAIService;
    }
    
    public Map<String, Object> predictMatch(String matchId) {
        Optional<Match> matchOpt = matchRepository.findByMatchId(matchId);
        if (matchOpt.isEmpty()) {
            return createDefaultPrediction(matchId);
        }
        
        Match match = matchOpt.get();
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("matchId", matchId);
        
        // Get current match state
        List<com.sportsanalytics.model.Event> events = eventRepository.findByMatchIdOrderByTimestampAsc(matchId);
        List<Sentiment> sentiments = sentimentRepository.findByMatchIdOrderByTimestampAsc(matchId);
        
        // Calculate features
        double runRateDiff = calculateRunRateDifference(match, events);
        double sentimentTrend = calculateSentimentTrend(sentiments, match);
        double wicketsRemaining = calculateWicketsRemaining(match, events);
        double recentOvers = calculateRecentOversPerformance(events);
        double headToHead = 0.5; // Mock head-to-head (neutral)
        
        // Calculate probabilities (simple rule-based)
        double team1Score = 0.5 + (runRateDiff * 0.3) + (sentimentTrend * 0.2) + 
                           (wicketsRemaining * 0.2) + (recentOvers * 0.15) + (headToHead * 0.1);
        team1Score = Math.max(0.1, Math.min(0.9, team1Score)); // Clamp between 0.1 and 0.9
        
        double team2Score = 1.0 - team1Score;
        
        Map<String, Double> winProbabilities = new HashMap<>();
        winProbabilities.put("team1", team1Score);
        winProbabilities.put("team2", team2Score);
        
        prediction.put("prediction", winProbabilities);
        
        // Feature explanations
        List<Map<String, Object>> explanations = new ArrayList<>();
        explanations.add(createExplanation("run_rate_difference", runRateDiff * 0.3));
        explanations.add(createExplanation("sentiment_trend", sentimentTrend * 0.2));
        explanations.add(createExplanation("wickets_remaining", wicketsRemaining * 0.2));
        explanations.add(createExplanation("recent_overs", recentOvers * 0.15));
        explanations.add(createExplanation("head_to_head", headToHead * 0.1));
        
        prediction.put("explanations", explanations);
        
        // Add AI-generated prediction text
        try {
            String team1Name = match.getTeams() != null && match.getTeams().containsKey("team1")
                ? match.getTeams().get("team1").getName() : "Team 1";
            String team2Name = match.getTeams() != null && match.getTeams().containsKey("team2")
                ? match.getTeams().get("team2").getName() : "Team 2";
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("runRateDiff", runRateDiff);
            stats.put("sentimentTrend", sentimentTrend);
            stats.put("wicketsRemaining", wicketsRemaining);
            
            String aiPrediction = cohereAIService.generatePrediction(matchId, team1Name, team2Name, stats);
            prediction.put("aiPrediction", aiPrediction);
        } catch (Exception e) {
            log.warn("Could not generate AI prediction", e);
            prediction.put("aiPrediction", "AI prediction unavailable");
        }
        
        return prediction;
    }
    
    private double calculateRunRateDifference(Match match, List<com.sportsanalytics.model.Event> events) {
        if (match.getInnings() == null || match.getInnings().isEmpty()) {
            return 0.0;
        }
        
        Match.Innings currentInnings = match.getInnings().get(0);
        if (currentInnings.getTotalRuns() == null || currentInnings.getTotalOvers() == null) {
            return 0.0;
        }
        
        double currentRunRate = currentInnings.getTotalRuns() / Math.max(currentInnings.getTotalOvers(), 0.1);
        double requiredRunRate = currentInnings.getTarget() != null && currentInnings.getTarget() > 0
            ? (currentInnings.getTarget() - currentInnings.getTotalRuns()) / Math.max(20.0 - currentInnings.getTotalOvers(), 0.1)
            : currentRunRate;
        
        return (currentRunRate - requiredRunRate) / 10.0; // Normalize
    }
    
    private double calculateSentimentTrend(List<Sentiment> sentiments, Match match) {
        if (sentiments.isEmpty()) {
            return 0.0;
        }
        
        // Get team names
        String team1Name = match.getTeams() != null && match.getTeams().containsKey("team1")
            ? match.getTeams().get("team1").getName() : "Team1";
        String team2Name = match.getTeams() != null && match.getTeams().containsKey("team2")
            ? match.getTeams().get("team2").getName() : "Team2";
        
        // Calculate average sentiment for each team
        double team1Sentiment = sentiments.stream()
            .filter(s -> s.getTeamId() != null && team1Name.toLowerCase().contains(s.getTeamId().toLowerCase()))
            .mapToDouble(s -> s.getSentimentScore() != null ? s.getSentimentScore() : 0.0)
            .average()
            .orElse(0.0);
        
        double team2Sentiment = sentiments.stream()
            .filter(s -> s.getTeamId() != null && team2Name.toLowerCase().contains(s.getTeamId().toLowerCase()))
            .mapToDouble(s -> s.getSentimentScore() != null ? s.getSentimentScore() : 0.0)
            .average()
            .orElse(0.0);
        
        return (team1Sentiment - team2Sentiment) / 2.0; // Normalize to -1 to 1
    }
    
    private double calculateWicketsRemaining(Match match, List<com.sportsanalytics.model.Event> events) {
        if (match.getInnings() == null || match.getInnings().isEmpty()) {
            return 0.5;
        }
        
        Match.Innings currentInnings = match.getInnings().get(0);
        int wickets = currentInnings.getTotalWickets() != null ? currentInnings.getTotalWickets() : 0;
        int wicketsRemaining = 10 - wickets;
        
        return wicketsRemaining / 10.0; // Normalize to 0-1
    }
    
    private double calculateRecentOversPerformance(List<com.sportsanalytics.model.Event> events) {
        // Get last 5 overs performance
        List<com.sportsanalytics.model.Event> statsEvents = events.stream()
            .filter(e -> "match_statistics".equals(e.getEventType()))
            .collect(Collectors.toList());
        
        if (statsEvents.size() < 2) {
            return 0.5;
        }
        
        // Simple calculation: if recent runs are higher, return positive
        return 0.5; // Simplified for now
    }
    
    private Map<String, Object> createExplanation(String feature, double score) {
        Map<String, Object> explanation = new HashMap<>();
        explanation.put("feature", feature);
        explanation.put("score", Math.round(score * 100.0) / 100.0);
        return explanation;
    }
    
    private Map<String, Object> createDefaultPrediction(String matchId) {
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("matchId", matchId);
        
        Map<String, Double> winProbabilities = new HashMap<>();
        winProbabilities.put("team1", 0.5);
        winProbabilities.put("team2", 0.5);
        prediction.put("prediction", winProbabilities);
        
        List<Map<String, Object>> explanations = new ArrayList<>();
        explanations.add(createExplanation("default", 0.5));
        prediction.put("explanations", explanations);
        
        return prediction;
    }
}

