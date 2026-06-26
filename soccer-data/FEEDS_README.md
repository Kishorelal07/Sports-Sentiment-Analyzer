# Soccer Data Feeds - Technical Documentation

**🏆 Manchester United vs Everton - Premier League 2025/26**

This document provides detailed technical specifications for all soccer event feeds available in the hackathon dataset.

## 📊 Feed Overview

| Feed File | Events | Primary Focus | Correlation Keys |
|-----------|--------|---------------|------------------|
| `ball-physics-feed.json` | 1,401 | Ball movement & physics | `match_id`, `timestamp`, `minute` |
| `player-stats-feed.json` | 462 | Individual performance | `player_id`, `match_id`, `timestamp` |
| `player-positioning-feed.json` | 285 | Player movement & heatmaps | `player_id`, `match_id`, `timestamp` |
| `commentary-feed.json` | 474 | Live match commentary | `match_id`, `timestamp`, `minute` |
| `scoring-feed.json` | 466 | Shots, goals & scoring opportunities | `match_id`, `timestamp`, `minute` |
| `referee-decisions-feed.json` | 391 | Cards, fouls & disciplinary actions | `match_id`, `timestamp`, `minute` |
| `crowd-reactions-feed.json` | 103 | Stadium atmosphere | `match_id`, `timestamp`, `minute` |

**Total Events**: 7,392 across all feeds
**Match Duration**: 94 minutes (90 + 4 added time)
**Teams**: Manchester United vs Everton

## 🔗 Event Correlation

All events share common correlation fields:

```json
{
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:00:50Z",
  "minute": 0.83
}
```

### Advanced Correlation Options:
- **`player_id`**: Link events involving specific players
- **`possession_team`**: Track team ball possession
- **`event_type` + `sub_type`**: Categorize event types

---

## 🎯 Feed Details

### 1. Ball Physics Feed (`ball-physics-feed.json`)

**Purpose**: Detailed ball movement, trajectory, and physical properties
**Event Types**: `ball_physics`
**Sub-types**: `pass`, `shot`, `tackle`, `save`, `clearance`, `throw_in`, `corner`, `free_kick`, `pass_impact`

#### Sample Events:

**Pass Event:**
```json
{
  "eventId": "BALL_2",
  "event_type": "ball_physics",
  "sub_type": "pass",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:03:05Z",
  "minute": 2.5,
  "possession_team": "Manchester United",
  "passer_id": "martial_a",
  "receiver_id": "rashford_m",
  "pass_success": true,
  "physics_data": {
    "distance_meters": 29.71,
    "speed_mps": 31.82,
    "accuracy_percentage": 86.5,
    "launch_angle_degrees": 11.4,
    "spin_rpm": 98.0,
    "ball_height_max": 2.37
  }
}
```

**Pass Impact Event:**
```json
{
  "eventId": "BALL_2_impact",
  "event_type": "ball_physics",
  "sub_type": "pass_impact",
  "receiver_id": "rashford_m",
  "physics_data": {
    "impact_force": 69.6,
    "control_quality": 0.93,
    "first_touch_distance": 1.47
  }
}
```

### 2. Player Stats Feed (`player-stats-feed.json`)

**Purpose**: Individual player performance metrics and statistics
**Event Types**: `player_stats`
**Sub-types**: `pass_completed`, `shot_attempt`, `tackle`, `save`, `interception`, `dribble`, `foul_committed`, `foul_suffered`

#### Sample Event:
```json
{
  "eventId": "STATS_1",
  "event_type": "player_stats",
  "sub_type": "pass_completed",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:01:15Z",
  "minute": 1.25,
  "player_id": "fernandes_b",
  "player_name": "Bruno Fernandes",
  "team": "Manchester United",
  "stats_data": {
    "pass_distance": 25.4,
    "pass_accuracy": 92.0,
    "pass_type": "ground_pass",
    "pressure_level": "medium"
  }
}
```

### 3. Player Positioning Feed (`player-positioning-feed.json`)

**Purpose**: Player movement patterns, positioning, and spatial analysis
**Event Types**: `player_positioning`
**Sub-types**: `movement`, `position_update`, `heat_map_point`, `defensive_action`, `offensive_action`

#### Sample Event:
```json
{
  "eventId": "POS_1",
  "event_type": "player_positioning",
  "sub_type": "movement",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:02:30Z",
  "minute": 2.5,
  "player_id": "rashford_m",
  "team": "Manchester United",
  "position_data": {
    "x_coordinate": 65.2,
    "y_coordinate": 78.4,
    "speed_kmh": 12.5,
    "direction_degrees": 45.0,
    "distance_covered_meters": 8.7
  }
}
```

### 4. Commentary Feed (`commentary-feed.json`)

**Purpose**: Live match commentary with sentiment analysis
**Event Types**: `commentary`
**Sub-types**: `descriptive`, `analytical`, `atmospheric`, `technical`, `emotional`

