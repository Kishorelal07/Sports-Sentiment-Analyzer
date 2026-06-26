package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfile {
    private String playerId;
    private String name;
    private String team;
    private String role;
    private Double latestReleaseSpeed;
    private Double latestSpinRate;
    private Double latestHeartRate;
    private Double energyLevel;
    private Double fatigueLevel;
}

