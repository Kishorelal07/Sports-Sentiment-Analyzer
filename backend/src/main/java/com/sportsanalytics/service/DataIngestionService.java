package com.sportsanalytics.service;

import com.sportsanalytics.adapter.DataAdapter;
import com.sportsanalytics.model.Event;
import com.sportsanalytics.repository.EventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class DataIngestionService {
    
    private final List<DataAdapter> adapters;
    private final EventRepository eventRepository;
    
    @Autowired
    public DataIngestionService(List<DataAdapter> adapters, EventRepository eventRepository) {
        this.adapters = adapters;
        this.eventRepository = eventRepository;
        log.info("DataIngestionService initialized with {} adapters", adapters.size());
        loadAllEvents();
    }
    
    private void loadAllEvents() {
        DataAdapter activeAdapter = adapters.stream()
            .filter(DataAdapter::isEnabled)
            .findFirst()
            .orElse(null);
        
        if (activeAdapter == null) {
            log.warn("No enabled adapter found for data loading");
            return;
        }
        
        log.info("Loading events using adapter: {}", activeAdapter.getAdapterName());
        
        // Load events for the default match
        String defaultMatchId = "eng-aus-t20-2025-11-24";
        List<Event> events = activeAdapter.fetchEvents(defaultMatchId, 10000);
        
        for (Event event : events) {
            event.setCreatedAt(LocalDateTime.now());
            eventRepository.save(event);
        }
        
        log.info("Loaded {} events into database", events.size());
    }
}
