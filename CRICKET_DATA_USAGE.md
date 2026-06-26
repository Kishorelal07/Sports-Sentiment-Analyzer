# Cricket Data Usage & Use Cases

## Overview
The `cricket-data` folder contains comprehensive mock cricket match data that powers the entire H-SPORTS platform. This document explains how the data is used and its various use cases.

## Data Files Structure

### 1. **match-metadata.json**
**Purpose**: Main match information and metadata
**Used By**: `MatchService.java`
**Use Cases**:
- Loads match details (teams, venue, date, format)
- Provides match structure and configuration
- Contains innings data, scores, and results
- Used for match display on home page and match detail pages

**Code Location**: `backend/src/main/java/com/sportsanalytics/service/MatchService.java`
```java
public Match loadMatchFromFile() {
    Path filePath = Paths.get(basePath, "match-metadata.json");
    // Loads and saves match to MongoDB
}
```

---

### 2. **Event Feed Files** (10 different feeds)
**Purpose**: Real-time event streams for ball-by-ball data
**Used By**: `MockAdapter.java` → Loads all 10 feed files
**Use Cases**: Power event timeline, statistics, and analytics

#### Feed Files Loaded:

1. **physics-feed.json** (Ball Physics)
   - Ball release speed, spin rate, trajectory
   - Bounce characteristics, bat-ball impact
   - **Use Case**: Physics-based analytics, ball tracking

2. **bowler-stats-feed.json** (Bowler Analytics)
   - Run-up data, release metrics
   - Fatigue levels, accuracy scores
   - **Use Case**: Bowler performance analysis, fatigue tracking

3. **fielder-feed.json** (Fielding Data)
   - Fielder positions, reaction times
   - Catch probabilities, dive angles
   - **Use Case**: Fielding performance, positioning analysis

4. **commentary-feed.json** (Text Commentary)
   - Live commentary text
   - **Use Case**: Personalized commentary engine

5. **wicket-feed.json** (Wicket Events)
   - Dismissal types, wicket details
   - **Use Case**: Wicket tracking, dismissal analysis

6. **umpire-decisions-feed.json** (Umpire Calls)
   - LBW, caught, run-out decisions
   - **Use Case**: Decision tracking, review analysis

7. **crowd-reactions-feed.json** (Crowd Data)
   - Crowd noise levels, reactions
   - **Use Case**: Atmosphere metrics, engagement tracking

8. **match-statistics-feed.json** (Match Stats)
   - Run rates, partnerships, over-by-over stats
   - **Use Case**: Match statistics, run rate charts, worm charts

9. **player-biometric-feed.json** (Player Health)
   - Heart rate, fatigue, biometric data
   - **Use Case**: Player fitness tracking, performance correlation

10. **equipment-sensor-feed.json** (Equipment Data)
    - Bat sensor data, equipment metrics
    - **Use Case**: Equipment performance analysis

**Code Location**: `backend/src/main/java/com/sportsanalytics/adapter/MockAdapter.java`
```java
String[] feedFiles = {
    "physics-feed.json", "bowler-stats-feed.json", "fielder-feed.json",
    "commentary-feed.json", "wicket-feed.json", "umpire-decisions-feed.json",
    "crowd-reactions-feed.json", "match-statistics-feed.json",
    "player-biometric-feed.json", "equipment-sensor-feed.json"
};
// Loads all files and converts to Event objects
```

---

### 3. **sentiment-mock.json**
**Purpose**: Social media sentiment data
**Used By**: `MockSentimentAdapter.java`
**Use Cases**:
- Sentiment analysis charts
- Fan engagement metrics
- Social media trends

**Code Location**: `backend/src/main/java/com/sportsanalytics/adapter/MockSentimentAdapter.java`

---

## Data Flow & Processing

### 1. **Startup Data Loading**
When the backend starts:
1. **MatchService** loads `match-metadata.json` → Saved to MongoDB
2. **MockAdapter** loads all 10 event feed files → Cached in memory
3. **MockSentimentAdapter** loads `sentiment-mock.json` → Cached in memory
4. **DataIngestionService** loads events from MockAdapter → Saved to MongoDB

