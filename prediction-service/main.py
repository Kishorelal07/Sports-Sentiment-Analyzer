from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import random
import math

app = FastAPI(title="Cricket Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    match_id: str
    prediction_type: str

class FeatureImportance(BaseModel):
    feature: str
    score: float
    description: str

class PredictionResponse(BaseModel):
    id: str
    match_id: str
    prediction_type: str
    probabilities: Dict[str, float]
    feature_importances: List[FeatureImportance]
    explanation: str

def calculate_match_winner_prediction(match_id: str) -> PredictionResponse:
    """Calculate match winner prediction with explainable features"""
    # Mock probabilities based on match state
    team1_prob = 0.55 + random.uniform(-0.1, 0.1)
    team2_prob = 0.40 + random.uniform(-0.1, 0.1)
    tie_prob = 1.0 - team1_prob - team2_prob
    
    probabilities = {
        "team1": round(team1_prob, 3),
        "team2": round(team2_prob, 3),
        "tie": round(max(0, tie_prob), 3)
    }
    
    features = [
        FeatureImportance(
            feature="current_run_rate",
            score=0.25,
            description="Current run rate advantage"
        ),
        FeatureImportance(
            feature="wickets_remaining",
            score=0.20,
            description="Wickets in hand"
        ),
        FeatureImportance(
            feature="overs_remaining",
            score=0.15,
            description="Overs remaining"
        ),
        FeatureImportance(
            feature="historical_performance",
            score=0.10,
            description="Historical head-to-head record"
        ),
        FeatureImportance(
            feature="pitch_conditions",
            score=0.08,
            description="Pitch conditions favor batting/bowling"
        ),
        FeatureImportance(
            feature="player_form",
            score=0.07,
            description="Key player recent form"
        ),
        FeatureImportance(
            feature="home_advantage",
            score=0.05,
            description="Home ground advantage"
        ),
        FeatureImportance(
            feature="weather_conditions",
            score=0.03,
            description="Weather impact"
        )
    ]
    
    explanation = (
        f"Team 1 has a {probabilities['team1']*100:.1f}% chance of winning based on "
        f"current run rate ({features[0].score*100:.0f}% weight), wickets remaining "
        f"({features[1].score*100:.0f}% weight), and historical performance."
    )
    
    return PredictionResponse(
        id=f"pred_{match_id}_{random.randint(1000, 9999)}",
        match_id=match_id,
        prediction_type="match_winner",
        probabilities=probabilities,
        feature_importances=features,
        explanation=explanation
    )

def calculate_next_wicket_prediction(match_id: str) -> PredictionResponse:
    """Calculate next wicket prediction"""
    yes_prob = 0.35 + random.uniform(-0.1, 0.1)
    no_prob = 1.0 - yes_prob
    
    probabilities = {
        "yes": round(yes_prob, 3),
        "no": round(no_prob, 3)
    }
    
    features = [
        FeatureImportance(
            feature="bowler_form",
            score=0.30,
            description="Bowler's recent form and accuracy"
        ),
        FeatureImportance(
            feature="batsman_pressure",
            score=0.25,
            description="Batsman under pressure (dot balls, required rate)"
        ),
        FeatureImportance(
            feature="pitch_conditions",
            score=0.15,
            description="Pitch conditions (wear, bounce, spin)"
        ),
        FeatureImportance(
            feature="field_placement",
            score=0.12,
            description="Aggressive field placement"
        ),
        FeatureImportance(
            feature="over_number",
            score=0.10,
            description="Stage of innings (powerplay, middle, death)"
        ),
        FeatureImportance(
            feature="partnership_length",
            score=0.08,
            description="Partnership duration and stability"
        )
    ]
    
    explanation = (
        f"Probability of wicket in next delivery: {probabilities['yes']*100:.1f}%. "
        f"Key factors: bowler form ({features[0].score*100:.0f}%), batsman pressure "
        f"({features[1].score*100:.0f}%), and pitch conditions ({features[2].score*100:.0f}%)."
    )
    
    return PredictionResponse(
        id=f"pred_{match_id}_{random.randint(1000, 9999)}",
        match_id=match_id,
        prediction_type="next_wicket",
        probabilities=probabilities,
        feature_importances=features,
        explanation=explanation
    )

def calculate_next_over_runs_prediction(match_id: str) -> PredictionResponse:
    """Calculate next over runs prediction"""
    prob_0_6 = 0.30 + random.uniform(-0.05, 0.05)
    prob_7_12 = 0.40 + random.uniform(-0.05, 0.05)
    prob_13_plus = 1.0 - prob_0_6 - prob_7_12
    
    probabilities = {
        "0-6": round(prob_0_6, 3),
        "7-12": round(prob_7_12, 3),
        "13+": round(max(0, prob_13_plus), 3)
    }
    
    features = [
        FeatureImportance(
            feature="batsman_strike_rate",
            score=0.35,
            description="Batsman's current strike rate"
        ),
        FeatureImportance(
            feature="bowler_economy",
            score=0.25,
            description="Bowler's economy rate in this match"
        ),
        FeatureImportance(
            feature="over_number",
            score=0.15,
            description="Stage of innings (powerplay, middle, death)"
        ),
        FeatureImportance(
            feature="required_run_rate",
            score=0.12,
            description="Required run rate vs current rate"
        ),
        FeatureImportance(
            feature="boundary_probability",
            score=0.08,
            description="Likelihood of boundaries based on field"
        ),
        FeatureImportance(
            feature="partnership_momentum",
            score=0.05,
            description="Partnership momentum and confidence"
        )
    ]
    
    explanation = (
        f"Expected runs in next over: {probabilities['7-12']*100:.1f}% chance of 7-12 runs. "
        f"Based on batsman strike rate ({features[0].score*100:.0f}% weight), "
        f"bowler economy ({features[1].score*100:.0f}% weight), and over stage."
    )
    
    return PredictionResponse(
        id=f"pred_{match_id}_{random.randint(1000, 9999)}",
        match_id=match_id,
        prediction_type="next_over_runs",
        probabilities=probabilities,
        feature_importances=features,
        explanation=explanation
    )

@app.get("/")
def root():
    return {"service": "Cricket Prediction Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Generate prediction based on match ID and prediction type"""
    try:
        if request.prediction_type == "match_winner":
            return calculate_match_winner_prediction(request.match_id)
        elif request.prediction_type == "next_wicket":
            return calculate_next_wicket_prediction(request.match_id)
        elif request.prediction_type == "next_over_runs":
            return calculate_next_over_runs_prediction(request.match_id)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown prediction type: {request.prediction_type}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

