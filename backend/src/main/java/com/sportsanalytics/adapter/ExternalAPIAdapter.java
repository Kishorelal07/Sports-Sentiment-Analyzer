package com.sportsanalytics.adapter;

import com.sportsanalytics.model.Event;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Reference adapter for external API integration.
 * This is a stub implementation showing how external APIs (like ESPN, CricAPI, etc.)
 * can be integrated. Replace with actual API client implementation.
 */
@Slf4j
@Component
public class ExternalAPIAdapter implements DataAdapter {
    
    private final boolean enabled;
    private final String apiKey;
    private final String baseUrl;
    private final String adapterName;
    
    public ExternalAPIAdapter(
        @Value("${cricket.adapters.external.enabled:false}") boolean enabled,
        @Value("${cricket.adapters.external.api-key:}") String apiKey,
        @Value("${cricket.adapters.external.base-url:}") String baseUrl,
        @Value("${cricket.adapters.external.name:ExternalAPI}") String adapterName
    ) {
        this.enabled = enabled;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.adapterName = adapterName;
    }
    
    @Override
    public String getAdapterName() {
        return adapterName;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isEmpty() && baseUrl != null && !baseUrl.isEmpty();
    }
    
    @Override
    public List<Event> fetchEvents(String matchId, int limit) {
        log.warn("ExternalAPIAdapter.fetchEvents() not implemented - reference stub only");
        log.info("To implement: Connect to external API at {} with API key", baseUrl);
        return Collections.emptyList();
    }
    
    @Override
    public void start() {
        log.info("ExternalAPIAdapter started (stub)");
    }
    
    @Override
    public void stop() {
        log.info("ExternalAPIAdapter stopped (stub)");
    }
}

