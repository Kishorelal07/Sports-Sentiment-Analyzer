import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AIChat from '../components/AIChat'
import axios from 'axios'
import PlayerCarousel from '../components/carousels/PlayerCarousel'
import BowlerStatsCarousel from '../components/carousels/BowlerStatsCarousel'
import PlayerBiometricCarousel from '../components/carousels/PlayerBiometricCarousel'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function Dashboard() {
  const { matches, loading, fetchMatches } = useStore()
  const [hoveredMatch, setHoveredMatch] = useState(null)
  const [liveMatch, setLiveMatch] = useState(null)
  const [aiPrediction, setAiPrediction] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  
  useEffect(() => {
    fetchMatches()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMatches()
    }, 30000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (matches.length > 0) {
      const preferred = matches.find(
        (m) => (m.matchId || m.match_id) === 'eng-aus-t20-2025-11-24'
      )
      const live = preferred || matches[0]
      setLiveMatch(live)
      const id = live.matchId || live.match_id
      fetchAIPrediction(id, live)
    }
  }, [matches])
  
  const fetchAIPrediction = async (matchId, match) => {
    if (!matchId) return
    
    setPredictionLoading(true)
    try {
      const team1 = match.teams?.team1?.name || 'Team 1'
      const team2 = match.teams?.team2?.name || 'Team 2'
      
      const response = await axios.post(`${API_BASE}/ai/predict`, {
        matchId,
        team1,
        team2,
        stats: {
          innings: match.innings,
          result: match.result
        }
      })
      
      setAiPrediction(response.data)
    } catch (error) {
      console.error('Error fetching AI prediction:', error)
    } finally {
      setPredictionLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    )
  }
  
  // Prepare data for run rate comparison chart
  const runRateData = matches.length > 0 && matches[0].innings ? 
    matches[0].innings.map((inning, idx) => ({
      name: `Innings ${idx + 1}`,
      runRate: inning.totalOvers > 0 ? (inning.totalRuns / inning.totalOvers) : 0,
      runs: inning.totalRuns || 0
    })) : []
  
  return (
    <div className="px-4 py-6 animate-fadeIn space-y-6">
      {/* Hero Section - Live Match */}
      {liveMatch && (
        <Link to={`/match/${liveMatch.matchId || liveMatch.match_id || liveMatch.id}`}>
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl p-8 text-white hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold">LIVE NOW</span>
              </div>
              <span className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-bold">
                {liveMatch.format}
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2">{liveMatch.series}</h1>
            <p className="text-red-100 text-lg mb-4">
              {liveMatch.venue}, {liveMatch.city} • {new Date(liveMatch.date).toLocaleDateString()}
            </p>
            {liveMatch.teams && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {Object.entries(liveMatch.teams).map(([key, team]) => (
                  <div key={key} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm text-red-200 mb-1">{key === 'team1' ? 'Team 1' : 'Team 2'}</p>
                    <p className="text-2xl font-bold">{team.name}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors">
                Watch Live →
              </button>
            </div>
          </div>
        </Link>
      )}
      
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{matches.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Matches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-600 mt-1">Live Now</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">85K+</div>
          <div className="text-sm text-gray-600 mt-1">Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">100%</div>
          <div className="text-sm text-gray-600 mt-1">Coverage</div>
        </div>
      </div>
      
      {/* Run Rate Comparison Chart */}
      {runRateData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Run Rate Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={runRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="runRate" fill="#ef4444" name="Run Rate" />
              <Bar dataKey="runs" fill="#3b82f6" name="Total Runs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* AI Prediction Section */}
      {liveMatch && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              AI Match Prediction
            </h2>
            <span className="text-xs font-semibold bg-purple-600 text-white px-3 py-1 rounded-full">
              Powered by Cohere AI
            </span>
          </div>
          
          {predictionLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Generating AI prediction...</p>
            </div>
          ) : aiPrediction ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-gray-700 leading-relaxed">{aiPrediction.prediction}</p>
              </div>
              <div className="text-xs text-gray-500 text-right">
                Source: {aiPrediction.source || 'Cohere AI'}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No prediction available</p>
          )}
        </div>
      )}
      
      {/* Quick Sentiment Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Sentiment</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Positive</span>
              <span className="font-semibold">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Neutral</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gray-400 h-3 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Negative</span>
              <span className="font-semibold">10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chat Assistant */}
      {liveMatch && (
        <AIChat 
          matchId={liveMatch.matchId || liveMatch.match_id} 
          matchContext={`Match: ${liveMatch.series}, Teams: ${Object.values(liveMatch.teams || {}).map(t => t.name).join(' vs ')}, Venue: ${liveMatch.venue}`}
        />
      )}

      {/* Player & Bowler Insights */}
      <div className="space-y-6">
        <PlayerCarousel />
        <BowlerStatsCarousel />
        <PlayerBiometricCarousel />
      </div>
      
      {/* All Matches Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">All Matches</h2>
          <div className="flex space-x-2">
            <Link
              to="/matches/past"
              className="text-sm text-gray-600 hover:text-red-600 font-medium"
            >
              Past Matches →
            </Link>
            <Link
              to="/matches/upcoming"
              className="text-sm text-gray-600 hover:text-red-600 font-medium"
            >
              Upcoming →
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => {
            const matchSlug = match.matchId || match.match_id || match.id
            if (!matchSlug) {
              return (
                <div key={match.id || index} className="bg-white rounded-xl shadow-md p-6 border border-red-200">
                  <p className="text-red-600 font-semibold">Match missing ID – please edit in Admin panel.</p>
                </div>
              )
            }
            return (
            <Link
              key={match.id || matchSlug}
              to={`/match/${matchSlug}`}
              className="group relative"
              onMouseEnter={() => setHoveredMatch(match.id)}
              onMouseLeave={() => setHoveredMatch(null)}
            >
              <div className={`
                bg-white rounded-xl shadow-md p-6 
                transition-all duration-300 ease-in-out
                ${hoveredMatch === match.id 
                  ? 'shadow-2xl transform -translate-y-2 scale-105 border-2 border-red-500' 
                  : 'hover:shadow-lg hover:border-red-200 border-2 border-transparent'
                }
              `}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                      {match.series}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{match.venue}, {match.city}</span>
                    </div>
                  </div>
                  <span className={`
                    px-3 py-1 text-xs font-bold rounded-full
                    ${match.format === 'T20' 
                      ? 'bg-purple-100 text-purple-800' 
                      : match.format === 'ODI'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                    }
                    transform transition-transform
                    ${hoveredMatch === match.id ? 'scale-110' : ''}
                  `}>
                    {match.format}
                  </span>
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">📅 Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {match.result && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">⚡ Status:</span>
                      <span className={`
                        font-semibold px-2 py-1 rounded text-xs
                        ${match.result.status?.includes('live') || match.result.status?.includes('ongoing')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {match.result.status}
                      </span>
                    </div>
                  )}
                  {match.teams && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600 text-sm">👥 Teams:</span>
                      <div className="flex space-x-2">
                        {Object.values(match.teams).slice(0, 2).map((team, idx) => (
                          <span key={idx} className="text-xs font-medium text-gray-700">
                            {team.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`
                  absolute bottom-4 right-4 text-red-600
                  transform transition-all duration-300
                  ${hoveredMatch === match.id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}
                `}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )})}
        </div>
        
        {matches.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="inline-block p-8 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">🏏</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No matches found</p>
              <p className="text-gray-500">Load match data to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
