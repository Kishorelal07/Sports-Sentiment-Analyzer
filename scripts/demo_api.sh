#!/bin/bash

# Demo API script - demonstrates key API endpoints

BASE_URL="http://localhost:8080/api"
MATCH_ID="eng-aus-t20-2025-11-24"

echo "=== Cricket Analytics Platform API Demo ==="
echo ""

echo "1. Get all matches:"
curl -s "$BASE_URL/matches" | jq '.[0] | {matchId, series, venue}' || echo "No matches found"
echo ""

echo "2. Get match details:"
curl -s "$BASE_URL/matches/$MATCH_ID" | jq '{matchId, series, venue, teams}' || echo "Match not found"
echo ""

echo "3. Get recent events:"
curl -s "$BASE_URL/events/match/$MATCH_ID/recent?hours=1" | jq 'length' || echo "No events"
echo " events found"
echo ""

echo "4. Get match sentiment:"
curl -s "$BASE_URL/sentiment/match/$MATCH_ID" | jq 'length' || echo "No sentiment data"
echo " sentiment entries"
echo ""

echo "5. Get match prediction:"
curl -s "$BASE_URL/predict/match/$MATCH_ID?type=match_winner" | jq '{predictionType, probabilities, explanation}' || echo "No prediction"
echo ""

echo "6. Get user preferences (demo user):"
curl -s "$BASE_URL/users/demo-user-1/preferences" | jq '.' || echo "User not found"
echo ""

echo "=== Demo Complete ==="

