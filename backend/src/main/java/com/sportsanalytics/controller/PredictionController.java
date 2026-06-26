package com.sportsanalytics.controller;

import com.sportsanalytics.service.SimplePredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/predict")
@Tag(name = "Predictions", description = "Match prediction APIs")
public class PredictionController {
    
    private final SimplePredictionService predictionService;
    
    @Autowired
    public PredictionController(SimplePredictionService predictionService) {
        this.predictionService = predictionService;
    }
    
    @GetMapping("/match/{matchId}")
    @Operation(summary = "Get match prediction (rule-based)")
    public ResponseEntity<Map<String, Object>> getMatchPrediction(@PathVariable String matchId) {
        Map<String, Object> prediction = predictionService.predictMatch(matchId);
        return ResponseEntity.ok(prediction);
    }
}
