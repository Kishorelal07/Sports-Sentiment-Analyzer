# H-Sports: Cricket Analytics Platform

A simple but functional Sports Analytics and Engagement Platform for cricket with REST API-based architecture.

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  React + Tailwind CSS (REST only)
│  (Port 3000)│
└──────┬──────┘
       │
       │ HTTP REST API
       │
┌──────▼──────┐
│   Backend   │  Spring Boot + MongoDB
│  (Port 8080)│
└──────┬──────┘
       │
       │
┌──────▼──────┐
│  MongoDB    │
│ (Port 27017)│
└─────────────┘
```

**Key Design Decisions:**
- ✅ REST API only (no WebSockets/SSE)
- ✅ All data from `./cricket-data` (mock files)
- ✅ Simple rule-based predictions
- ✅ Clean, extensible architecture

## 📋 Features

### Backend Features
- **Match Data**: Live scores, scorecards, ball-by-ball events
- **Sentiment Analysis**: Social sentiment from mock data
- **Team & Player Analytics**: Statistics and performance metrics
- **Predictions**: Rule-based match outcome predictions
- **Personalized Commentary**: User preference-based commentary
- **Multimedia**: Image/video serving from cricket-data/media

### Frontend Features
- **Home Page**: Match listings with live indicators
- **Match Details**: Live scoreboard, charts, commentary, media gallery
- **Team Pages**: Team statistics and performance charts
- **Player Pages**: Player statistics and performance analysis
- **User Preferences**: Customizable commentary and display options

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB (or use Docker)
- Maven

### Using Docker Compose (Recommended)

```bash
cd h25-sports
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 8080
- Frontend on port 3000

### Manual Setup

#### 1. Start MongoDB
```bash
mongod
```

#### 2. Start Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will:
- Load match metadata from `cricket-data/match-metadata.json`
- Load events from all feed files in `cricket-data/`
- Load sentiment from `cricket-data/sentiment-mock.json`
- Seed MongoDB with initial data

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Matches
- `GET /api/matches` - List all matches
- `GET /api/matches/live` - Get live/ongoing match
- `GET /api/matches/{id}` - Get match details
- `GET /api/matches/{id}/score` - Get scorecard
- `GET /api/matches/{id}/events` - Get ball-by-ball events
- `POST /api/matches/load` - Load match from file

### Events
- `GET /api/events/match/{matchId}` - Get all events for match
- `GET /api/events/match/{matchId}/recent` - Get recent events

### Sentiment
- `GET /api/sentiment/match/{matchId}` - Get match sentiment timeline
- `GET /api/sentiment/player/{playerId}` - Get player sentiment

### Teams
- `GET /api/teams/{teamId}` - Get team details
- `GET /api/teams/{teamId}/stats` - Get team statistics

### Players
- `GET /api/players/{playerId}` - Get player details
- `GET /api/players/{playerId}/stats` - Get player statistics

### Predictions
- `GET /api/predict/match/{matchId}` - Get rule-based match prediction

**Prediction Response:**
```json
{
  "matchId": "eng-aus-t20-2025-11-24",
  "prediction": {
    "team1": 0.63,
    "team2": 0.37
  },
  "explanations": [
    { "feature": "run_rate_difference", "score": 0.22 },
    { "feature": "sentiment_trend", "score": 0.15 },
    { "feature": "wickets_remaining", "score": 0.20 },
    { "feature": "recent_overs", "score": 0.15 },
    { "feature": "head_to_head", "score": 0.10 }
  ]
}
```

### Commentary
- `GET /api/commentary/personalized?userId=XYZ&matchId=ABC` - Get personalized commentary

### User Preferences
- `POST /api/user/preferences` - Update user preferences
- `GET /api/user/{userId}/preferences` - Get user preferences

### Media
- `GET /api/media/match/{matchId}` - List match media files
- `GET /api/media/file/{filename}` - Serve media file

