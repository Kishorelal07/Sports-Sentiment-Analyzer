# Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React 18 + Tailwind CSS + Zustand + Recharts                │
│  Port: 3000                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST + WebSocket/SSE
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     Backend Layer                            │
│  Spring Boot 3.2 + Spring Data MongoDB + WebSocket          │
│  Port: 8080                                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  REST APIs   │  │  WebSocket   │  │  SSE Streams  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Adapters   │  │   Services   │  │ Controllers  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼────┐  ┌───▼──────┐  ┌──▼──────────┐
│  MongoDB   │  │Prediction│  │  External    │
│  Port:     │  │ Service  │  │  APIs       │
│  27017     │  │ Port:    │  │ (ESPN, etc) │
│            │  │  8000    │  │             │
└────────────┘  └──────────┘  └─────────────┘
```

## Component Details

### Frontend Components

1. **Dashboard** (`/`)
   - Lists all matches
   - Quick match overview cards

2. **Match Detail** (`/match/:matchId`)
   - Live scoreboard
   - Event timeline
   - Worm chart (run rate)
   - Sentiment chart
   - Prediction cards
   - Media carousel

3. **User Preferences** (`/preferences`)
   - Commentary style selection
   - Display options
   - Language preferences

### Backend Services

1. **MatchService**
   - Match CRUD operations
   - Load match from file

2. **DataIngestionService**
   - Manages data adapter lifecycle
   - Streams events to subscribers
   - Persists events to MongoDB

3. **SentimentService**
   - Manages sentiment adapters
   - Streams sentiment updates
   - Aggregates sentiment data

4. **PredictionService**
   - Calls prediction microservice
   - Caches predictions
   - Fallback to mock predictions

5. **PersonalizedFeedService**
   - Merges events, sentiment, predictions
   - Filters based on user preferences
   - Sorts by timestamp

### Data Adapters

#### MockAdapter
- Reads from `./cricket-data/*.json`
- Replays events with timing
- Used for development/testing

#### ESPNAdapter (Stub)
- Placeholder for ESPN API integration
- Documented interface

#### CricAPIAdapter (Stub)
- Placeholder for CricAPI integration
- Documented interface

### Data Flow

#### Event Ingestion Flow
```
Data Source → Adapter → DataIngestionService → MongoDB
                              ↓
                         WebSocket/SSE
                              ↓
                         Frontend
```

#### Sentiment Flow
```
Sentiment Source → SentimentAdapter → SentimentService → MongoDB
                                            ↓
                                       WebSocket/SSE
                                            ↓
                                       Frontend
```

#### Prediction Flow
```
Match State → PredictionService → Prediction Microservice
                                      ↓
                                 Probabilities + Features
                                      ↓
                                 MongoDB Cache
                                      ↓
                                 Frontend
```

## Database Schema

### Collections

1. **matches**
   - Match metadata
   - Teams, players, venue
   - Innings data

2. **events**
   - All match events
   - Correlated by matchId, innings, over, ball

3. **sentiment**
   - Social sentiment data
   - Per match and per player

4. **predictions**
   - Match predictions
   - Probabilities and feature importances

5. **users**
   - User accounts
   - Preferences

6. **players**
   - Player profiles
   - Statistics

7. **teams**
   - Team profiles
   - Statistics

## Real-Time Communication

### WebSocket
- Endpoint: `/ws/live`
- Protocol: STOMP over SockJS
- Topics: `/topic/events`, `/topic/sentiment`

### Server-Sent Events (SSE)
- Endpoint: `/api/events/match/{matchId}/stream`
- Endpoint: `/api/sentiment/match/{matchId}/stream`
- Format: `text/event-stream`

## Security Considerations

1. **CORS**: Configured for development (allow all)
2. **Authentication**: Not implemented (hackathon scope)
3. **API Keys**: Stored in environment variables
4. **Data Validation**: Input validation on controllers

## Scalability

### Horizontal Scaling
- Stateless backend services
- MongoDB replica sets
- Load balancer for frontend

### Caching Strategy
- Prediction results cached in MongoDB
- Event streams use reactive backpressure
- Frontend state management with Zustand

## Monitoring

### Health Checks
- `/actuator/health` - Service health
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus metrics (optional)

### Logging
- Structured logging with SLF4J
- Log levels configurable per package

## Deployment

### Docker Compose
- All services containerized
- Volume mounts for data files
- Health checks for dependencies

### Environment Variables
- MongoDB connection
- Adapter configuration
- Service URLs
- API keys

## Future Enhancements

1. **Authentication & Authorization**
   - JWT tokens
   - Role-based access control

2. **Advanced Analytics**
   - Machine learning models
   - Historical trend analysis

3. **Multi-sport Support**
   - Abstract sport-specific logic
   - Pluggable sport adapters

4. **Notification System**
   - Push notifications
   - Email alerts

5. **Advanced Visualizations**
   - 3D ball tracking
   - Heat maps
   - Player movement analysis

