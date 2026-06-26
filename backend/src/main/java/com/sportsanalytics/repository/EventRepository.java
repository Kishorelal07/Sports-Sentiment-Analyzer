package com.sportsanalytics.repository;

import com.sportsanalytics.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByMatchIdOrderByTimestampAsc(String matchId);
    
    List<Event> findByMatchIdAndEventTypeOrderByTimestampAsc(String matchId, String eventType);
    
    @Query("{ 'matchId': ?0, 'timestamp': { $gte: ?1 } }")
    List<Event> findRecentEventsByMatchId(String matchId, LocalDateTime since);
    
    List<Event> findByMatchIdAndInningsAndOverNumberAndBallNumber(
        String matchId, Integer innings, Integer overNumber, Integer ballNumber
    );
}

