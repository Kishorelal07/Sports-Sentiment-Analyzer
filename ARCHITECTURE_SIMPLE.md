# Simple Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│                  Port: 3000                              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Dashboard│  │  Match   │  │  Team    │             │
│  │          │  │  Detail  │  │  Page    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  Uses: React, Tailwind, Recharts, Axios                │
│  Communication: REST API only (no WebSockets)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP REST
                     │
┌────────────────────▼────────────────────────────────────┐
│              Backend (Spring Boot)                       │
│                  Port: 8080                              │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │           REST Controllers                    │      │
│  │  • MatchController                            │      │
│  │  • EventController                            │      │
│  │  • SentimentController                        │      │
│  │  • TeamController                             │      │
│  │  • PlayerController                           │      │
│  │  • PredictionController                       │      │
│  │  • CommentaryController                        │      │
│  │  • UserController                             │      │
│  │  • MediaController                            │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │              Services                         │      │
│  │  • MatchService                               │      │
│  │  • SentimentService                           │      │
│  │  • SimplePredictionService                    │      │
│  │  • UserService                                │      │
│  │  • DataIngestionService                       │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │            Data Adapters                      │      │
│  │  • MockAdapter (reads ./cricket-data)        │      │
│  │  • MockSentimentAdapter                      │      │
│  └──────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ MongoDB Driver
                     │
┌────────────────────▼────────────────────────────────────┐
│                    MongoDB                               │
│                  Port: 27017                             │
│                                                          │
│  Collections:                                            │
│  • matches                                               │
│  • events                                                │
│  • sentiment                                             │
│  • teams                                                 │
│  • players                                               │
│  • users                                                 │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Data Source (File System)                  │
│                                                          │
│  ./cricket-data/                                         │
│  ├── match-metadata.json                                 │
│  ├── sentiment-mock.json                                │
│  ├── physics-feed.json                                  │
│  ├── commentary-feed.json                               │
│  ├── wicket-feed.json                                   │
│  ├── match-statistics-feed.json                         │
│  ├── bowler-stats-feed.json                             │
│  ├── fielder-feed.json                                  │
│  ├── umpire-decisions-feed.json                         │
│  ├── crowd-reactions-feed.json                          │
│  ├── player-biometric-feed.json                         │
│  ├── equipment-sensor-feed.json                         │
│  └── media/                                             │
│      ├── images/                                        │
│      └── videos/                                        │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Startup
```
Backend starts → DataIngestionService loads → MockAdapter reads files → 
Events saved to MongoDB → Match metadata loaded
```

### 2. API Request Flow
```
Frontend → REST API → Service Layer → Repository → MongoDB → Response
```

### 3. Prediction Flow
```
GET /api/predict/match/{id} → SimplePredictionService → 
Calculate features (run rate, sentiment, wickets) → 
Rule-based calculation → Return probabilities
```

## Key Components

### Backend
- **Controllers**: Handle HTTP requests
- **Services**: Business logic
- **Repositories**: Data access
- **Adapters**: Read from cricket-data files

### Frontend
- **Pages**: Route components
- **Components**: Reusable UI elements
- **Store**: State management (Zustand)
- **Charts**: Recharts for visualizations

## Technology Stack

- **Backend**: Spring Boot 3.2, Java 17, MongoDB, Maven
- **Frontend**: React 18, Tailwind CSS, Recharts, Axios, Vite
- **Database**: MongoDB 7.0
- **Containerization**: Docker, Docker Compose

## No WebSockets/SSE

All updates are simulated via:
- REST API polling (frontend refreshes every 5-10 seconds)
- Static data from mock files
- Simple rule-based calculations

This keeps the architecture simple and extensible.

