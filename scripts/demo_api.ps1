# PowerShell version of demo API script

$BASE_URL = "http://localhost:8080/api"
$MATCH_ID = "eng-aus-t20-2025-11-24"

Write-Host "=== Cricket Analytics Platform API Demo ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Get all matches:" -ForegroundColor Yellow
try {
    $matches = Invoke-RestMethod -Uri "$BASE_URL/matches" -Method Get
    if ($matches.Count -gt 0) {
        Write-Host "Found $($matches.Count) match(es)"
    }
} catch {
    Write-Host "No matches found" -ForegroundColor Red
}
Write-Host ""

Write-Host "2. Get match details:" -ForegroundColor Yellow
try {
    $match = Invoke-RestMethod -Uri "$BASE_URL/matches/$MATCH_ID" -Method Get
    Write-Host "Match: $($match.series)" -ForegroundColor Green
} catch {
    Write-Host "Match not found" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. Get recent events:" -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$BASE_URL/events/match/$MATCH_ID/recent?hours=1" -Method Get
    Write-Host "Found $($events.Count) events" -ForegroundColor Green
} catch {
    Write-Host "No events found" -ForegroundColor Red
}
Write-Host ""

Write-Host "4. Get match sentiment:" -ForegroundColor Yellow
try {
    $sentiments = Invoke-RestMethod -Uri "$BASE_URL/sentiment/match/$MATCH_ID" -Method Get
    Write-Host "Found $($sentiments.Count) sentiment entries" -ForegroundColor Green
} catch {
    Write-Host "No sentiment data" -ForegroundColor Red
}
Write-Host ""

Write-Host "5. Get match prediction:" -ForegroundColor Yellow
try {
    $prediction = Invoke-RestMethod -Uri "$BASE_URL/predict/match/$MATCH_ID?type=match_winner" -Method Get
    Write-Host "Prediction: $($prediction.explanation)" -ForegroundColor Green
} catch {
    Write-Host "No prediction available" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Demo Complete ===" -ForegroundColor Cyan

