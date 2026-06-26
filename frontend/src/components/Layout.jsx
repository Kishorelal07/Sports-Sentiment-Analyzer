import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function Layout({ children }) {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [teamStats, setTeamStats] = useState([])
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    fetchTeamStatistics()
    const statsInterval = setInterval(fetchTeamStatistics, 30000)
    return () => {
      clearInterval(timer)
      clearInterval(statsInterval)
    }
  }, [])

  const fetchTeamStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches/live`)
      const match = response.data
      if (!match || !match.teams || !match.innings) {
        setTeamStats([])
        return
      }

      const inningsByTeam = match.innings.reduce((acc, innings) => {
        if (!innings || !innings.battingTeam) return acc
        if (!acc[innings.battingTeam]) {
          acc[innings.battingTeam] = { runs: 0, wickets: 0, overs: 0 }
        }
        acc[innings.battingTeam].runs += innings.totalRuns || 0
        acc[innings.battingTeam].wickets += innings.totalWickets || 0
        acc[innings.battingTeam].overs += innings.totalOvers || 0
        return acc
      }, {})

      const stats = Object.values(match.teams).map(team => {
        const totals = inningsByTeam[team.name] || { runs: 0, wickets: 0, overs: 0 }
        const overs = totals.overs || 0
        return {
          name: team.name,
          runs: totals.runs,
          wickets: totals.wickets,
          overs: overs.toFixed(1),
          runRate: overs > 0 ? totals.runs / overs : 0
        }
      })

      setTeamStats(stats)
    } catch (error) {
      console.warn('Header team stats fetch failed:', error)
      setTeamStats([])
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ESPN-inspired Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-12 border-b border-red-800">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 group">
                <span className="text-2xl font-black text-white tracking-tight">
                  H-SPORTS
                </span>
                <span className="text-xs text-red-200 font-semibold">CRICKET</span>
              </Link>
              <div className="hidden md:flex items-center space-x-4 text-sm text-red-100">
                <span className="font-semibold">LIVE</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-red-100 hover:text-white transition-colors text-sm font-medium">
                Scores
              </button>
              <Link 
                to="/news" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/news' 
                    ? 'text-white' 
                    : 'text-red-100 hover:text-white'
                }`}
              >
                News
              </Link>
              <button className="text-red-100 hover:text-white transition-colors text-sm font-medium">
                Videos
              </button>
            </div>
          </div>
          
          {/* Main Navigation Bar */}
          <nav className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'bg-white text-red-600 rounded-t-lg'
                    : 'text-red-100 hover:text-white hover:bg-red-800 rounded-t-lg'
                }`}
              >
                Home
              </Link>
              <Link
                to="/news"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/news'
                    ? 'bg-white text-red-600 rounded-t-lg'
                    : 'text-red-100 hover:text-white hover:bg-red-800 rounded-t-lg'
                }`}
              >
                News
              </Link>
              <Link
                to="/matches/past"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/matches/past')
                    ? 'bg-white text-red-600 rounded-t-lg'
                    : 'text-red-100 hover:text-white hover:bg-red-800 rounded-t-lg'
                }`}
              >
                Past Matches
              </Link>
              <Link
                to="/matches/upcoming"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/matches/upcoming')
                    ? 'bg-white text-red-600 rounded-t-lg'
                    : 'text-red-100 hover:text-white hover:bg-red-800 rounded-t-lg'
                }`}
              >
                Upcoming
              </Link>
              <Link
                to="/preferences"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/preferences'
                    ? 'bg-white text-red-600 rounded-t-lg'
                    : 'text-red-100 hover:text-white hover:bg-red-800 rounded-t-lg'
                }`}
              >
                Preferences
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/login"
                className="text-sm text-red-100 hover:text-white font-medium transition-colors"
              >
                Admin
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-red-200">🏏</span>
                <span className="text-sm text-red-100 font-medium">Cricket Analytics</span>
              </div>
            </div>
          </nav>

          {teamStats.length > 0 && (
            <div className="bg-red-700/30 border-t border-red-500/30 -mx-4 px-4 py-2 overflow-x-auto">
              <div className="flex items-center space-x-6 text-white text-sm min-w-max">
                <span className="uppercase text-xs tracking-widest text-red-100 font-semibold">
                  Team Statistics
                </span>
                {teamStats.map(team => (
                  <div
                    key={team.name}
                    className="flex items-center space-x-3 pr-4 border-r border-red-400/40 last:border-none"
                  >
                    <span className="font-semibold">{team.name}</span>
                    <span className="text-red-100">
                      {team.runs}/{team.wickets} ({team.overs} ov)
                    </span>
                    <span className="text-xs text-red-200">
                      RR {team.runRate.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">H-SPORTS</span>
              <span className="text-xs text-gray-400 ml-2">Cricket Analytics Platform</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 H-Sports. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