## 📁 Project Structure

```
h25-sports/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/sportsanalytics/
│   │       ├── controller/  # REST controllers
│   │       ├── model/       # MongoDB entities
│   │       ├── repository/  # Data repositories
│   │       ├── service/     # Business logic
│   │       └── adapter/     # Data adapters (Mock only)
│   └── src/main/resources/
│       └── application.yml
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── store/           # State management
│   └── package.json
├── cricket-data/            # Mock data (main data source)
│   ├── match-metadata.json
│   ├── sentiment-mock.json
│   ├── *.json               # Event feed files
│   └── media/               # Images/videos
├── docker-compose.yml
└── README.md
```

## 🎯 Data Sources

All data comes from `./cricket-data/`:

- **match-metadata.json**: Match information, teams, players
- **sentiment-mock.json**: Social sentiment data
- **physics-feed.json**: Ball physics events
- **commentary-feed.json**: Commentary events
- **wicket-feed.json**: Wicket events
- **match-statistics-feed.json**: Match statistics
- **bowler-stats-feed.json**: Bowler performance
- **fielder-feed.json**: Fielding events
- **umpire-decisions-feed.json**: Umpire decisions
- **crowd-reactions-feed.json**: Crowd reactions
- **player-biometric-feed.json**: Player biometrics
- **equipment-sensor-feed.json**: Equipment sensors
- **media/**: Images and videos

## 🔧 Configuration

### Backend (`application.yml`)
```yaml
cricket:
  data:
    base-path: ${CRICKET_DATA_PATH:../cricket-data}
    sentiment-mock-file: sentiment-mock.json
    media-path: ${MEDIA_PATH:../cricket-data/media}
```

### Frontend
Set `VITE_API_BASE` environment variable or it defaults to `http://localhost:8080/api`

## 📊 Prediction Algorithm

Simple rule-based prediction using:
1. **Run Rate Difference** (30% weight): Current vs required run rate
2. **Sentiment Trend** (20% weight): Social sentiment analysis
3. **Wickets Remaining** (20% weight): Wickets in hand
4. **Recent Overs** (15% weight): Performance in last few overs
5. **Head-to-Head** (10% weight): Historical performance (mock)

## 🎨 Frontend Pages

### Home Page (`/`)
- Match listings
- Live match indicator
- Quick stats

### Match Details (`/match/:matchId`)
- Live scoreboard
- Worm chart (run rate)
- Ball-by-ball timeline
- Sentiment chart
- Prediction widget
- Commentary section
- Media gallery

### Team Page (`/team/:teamId`)
- Team statistics
- Performance bar chart
- Player roster

### Player Page (`/player/:playerId`)
- Player statistics
- Performance metrics
- Career highlights

### Preferences (`/preferences`)
- Favorite teams/players
- Commentary style
- Display options

## 🧪 Testing

### Test API Endpoints
```bash
# Get all matches
curl http://localhost:8080/api/matches

# Get live match
curl http://localhost:8080/api/matches/live

# Get match prediction
curl http://localhost:8080/api/predict/match/eng-aus-t20-2025-11-24

# Get sentiment
curl http://localhost:8080/api/sentiment/match/eng-aus-t20-2025-11-24
```

### Swagger UI
Visit `http://localhost:8080/swagger-ui.html` for interactive API documentation.

## 📝 Notes

- **No WebSockets**: All updates are via REST API polling
- **Mock Data Only**: All data comes from `./cricket-data`
- **Simple Predictions**: Rule-based, not ML-based
- **Extensible**: Architecture allows easy addition of real APIs later

## 🚀 Deployment

### Docker
```bash
docker-compose up -d
```

### Manual
1. Start MongoDB
2. Run backend: `mvn spring-boot:run`
3. Run frontend: `npm run dev`

## 📄 License

Hackathon project - SST Hackathon 2025

---

**Built with ❤️ for Cricket Analytics**
