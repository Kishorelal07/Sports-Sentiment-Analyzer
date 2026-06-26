package com.sportsanalytics.adapter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sportsanalytics.model.Event;
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
public class MockAdapter implements DataAdapter {
    
    private final String basePath;
    private final ObjectMapper objectMapper;
    private final Map<String, List<Event>> eventCache = new HashMap<>();
    private volatile boolean running = false;
    
    public MockAdapter(@Value("${cricket.data.base-path:../cricket-data}") String basePath) {
        this.basePath = basePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        loadEvents();
    }
    
    private void loadEvents() {
        try {
            String[] feedFiles = {
                "physics-feed.json", "bowler-stats-feed.json", "fielder-feed.json",
                "commentary-feed.json", "wicket-feed.json", "umpire-decisions-feed.json",
                "crowd-reactions-feed.json", "match-statistics-feed.json",
                "player-biometric-feed.json", "equipment-sensor-feed.json"
            };
            
            for (String feedFile : feedFiles) {
                Path filePath = Paths.get(basePath, feedFile);
                if (Files.exists(filePath)) {
                    List<Map<String, Object>> events = objectMapper.readValue(
                        filePath.toFile(),
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                    
                    for (Map<String, Object> eventMap : events) {
                        Event event = convertToEvent(eventMap);
                        String matchId = event.getMatchId();
                        eventCache.computeIfAbsent(matchId, k -> new ArrayList<>()).add(event);
                    }
                    
                    log.info("Loaded {} events from {}", events.size(), feedFile);
                }
            }
            
            // Sort events by timestamp
            eventCache.values().forEach(events -> 
                events.sort(Comparator.comparing(Event::getTimestamp))
            );
            
            log.info("Total events loaded: {}", eventCache.values().stream()
                .mapToInt(List::size).sum());
                
        } catch (IOException e) {
            log.error("Error loading mock events", e);
        }
    }
    
    private Event convertToEvent(Map<String, Object> eventMap) {
        Event event = new Event();
        event.setEventId((String) eventMap.get("event_id"));
        event.setEventType((String) eventMap.get("event_type"));
        event.setSubType((String) eventMap.get("sub_type"));
        event.setMatchId((String) eventMap.get("match_id"));
        event.setInnings((Integer) eventMap.get("innings"));
        event.setOverNumber((Integer) eventMap.get("over_number"));
        event.setBallNumber((Integer) eventMap.get("ball_number"));
        
        String timestampStr = (String) eventMap.get("timestamp");
        if (timestampStr != null) {
            event.setTimestamp(LocalDateTime.parse(timestampStr.replace("Z", "")));
        } else {
            event.setTimestamp(LocalDateTime.now());
        }
        
        event.setSource("mock");
        event.setSourceTimestamp(event.getTimestamp());
        event.setData(new HashMap<>(eventMap));
        event.setCreatedAt(LocalDateTime.now());
        
        return event;
    }
    
    @Override
    public String getAdapterName() {
        return "MockAdapter";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public List<Event> fetchEvents(String matchId, int limit) {
        return eventCache.getOrDefault(matchId, Collections.emptyList())
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    @Override
    public void start() {
        running = true;
        log.info("MockAdapter started");
    }
    
    @Override
    public void stop() {
        running = false;
        log.info("MockAdapter stopped");
    }
}
