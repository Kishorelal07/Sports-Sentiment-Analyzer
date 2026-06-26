#!/bin/bash

# Data seeding script for Cricket Analytics Platform
# This script loads match metadata and initializes the database

echo "Starting data seeding..."

# Wait for MongoDB to be ready
echo "Waiting for MongoDB..."
until curl -f http://localhost:27017 > /dev/null 2>&1; do
  sleep 2
done

echo "MongoDB is ready!"

# Load match metadata
echo "Loading match metadata..."
curl -X POST http://localhost:8080/api/matches/load \
  -H "Content-Type: application/json" \
  -w "\n"

echo "Data seeding completed!"