#### Sample Event:
```json
{
  "eventId": "COMM_1",
  "event_type": "commentary",
  "sub_type": "descriptive",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:23:00Z",
  "minute": 23,
  "commentary_text": "Fernandes delivers a pinpoint cross to Rashford who heads powerfully towards goal!",
  "sentiment": "excited",
  "key_players": ["fernandes_b", "rashford_m"],
  "context": "goal_attempt"
}
```

### 5. Scoring Feed (`scoring-feed.json`)

**Purpose**: Detailed analysis of shots, goals, and scoring opportunities
**Event Types**: `scoring`
**Sub-types**: `shot_attempt`, `goal`, `penalty`, `own_goal`, `shot_blocked`

#### Sample Events:

**Shot Attempt:**
```json
{
  "eventId": "SCORE_1",
  "event_type": "scoring",
  "sub_type": "shot_attempt",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:23:00Z",
  "minute": 23,
  "team": "Manchester United",
  "player_id": "fernandes_b",
  "shot_details": {
    "shot_type": "header",
    "body_part": "head",
    "distance_from_goal": 8.5,
    "shot_speed_kmh": 85.2,
    "shot_accuracy": 0.82,
    "shot_angle_degrees": 15.3,
    "goal_probability": 0.35,
    "shot_quality_score": 8.7
  },
  "outcome": "goal"
}
```

**Goal Event:**
```json
{
  "eventId": "SCORE_1_goal",
  "event_type": "scoring",
  "sub_type": "goal",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:23:05Z",
  "minute": 23,
  "team": "Manchester United",
  "player_id": "rashford_m",
  "assist_player_id": "fernandes_b",
  "goal_details": {
    "goal_type": "open_play",
    "goal_speed_kmh": 85.2,
    "goal_angle_degrees": 15.3,
    "time_to_react_ms": 280
  }
}
```

### 6. Referee Decisions Feed (`referee-decisions-feed.json`)

**Purpose**: Disciplinary actions, fouls, and referee interventions
**Event Types**: `referee_decision`
**Sub-types**: `foul`, `yellow_card`, `red_card`, `penalty`, `free_kick`, `offside`, `handball`

#### Sample Events:

**Foul Event:**
```json
{
  "eventId": "REF_1",
  "event_type": "referee_decision",
  "sub_type": "foul",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:34:00Z",
  "minute": 34,
  "foul_committed_by": "davies_t",
  "foul_suffered_by": "rashford_m",
  "foul_details": {
    "foul_type": "tackle_from_behind",
    "severity": "medium",
    "location": "defensive_third",
    "resulting_action": "free_kick"
  }
}
```

**Card Event:**
```json
{
  "eventId": "REF_1_card",
  "event_type": "referee_decision",
  "sub_type": "yellow_card",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:34:15Z",
  "minute": 34,
  "player_id": "davies_t",
  "card_details": {
    "card_type": "yellow",
    "reason": "reckless_challenge",
    "severity": "standard"
  }
}
```

### 7. Crowd Reactions Feed (`crowd-reactions-feed.json`)

**Purpose**: Stadium atmosphere and fan engagement metrics
**Event Types**: `crowd_reaction`
**Sub-types**: `goal_celebration`, `near_miss`, `controversial_decision`, `atmospheric`

#### Sample Event:
```json
{
  "eventId": "CROWD_1",
  "event_type": "crowd_reaction",
  "sub_type": "goal_celebration",
  "match_id": "muf-eve-pl-2025-11-24",
  "timestamp": "2025-11-24T20:23:10Z",
  "minute": 23,
  "reaction_type": "celebration",
  "intensity_level": 0.85,
  "crowd_data": {
    "noise_level_db": 95.2,
    "chant_type": "goal_chant",
    "section_reaction": "home_end",
    "estimated_fans_standing": 0.78
  }
}
```

---

## 🏗️ Schema Development Guidelines

### Event Correlation Strategies:

1. **Time-based Correlation:**
   ```javascript
   // Find all events within a 30-second window of a goal
   const goalTime = "2025-11-24T20:23:00Z";
   const relatedEvents = allEvents.filter(event =>
     Math.abs(new Date(event.timestamp) - new Date(goalTime)) < 30000
   );
   ```

2. **Player-based Correlation:**
   ```javascript
   // Track Rashford's involvement in goal sequence
   const rashfordEvents = allEvents.filter(event =>
     event.player_id === "rashford_m" &&
     event.minute >= 22 && event.minute <= 24
   );
   ```

3. **Team Possession Correlation:**
   ```javascript
   // Analyze Manchester United's attacking sequence
   const unitedAttack = ballPhysicsEvents.filter(event =>
     event.possession_team === "Manchester United" &&
     event.minute >= 20 && event.minute <= 25
   );
   ```

### Data Processing Tips:

- **Match Phases**: Divide match into 15-minute segments for tactical analysis
- **Player Fatigue**: Monitor `player_stats` events for performance degradation
- **Set Pieces**: Filter for `corner`, `free_kick`, `throw_in` events
- **Scoring Opportunities**: Combine `scoring` and `ball_physics` feeds
- **Disciplinary Timeline**: Track card accumulation and match flow impact
