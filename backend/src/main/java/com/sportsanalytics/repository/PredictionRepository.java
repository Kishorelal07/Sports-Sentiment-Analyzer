package com.sportsanalytics.repository;

import com.sportsanalytics.model.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends MongoRepository<Prediction, String> {
    List<Prediction> findByMatchIdOrderByTimestampDesc(String matchId);
    
    Optional<Prediction> findFirstByMatchIdAndPredictionTypeOrderByTimestampDesc(
        String matchId, String predictionType
    );
}

