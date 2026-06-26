package com.sportsanalytics.controller;

import com.sportsanalytics.model.PlayerProfile;
import com.sportsanalytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Player & bowler analytics APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/players")
    @Operation(summary = "Get player profiles for carousel")
    public ResponseEntity<List<PlayerProfile>> getPlayers(
        @RequestParam(defaultValue = "12") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getPlayerProfiles(limit));
    }

    @GetMapping("/bowler-stats")
    @Operation(summary = "Get bowler stats feed")
    public ResponseEntity<List<Map<String, Object>>> getBowlerStats(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getBowlerStats(limit));
    }

    @GetMapping("/biometrics")
    @Operation(summary = "Get player biometric feed")
    public ResponseEntity<List<Map<String, Object>>> getPlayerBiometrics(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getPlayerBiometrics(limit));
    }
}

