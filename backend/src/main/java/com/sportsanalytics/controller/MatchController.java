package com.sportsanalytics.controller;

import com.sportsanalytics.model.Match;
import com.sportsanalytics.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/matches")
@Tag(name = "Matches", description = "Match management APIs")
public class MatchController {
    
    private final MatchService matchService;
    
    @Autowired
    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }
    
    @GetMapping
    @Operation(summary = "Get all matches")
    public ResponseEntity<List<Match>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }
    
    @GetMapping("/live")
    @Operation(summary = "Get live/ongoing match")
    public ResponseEntity<Match> getLiveMatch() {
        // Return the first match as "live" (from mock data)
        List<Match> matches = matchService.getAllMatches();
        if (!matches.isEmpty()) {
            return ResponseEntity.ok(matches.get(0));
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{matchId}")
    @Operation(summary = "Get match by ID")
    public ResponseEntity<Match> getMatch(@PathVariable String matchId) {
        Optional<Match> match = matchService.getMatch(matchId);
        return match.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{matchId}/score")
    @Operation(summary = "Get match scorecard")
    public ResponseEntity<Map<String, Object>> getScorecard(@PathVariable String matchId) {
        Optional<Match> matchOpt = matchService.getMatch(matchId);
        if (matchOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Match match = matchOpt.get();
        Map<String, Object> scorecard = new HashMap<>();
        scorecard.put("matchId", match.getMatchId());
        scorecard.put("series", match.getSeries());
        scorecard.put("venue", match.getVenue());
        scorecard.put("innings", match.getInnings());
        scorecard.put("teams", match.getTeams());
        scorecard.put("result", match.getResult());
        
        return ResponseEntity.ok(scorecard);
    }
    
    @PostMapping("/load")
    @Operation(summary = "Load match from file")
    public ResponseEntity<Match> loadMatch() {
        Match match = matchService.loadMatchFromFile();
        if (match != null) {
            return ResponseEntity.ok(match);
        }
        return ResponseEntity.badRequest().build();
    }
}
