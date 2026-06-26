package com.sportsanalytics.repository;

import com.sportsanalytics.model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends MongoRepository<Player, String> {
    Optional<Player> findByPlayerId(String playerId);
    
    List<Player> findByTeamId(String teamId);
}

