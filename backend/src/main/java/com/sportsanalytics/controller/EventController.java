package com.sportsanalytics.controller;

import com.sportsanalytics.model.Event;
import com.sportsanalytics.repository.EventRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Event query APIs")
public class EventController {
    
    private final EventRepository eventRepository;
    
    @Autowired
    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    
    @GetMapping("/match/{matchId}")
    @Operation(summary = "Get events for a match")
    public ResponseEntity<List<Event>> getEvents(@PathVariable String matchId) {
        List<Event> events = eventRepository.findByMatchIdOrderByTimestampAsc(matchId);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/match/{matchId}/recent")
    @Operation(summary = "Get recent events")
    public ResponseEntity<List<Event>> getRecentEvents(
        @PathVariable String matchId,
        @RequestParam(defaultValue = "1") int hours
    ) {
        List<Event> events = eventRepository.findByMatchIdOrderByTimestampAsc(matchId);
        // Return last 50 events as "recent"
        int size = events.size();
        if (size > 50) {
            events = events.subList(size - 50, size);
        }
        return ResponseEntity.ok(events);
    }
}
