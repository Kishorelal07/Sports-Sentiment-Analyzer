package com.sportsanalytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIPredictionResult {
    private String prediction;
    private String confidence;
    private String reasoning;
}
