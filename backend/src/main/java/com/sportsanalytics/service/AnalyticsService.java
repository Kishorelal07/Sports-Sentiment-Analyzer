package com.sportsanalytics.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sportsanalytics.model.Match;
import com.sportsanalytics.model.PlayerProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AnalyticsService {

    private final String basePath;
    private final ObjectMapper objectMapper;

    private List<Map<String, Object>> bowlerStats = Collections.emptyList();
    private List<Map<String, Object>> playerBiometrics = Collections.emptyList();
    private List<PlayerProfile> playerProfiles = Collections.emptyList();

    public AnalyticsService(@Value("${cricket.data.base-path:../cricket-data}") String basePath) {
        this.basePath = basePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() {
        bowlerStats = loadFeed("bowler-stats-feed.json");
        playerBiometrics = loadFeed("player-biometric-feed.json");
        playerProfiles = buildPlayerProfiles();
        log.info("AnalyticsService initialized: {} bowler stats, {} biometrics, {} player profiles",
            bowlerStats.size(), playerBiometrics.size(), playerProfiles.size());
    }

    public List<Map<String, Object>> getBowlerStats(int limit) {
        if (bowlerStats.isEmpty()) {
            bowlerStats = loadFeed("bowler-stats-feed.json");
        }
        return bowlerStats.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPlayerBiometrics(int limit) {
        if (playerBiometrics.isEmpty()) {
            playerBiometrics = loadFeed("player-biometric-feed.json");
        }
        return playerBiometrics.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    public List<PlayerProfile> getPlayerProfiles(int limit) {
        if (playerProfiles.isEmpty()) {
            playerProfiles = buildPlayerProfiles();
        }
        return playerProfiles.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> loadFeed(String fileName) {
        Path filePath = Paths.get(basePath, fileName);
        if (!Files.exists(filePath)) {
            log.warn("Feed file not found: {}", filePath);
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(
                filePath.toFile(),
                new TypeReference<List<Map<String, Object>>>() {}
            );
        } catch (IOException e) {
            log.error("Failed to load feed {}", fileName, e);
            return Collections.emptyList();
        }
    }

    private Match loadMatchMetadata() {
        Path filePath = Paths.get(basePath, "match-metadata.json");
        if (!Files.exists(filePath)) {
            log.warn("match-metadata.json not found at {}", filePath);
            return null;
        }
        try {
            return objectMapper.readValue(filePath.toFile(), Match.class);
        } catch (IOException e) {
            log.error("Failed to read match metadata", e);
            return null;
        }
    }

    private List<PlayerProfile> buildPlayerProfiles() {
        Map<String, PlayerProfile> map = new LinkedHashMap<>();

        // Populate from match metadata
        Match match = loadMatchMetadata();
        if (match != null && match.getTeams() != null) {
            match.getTeams().forEach((key, team) -> {
                if (team.getPlayers() != null) {
                    team.getPlayers().forEach(player -> {
                        if (player.getId() == null) {
                            return;
                        }
                        PlayerProfile profile = map.computeIfAbsent(player.getId(), id -> new PlayerProfile());
                        profile.setPlayerId(player.getId());
                        profile.setName(player.getName());
                        profile.setTeam(team.getName());
                        profile.setRole(player.getRole());
                    });
                }
            });
        }

        // Enrich from bowler stats
        for (Map<String, Object> stat : bowlerStats) {
            String bowlerId = (String) stat.get("bowler_id");
            if (bowlerId == null) continue;

            PlayerProfile profile = map.computeIfAbsent(bowlerId, id -> new PlayerProfile());
            profile.setPlayerId(bowlerId);

            if (profile.getName() == null) {
                profile.setName((String) stat.get("bowler_name"));
            }
            if (profile.getRole() == null) {
                profile.setRole("Bowler");
            }

            profile.setLatestReleaseSpeed(getDouble(stat.get("release_speed_kmh"), profile.getLatestReleaseSpeed()));
            profile.setLatestSpinRate(getDouble(stat.get("spin_rpm"), profile.getLatestSpinRate()));
            profile.setFatigueLevel(getDouble(stat.get("fatigue_level"), profile.getFatigueLevel()));
        }

        // Enrich from biometrics
        for (Map<String, Object> bio : playerBiometrics) {
            String playerId = (String) bio.get("player_id");
            if (playerId == null) continue;

            PlayerProfile profile = map.computeIfAbsent(playerId, id -> new PlayerProfile());
            profile.setPlayerId(playerId);
            if (profile.getRole() == null) {
                profile.setRole((String) bio.get("player_role"));
            }

            profile.setLatestHeartRate(getDouble(bio.get("heart_rate_bpm"), profile.getLatestHeartRate()));
            profile.setEnergyLevel(getDouble(bio.get("energy_level"), profile.getEnergyLevel()));
            profile.setFatigueLevel(getDouble(bio.get("muscle_fatigue_index"), profile.getFatigueLevel()));
        }

        return new ArrayList<>(map.values());
    }

    private Double getDouble(Object value, Double fallback) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return fallback;
    }
}

