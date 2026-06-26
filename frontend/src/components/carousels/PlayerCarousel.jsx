import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function PlayerCarousel() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}/analytics/players`)
        setPlayers(response.data || [])
      } catch (err) {
        console.error('Failed to load player profiles', err)
        setError('Unable to load player insights right now.')
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Loading player spotlight...</p>
      </div>
    )
  }

  if (error || players.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player Spotlight</h2>
          <p className="text-sm text-gray-500">Profiles sourced from cricket-data feeds</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
          Live Feed
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {players.map((player) => (
            <div
              key={player.playerId || player.name}
              className="w-64 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-600">{player.role || 'Player'}</p>
                  <h3 className="text-lg font-bold text-gray-900">{player.name || player.playerId}</h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {player.team || 'Team TBD'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {player.latestReleaseSpeed && (
                  <div className="flex justify-between">
                    <span>Release Speed</span>
                    <span className="font-semibold text-gray-900">{player.latestReleaseSpeed.toFixed(1)} km/h</span>
                  </div>
                )}
                {player.latestSpinRate && (
                  <div className="flex justify-between">
                    <span>Spin Rate</span>
                    <span className="font-semibold text-gray-900">{Math.round(player.latestSpinRate)} rpm</span>
                  </div>
                )}
                {player.latestHeartRate && (
                  <div className="flex justify-between">
                    <span>Heart Rate</span>
                    <span className="font-semibold text-gray-900">{Math.round(player.latestHeartRate)} bpm</span>
                  </div>
                )}
                {player.energyLevel && (
                  <div className="flex justify-between">
                    <span>Energy</span>
                    <span className="font-semibold text-gray-900">{Math.round(player.energyLevel * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

