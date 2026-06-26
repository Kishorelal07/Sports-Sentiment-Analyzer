package com.sportsanalytics.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sportsanalytics.model.Match;
import com.sportsanalytics.model.Player;
import com.sportsanalytics.model.Team;
import com.sportsanalytics.repository.MatchRepository;
import com.sportsanalytics.repository.PlayerRepository;
import com.sportsanalytics.repository.TeamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class MatchService {
    
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final ObjectMapper objectMapper;
    private final String basePath;

    public MatchService(
        MatchRepository matchRepository,
        TeamRepository teamRepository,
        PlayerRepository playerRepository,
        @Value("${cricket.data.base-path:../cricket-data}") String basePath
    ) {
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.basePath = basePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    
    public Optional<Match> getMatch(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        Optional<Match> byMatchId = matchRepository.findByMatchId(identifier);
        if (byMatchId.isPresent()) {
            return byMatchId;
        }

        return matchRepository.findById(identifier);
    }
    
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }
    
    public Match loadMatchFromFile() {
        try {
            Path filePath = Paths.get(basePath, "match-metadata.json");
            if (Files.exists(filePath)) {
                Match match = objectMapper.readValue(filePath.toFile(), Match.class);
                match.setCreatedAt(LocalDateTime.now());
                match.setUpdatedAt(LocalDateTime.now());
                
                Optional<Match> existing = matchRepository.findByMatchId(match.getMatchId());
                if (existing.isPresent()) {
                    match.setId(existing.get().getId());
                }
                
                Match saved = matchRepository.save(match);
                syncTeamsAndPlayers(saved);
                return saved;
            }
        } catch (IOException e) {
            log.error("Error loading match metadata", e);
        }
        return null;
    }

    private void syncTeamsAndPlayers(Match match) {
        if (match == null || match.getTeams() == null) {
            return;
        }

        match.getTeams().forEach((key, team) -> {
            if (team == null || team.getName() == null || team.getName().isBlank()) {
                return;
            }

            String teamId = slugify(team.getName());
            Team entity = teamRepository.findByTeamId(teamId)
                .orElseGet(() -> new Team(null, teamId, null, null, new HashMap<>(), LocalDateTime.now(), null));

            entity.setName(team.getName());
            entity.setCountry(match.getCountry());
            entity.setUpdatedAt(LocalDateTime.now());
            teamRepository.save(entity);

            if (team.getPlayers() != null) {
                team.getPlayers().forEach(p -> {
                    if (p == null || (p.getId() == null && p.getName() == null)) {
                        return;
                    }
                    String playerId = p.getId() != null ? p.getId() : slugify(p.getName());
                    if (playerId == null || playerId.isBlank()) {
                        return;
                    }
                    Player player = playerRepository.findByPlayerId(playerId)
                        .orElseGet(() -> new Player(null, playerId, null, null, null, new HashMap<>(), LocalDateTime.now(), null));
                    player.setName(p.getName());
                    player.setTeamId(teamId);
                    player.setRole(p.getRole());
                    player.setUpdatedAt(LocalDateTime.now());
                    Map<String, Object> stats = player.getStatistics() != null ? new HashMap<>(player.getStatistics()) : new HashMap<>();
                    stats.put("teamName", team.getName());
                    stats.put("lastMatchId", match.getMatchId());
                    player.setStatistics(stats);
                    playerRepository.save(player);
                });
            }
        });
    }

    private String slugify(String input) {
        if (input == null) {
            return null;
        }
        String slug = input.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return slug.isBlank() ? null : slug;
    }
}

