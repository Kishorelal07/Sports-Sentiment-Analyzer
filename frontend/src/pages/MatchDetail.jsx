import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useStore from '../store/useStore'
import LiveScoreboard from '../components/LiveScoreboard'
import EventTimeline from '../components/EventTimeline'
import SentimentChart from '../components/SentimentChart'
import PredictionCard from '../components/PredictionCard'
import MediaCarousel from '../components/MediaCarousel'
import WormChart from '../components/WormChart'
import CommentarySection from '../components/CommentarySection'
import AIChat from '../components/AIChat'
import AISummaryCard from '../components/AISummaryCard'
import { resolveMatchId } from '../utils/normalize'

function buildMatchState(match, events) {
  const innings = match?.innings?.[0] || {}
  const statsEvents = (events || []).filter((e) => e.eventType === 'match_statistics')
  const latestStats = statsEvents.length > 0 ? statsEvents[statsEvents.length - 1] : null
  const teamStats = latestStats?.data?.team_stats || {}
  const battingTeam = innings.battingTeam || 'Team 1'
  const teamKey = battingTeam.toLowerCase()
  const liveStats = teamStats[teamKey] || {}

  const runs = liveStats.runs ?? innings.totalRuns ?? 0
  const wickets = liveStats.wickets ?? innings.totalWickets ?? 0
  const overs = liveStats.overs ?? innings.totalOvers ?? 0
  const runRate = overs > 0 ? (runs / overs).toFixed(2) : '0.00'
  const target = innings.target
  const requiredRate =
    target && overs > 0
      ? ((target - runs) / Math.max(20 - overs, 0.1)).toFixed(2)
      : null

  return {
    matchId: match.matchId || match.match_id,
    series: match.series,
    venue: match.venue,
    format: match.format,
    teams: match.teams,
    score: `${runs}/${wickets}`,
    runs,
    wickets,
    overs,
    runRate: parseFloat(runRate),
    requiredRate: requiredRate ? parseFloat(requiredRate) : null,
    target,
    battingTeam: innings.battingTeam,
    bowlingTeam: innings.bowlingTeam,
  }
}

export default function MatchDetail() {
  const { matchId } = useParams()
  const { currentMatch, fetchMatch, fetchEvents, fetchSentiment, fetchPrediction, events, error } = useStore()
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState(null)
  
  useEffect(() => {
    // Only proceed if matchId is valid
    if (!matchId || matchId === 'undefined') {
      console.error('Invalid matchId:', matchId)
      setLocalError('Invalid match ID')
      setLocalLoading(false)
      return
    }
    
    // Initial load
    loadData()
    
    // Set up auto-refresh every 5 seconds (simulating live updates)
    const interval = setInterval(() => {
      loadData(false) // Don't show loading on refresh
    }, 5000)
    
    return () => {
      clearInterval(interval)
    }
  }, [matchId])
  
  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLocalLoading(true)
        setLocalError(null)
      }

      const match = await fetchMatch(matchId, { silent: !showLoading })
      const effectiveMatchId = resolveMatchId(match) || matchId

      await Promise.all([
        fetchEvents(effectiveMatchId).catch((err) => console.warn('Failed to load events:', err)),
        fetchSentiment(effectiveMatchId).catch((err) => console.warn('Failed to load sentiment:', err)),
        fetchPrediction(effectiveMatchId).catch((err) => console.warn('Failed to load prediction:', err)),
      ])

      setLocalLoading(false)
    } catch (error) {
      console.error('Error loading match data:', error)
      if (showLoading) {
        setLocalError(error.message || 'Failed to load match details')
      }
      setLocalLoading(false)
    }
  }
  
  if (localLoading && !currentMatch) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading match details...</p>
        </div>
      </div>
    )
  }
  
  if (localError || (error && localLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600 mb-2">Error Loading Match</p>
          <p className="text-gray-600 mb-4">{localError || error}</p>
          <button
            onClick={() => loadData()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  if (!currentMatch) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🏏</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Match Not Found</p>
          <p className="text-gray-600">The match you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const matchState = buildMatchState(currentMatch, events)
  const matchContextString = `${currentMatch.series}, ${currentMatch.venue}, Teams: ${Object.values(currentMatch.teams || {}).map((t) => t.name).join(' vs ')}`
  const effectiveMatchId = resolveMatchId(currentMatch) || matchId

  return (
    <div className="px-4 py-6 space-y-6 animate-fadeIn">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black mb-2">
              {currentMatch.series}
            </h1>
            <div className="flex items-center space-x-4 text-red-100">
              <span className="flex items-center">
                <span className="mr-2">📍</span>
                {currentMatch.venue}, {currentMatch.city}
              </span>
              <span>•</span>
              <span>{new Date(currentMatch.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold">LIVE</span>
            </div>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
              {currentMatch.format}
            </span>
          </div>
        </div>
        
        {/* Teams */}
        {currentMatch.teams && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-red-500">
            {Object.entries(currentMatch.teams).map(([key, team]) => (
              <div key={key} className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-sm text-red-200 mb-1">{key === 'team1' ? 'Team 1' : 'Team 2'}</p>
                <p className="text-lg font-bold">{team.name}</p>
                <p className="text-xs text-red-200 mt-1">Captain: {team.captain}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LiveScoreboard match={currentMatch} />
          <AISummaryCard matchState={matchState} />
          <WormChart matchId={effectiveMatchId} match={currentMatch} />
          <EventTimeline matchId={effectiveMatchId} />
          <CommentarySection matchId={effectiveMatchId} />
        </div>
        
        <div className="space-y-6">
          <PredictionCard matchId={effectiveMatchId} />
          <SentimentChart matchId={effectiveMatchId} />
          <MediaCarousel matchId={effectiveMatchId} />
          <AIChat 
            matchId={effectiveMatchId}
            matchContext={matchContextString}
            matchState={matchState}
          />
        </div>
      </div>
    </div>
  )
}
