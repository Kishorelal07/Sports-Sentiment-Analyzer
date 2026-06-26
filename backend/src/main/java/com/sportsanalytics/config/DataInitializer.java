package com.sportsanalytics.config;

import com.sportsanalytics.model.Match;
import com.sportsanalytics.repository.MatchRepository;
import com.sportsanalytics.service.MatchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {
    
    private final MatchService matchService;
    private final MatchRepository matchRepository;
    
    @Autowired
    public DataInitializer(MatchService matchService, MatchRepository matchRepository) {
        this.matchService = matchService;
        this.matchRepository = matchRepository;
    }
    
    @Override
    public void run(String... args) {
        log.info("Initializing data...");
        
        // Load match if not already loaded
        String matchId = "eng-aus-t20-2025-11-24";
        if (matchRepository.findByMatchId(matchId).isEmpty()) {
            Match match = matchService.loadMatchFromFile();
            if (match != null) {
                log.info("Loaded match: {}", match.getMatchId());
            } else {
                log.warn("Could not load match from file");
            }
        } else {
            log.info("Match {} already exists in database", matchId);
        }
        
        log.info("Data initialization complete");
    }
}

