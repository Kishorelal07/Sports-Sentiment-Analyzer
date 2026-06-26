package com.sportsanalytics.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Match {
    @Id
    private String id;
    
    @JsonProperty("match_id")
    private String matchId;
    
    private String series;
    
    @JsonProperty("match_number")
    private Integer matchNumber;
    
    private String format;
    
    private LocalDate date;
    
    private String venue;
    private String city;
    private String country;
    private TossInfo toss;
    private Map<String, Team> teams;
    private List<Umpire> umpires;
    
    @JsonProperty("match_referee")
    private String matchReferee;
    
    private List<Innings> innings;
    private Result result;
    
    @JsonProperty("player_of_match")
    private String playerOfMatch;
    
    @JsonProperty("top_scorers")
    private List<TopScorer> topScorers;
    
    @JsonProperty("top_wicket_takers")
    private List<TopWicketTaker> topWicketTakers;
    
    @JsonProperty("match_highlights")
    private MatchHighlights highlights;
    
    @JsonProperty("data_source")
    private String dataSource;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TossInfo {
        private String winner;
        private String decision;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Team {
        private String name;
        private String captain;
        private String wicketkeeper;
        private List<Player> players;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Player {
        private String name;
        private String id;
        private String role;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Umpire {
        private String name;
        private String role;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Innings {
        private Integer number;
        
        @JsonProperty("batting_team")
        private String battingTeam;
        
        @JsonProperty("bowling_team")
        private String bowlingTeam;
        
        @JsonProperty("total_runs")
        private Integer totalRuns;
        
        @JsonProperty("total_wickets")
        private Integer totalWickets;
        
        @JsonProperty("total_overs")
        private Double totalOvers;
        
        private Integer target;
        private Integer extras;
        private Boundaries boundaries;
        private String note;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Boundaries {
        private Integer fours;
        private Integer sixes;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        private String status;
        private String note;
        
        @JsonProperty("projected_winner")
        private String projectedWinner;
        
        @JsonProperty("projected_margin")
        private String projectedMargin;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopScorer {
        private String player;
        private String team;
        private Integer runs;
        private Integer balls;
        
        @JsonProperty("strike_rate")
        private Double strikeRate;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopWicketTaker {
        private String player;
        private String team;
        private Integer wickets;
        private Integer runs;
        private Double economy;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchHighlights {
        
        @JsonProperty("highest_partnership")
        private HighestPartnership highestPartnership;
        
        @JsonProperty("most_boundaries_in_over")
        private Integer mostBoundariesInOver;
        
        @JsonProperty("powerplay_runs")
        private Integer powerplayRuns;
        
        @JsonProperty("death_overs_runs")
        private Integer deathOversRuns;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HighestPartnership {
        private Integer runs;
        private List<String> players;
        private String team;
    }
}

