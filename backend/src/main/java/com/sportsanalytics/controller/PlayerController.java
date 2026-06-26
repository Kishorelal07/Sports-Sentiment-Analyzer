package com.sportsanalytics.controller;

import com.sportsanalytics.model.Player;
import com.sportsanalytics.repository.PlayerRepository;
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
@RequestMapping("/api/players")
@Tag(name = "Players", description = "Player analytics APIs")
public class PlayerController {
    
    private final PlayerRepository playerRepository;
    
    @Autowired
    public PlayerController(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }
    
    @GetMapping("/{playerId}")
    @Operation(summary = "Get player by ID")
    public ResponseEntity<Player> getPlayer(@PathVariable String playerId) {
        Optional<Player> player = playerRepository.findByPlayerId(playerId);
        return player.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{playerId}/stats")
    @Operation(summary = "Get player statistics")
    public ResponseEntity<Map<String, Object>> getPlayerStats(@PathVariable String playerId) {
        Optional<Player> playerOpt = playerRepository.findByPlayerId(playerId);
        if (playerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Player player = playerOpt.get();
        Map<String, Object> stats = new HashMap<>();
        stats.put("playerId", player.getPlayerId());
        stats.put("name", player.getName());
        stats.put("teamId", player.getTeamId());
        stats.put("role", player.getRole());
        stats.put("statistics", player.getStatistics());
        
        return ResponseEntity.ok(stats);
    }
}