**Code**: `backend/src/main/java/com/sportsanalytics/service/DataIngestionService.java`

### 2. **Runtime Data Access**
- **Match Data**: Retrieved from MongoDB (loaded from match-metadata.json)
- **Events**: Retrieved from MongoDB (loaded from event feeds)
- **Sentiment**: Retrieved from MongoDB (loaded from sentiment-mock.json)

---

## Use Cases by Feature

### ✅ **1. Live Match Display**
- **Data Source**: `match-metadata.json`
- **Features**:
  - Match score, teams, venue
  - Innings data, run rates
  - Player of match, top scorers
- **Frontend**: Home page, Match detail page

### ✅ **2. Event Timeline (Ball-by-Ball)**
- **Data Source**: All 10 event feed files
- **Features**:
  - Real-time event stream
  - Ball-by-ball updates
  - Event type filtering
- **Frontend**: Match detail page → EventTimeline component

### ✅ **3. Run Rate Charts (Worm Chart)**
- **Data Source**: `match-statistics-feed.json`
- **Features**:
  - Over-by-over run progression
  - Visual worm chart
- **Frontend**: Match detail page → WormChart component

### ✅ **4. Sentiment Analysis**
- **Data Source**: `sentiment-mock.json`
- **Features**:
  - Positive/negative/neutral sentiment
  - Sentiment trends over time
  - Player-specific sentiment
- **Frontend**: Match detail page → SentimentChart component

### ✅ **5. Match Predictions**
- **Data Source**: 
  - `match-metadata.json` (match state)
  - Event feeds (run rate, wickets)
  - `sentiment-mock.json` (sentiment trends)
- **Features**:
  - Win probability calculations
  - Rule-based predictions
  - AI-enhanced predictions (Cohere)
- **Frontend**: Home page, Match detail page → PredictionCard component

### ✅ **6. Team & Player Analytics**
- **Data Source**: 
  - `match-metadata.json` (team stats)
  - `bowler-stats-feed.json` (bowler performance)
  - `player-biometric-feed.json` (player health)
- **Features**:
  - Team performance metrics
  - Player statistics
  - Performance charts
- **Frontend**: Team page, Player page

### ✅ **7. Personalized Commentary**
- **Data Source**: `commentary-feed.json`
- **Features**:
  - Rule-based commentary generation
  - User preference integration
- **Frontend**: Match detail page → CommentarySection component

### ✅ **8. Multimedia Content**
- **Data Source**: `cricket-data/media/` folder
- **Features**:
  - Match images
  - Highlight videos
  - Photo galleries
- **Frontend**: Match detail page → MediaCarousel component

---

## Data Statistics

From `match-metadata.json`:
- **Total Feed Events**: 85,551 events
- **Total Balls**: 159 balls (129 + 30)
- **Events per Ball**: Average 538 events per ball
- **Feed Files**: 10 different event streams

---

## Configuration

Data path is configured in `application.yml`:
```yaml
cricket:
  data:
    base-path: ${CRICKET_DATA_PATH:../cricket-data}
    mock-stream-file: ${MOCK_STREAM_FILE:mock-match-stream.json}
    sentiment-mock-file: ${SENTIMENT_MOCK_FILE:sentiment-mock.json}
    media-path: ${MEDIA_PATH:../cricket-data/media}
```

---

## Key Components Using Cricket Data

1. **MockAdapter** - Loads and caches all event feeds
2. **MockSentimentAdapter** - Loads sentiment data
3. **MatchService** - Loads match metadata
4. **DataIngestionService** - Ingests events into MongoDB
5. **SimplePredictionService** - Uses match data for predictions
6. **MediaController** - Serves multimedia from media folder

---

## Summary

The `cricket-data` folder is the **primary data source** for the entire platform:
- ✅ **Match Information**: Teams, scores, venues, dates
- ✅ **Event Streams**: 85,551+ events across 10 different feeds
- ✅ **Sentiment Data**: Social media sentiment analysis
- ✅ **Multimedia**: Images and videos
- ✅ **Statistics**: Comprehensive match and player statistics

All data is loaded at startup and made available through REST APIs for the frontend to consume and display.

