package com.sportsanalytics.controller;

import com.sportsanalytics.model.Team;
import com.sportsanalytics.repository.TeamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "Team analytics APIs")
public class TeamController {
    
    private final TeamRepository teamRepository;
    
    @Autowired
    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }
    
    @GetMapping("/{teamId}")
    @Operation(summary = "Get team by ID")
    public ResponseEntity<Team> getTeam(@PathVariable String teamId) {
        Optional<Team> team = teamRepository.findByTeamId(teamId);
        return team.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{teamId}/stats")
    @Operation(summary = "Get team statistics")
    public ResponseEntity<Map<String, Object>> getTeamStats(@PathVariable String teamId) {
        Optional<Team> teamOpt = teamRepository.findByTeamId(teamId);
        if (teamOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Team team = teamOpt.get();
        Map<String, Object> stats = new HashMap<>();
        stats.put("teamId", team.getTeamId());
        stats.put("name", team.getName());
        stats.put("country", team.getCountry());
        stats.put("statistics", team.getStatistics());
        
        return ResponseEntity.ok(stats);
    }
}

