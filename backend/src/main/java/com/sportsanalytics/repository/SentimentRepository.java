package com.sportsanalytics.repository;

import com.sportsanalytics.model.Sentiment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SentimentRepository extends MongoRepository<Sentiment, String> {
    List<Sentiment> findByMatchIdOrderByTimestampAsc(String matchId);
    
    List<Sentiment> findByPlayerIdOrderByTimestampAsc(String playerId);
    
    @Query("{ 'matchId': ?0, 'timestamp': { $gte: ?1 } }")
    List<Sentiment> findRecentSentimentByMatchId(String matchId, LocalDateTime since);
    
    @Query("{ 'playerId': ?0, 'timestamp': { $gte: ?1 } }")
    List<Sentiment> findRecentSentimentByPlayerId(String playerId, LocalDateTime since);
}

