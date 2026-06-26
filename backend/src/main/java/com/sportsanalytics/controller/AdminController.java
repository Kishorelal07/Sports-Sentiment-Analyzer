package com.sportsanalytics.controller;

import com.sportsanalytics.model.Match;
import com.sportsanalytics.model.User;
import com.sportsanalytics.repository.MatchRepository;
import com.sportsanalytics.repository.UserRepository;
import com.sportsanalytics.service.MatchService;
import com.sportsanalytics.repository.PlayerRepository;
import com.sportsanalytics.repository.TeamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin management APIs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    
    @Autowired
    public AdminController(
        MatchRepository matchRepository,
        UserRepository userRepository,
        MatchService matchService,
        TeamRepository teamRepository,
        PlayerRepository playerRepository
    ) {
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.matchService = matchService;
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
    }
    
    // Match Management
    @GetMapping("/matches")
    @Operation(summary = "Get all matches (admin)")
    public ResponseEntity<List<Match>> getAllMatches() {
        return ResponseEntity.ok(matchRepository.findAll());
    }
    
    @PostMapping("/matches")
    @Operation(summary = "Create new match")
    public ResponseEntity<Match> createMatch(@RequestBody Match match) {
        // Set timestamps
        match.setCreatedAt(java.time.LocalDateTime.now());
        match.setUpdatedAt(java.time.LocalDateTime.now());
        
        // Validate matchId is unique
        if (match.getMatchId() != null && matchRepository.findByMatchId(match.getMatchId()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        
        Match saved = matchRepository.save(match);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/matches/{id}")
    @Operation(summary = "Update match")
    public ResponseEntity<Match> updateMatch(@PathVariable String id, @RequestBody Match match) {
        Optional<Match> existingMatch = matchRepository.findById(id);
        if (existingMatch.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        match.setId(id);
        match.setUpdatedAt(java.time.LocalDateTime.now());
        // Preserve createdAt
        if (existingMatch.get().getCreatedAt() != null) {
            match.setCreatedAt(existingMatch.get().getCreatedAt());
        }
        
        Match saved = matchRepository.save(match);
        return ResponseEntity.ok(saved);
    }
    
    @DeleteMapping("/matches/{id}")
    @Operation(summary = "Delete match")
    public ResponseEntity<Map<String, String>> deleteMatch(@PathVariable String id) {
        matchRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Match deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/matches/reload")
    @Operation(summary = "Reload match from file")
    public ResponseEntity<Match> reloadMatch() {
        Match match = matchService.loadMatchFromFile();
        if (match != null) {
            return ResponseEntity.ok(match);
        }
        return ResponseEntity.badRequest().build();
    }
    
    // User Management
    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    @PostMapping("/users")
    @Operation(summary = "Create new user")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }
    
    @PutMapping("/users/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        user.setId(id);
        return ResponseEntity.ok(userRepository.save(user));
    }
    
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get admin statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMatches", matchRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("adminUsers", userRepository.findAll().stream()
            .filter(u -> "ADMIN".equals(u.getRole()))
            .count());
        return ResponseEntity.ok(stats);
    }
}

