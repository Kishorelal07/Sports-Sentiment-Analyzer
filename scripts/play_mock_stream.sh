#!/bin/bash

# Mock stream replay script
# This script triggers the mock adapter to start streaming events

MATCH_ID="eng-aus-t20-2025-11-24"

echo "Starting mock stream replay for match: $MATCH_ID"
echo "Streaming events via SSE..."
echo "Open http://localhost:3000/match/$MATCH_ID to see live updates"
echo ""
echo "Press Ctrl+C to stop"

# Start SSE stream (this will run until interrupted)
curl -N http://localhost:8080/api/events/match/$MATCH_ID/stream

