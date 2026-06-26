package com.sportsanalytics.controller;

import com.sportsanalytics.model.Event;
import com.sportsanalytics.model.Match;
import com.sportsanalytics.model.Sentiment;
import com.sportsanalytics.model.User;
import com.sportsanalytics.repository.EventRepository;
import com.sportsanalytics.repository.MatchRepository;
import com.sportsanalytics.repository.SentimentRepository;
import com.sportsanalytics.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/commentary")
@Tag(name = "Commentary", description = "Personalized commentary APIs")
public class CommentaryController {
    
    private final EventRepository eventRepository;
    private final MatchRepository matchRepository;
    private final SentimentRepository sentimentRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public CommentaryController(
        EventRepository eventRepository,
        MatchRepository matchRepository,
        SentimentRepository sentimentRepository,
        UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.matchRepository = matchRepository;
        this.sentimentRepository = sentimentRepository;
        this.userRepository = userRepository;
    }
    
    @GetMapping("/personalized")
    @Operation(summary = "Get personalized commentary")
    public ResponseEntity<List<Map<String, Object>>> getPersonalizedCommentary(
        @RequestParam String userId,
        @RequestParam(required = false) String matchId
    ) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        User.UserPreferences preferences = userOpt
            .map(User::getPreferences)
            .orElse(null);
        
        // Default match if not provided
        if (matchId == null || matchId.isEmpty()) {
            List<Match> matches = matchRepository.findAll();
            if (!matches.isEmpty()) {
                matchId = matches.get(0).getMatchId();
            }
        }
        
        if (matchId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        // Get events and sentiment
        List<Event> events = eventRepository.findByMatchIdOrderByTimestampAsc(matchId);
        List<Sentiment> sentiments = sentimentRepository.findByMatchIdOrderByTimestampAsc(matchId);
        
        // Filter events based on preferences
        List<Event> filteredEvents = events;
        if (preferences != null && preferences.getFavoritePlayers() != null && !preferences.getFavoritePlayers().isEmpty()) {
            filteredEvents = events.stream()
                .filter(event -> {
                    Map<String, Object> data = event.getData();
                    if (data == null) return false;
                    String playerId = (String) data.get("player_id");
                    String bowlerId = (String) data.get("bowler_id");
                    String batsmanId = (String) data.get("batsman_id");
                    return preferences.getFavoritePlayers().contains(playerId) ||
                           preferences.getFavoritePlayers().contains(bowlerId) ||
                           preferences.getFavoritePlayers().contains(batsmanId);
                })
                .collect(Collectors.toList());
        }
        
        // Generate commentary
        List<Map<String, Object>> commentary = new ArrayList<>();
        
        // Add commentary from events
        for (Event event : filteredEvents) {
            if ("commentary".equals(event.getEventType())) {
                Map<String, Object> comment = new HashMap<>();
                comment.put("timestamp", event.getTimestamp());
                comment.put("text", event.getData() != null ? event.getData().get("commentary_text") : "");
                comment.put("type", "event");
                commentary.add(comment);
            }
        }
        
        // Add sentiment-based commentary
        if (preferences == null || preferences.getShowSentiment() == null || preferences.getShowSentiment()) {
            for (Sentiment sentiment : sentiments) {
                if (sentiment.getSentimentScore() != null && Math.abs(sentiment.getSentimentScore()) > 0.5) {
                    Map<String, Object> comment = new HashMap<>();
                    comment.put("timestamp", sentiment.getTimestamp());
                    comment.put("text", String.format("Social sentiment for %s is %s (%.0f%% positive mentions)",
                        sentiment.getPlayerId(),
                        sentiment.getSentimentScore() > 0 ? "very positive" : "very negative",
                        Math.abs(sentiment.getSentimentScore() * 100)));
                    comment.put("type", "sentiment");
                    commentary.add(comment);
                }
            }
        }
        
        // Sort by timestamp
        commentary.sort(Comparator.comparing(c -> (java.time.LocalDateTime) c.get("timestamp")));
        
        return ResponseEntity.ok(commentary);
    }
}

