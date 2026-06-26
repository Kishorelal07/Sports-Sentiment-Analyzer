import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function BowlerStatsCarousel() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE}/analytics/bowler-stats`)
        setEntries(response.data || [])
      } catch (err) {
        console.error('Failed to fetch bowler stats', err)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || entries.length === 0) {
    return null
  }

  const formatValue = (value, suffix = '') => {
    if (value === undefined || value === null) return '—'
    return `${value}${suffix}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bowler Telemetry</h2>
          <p className="text-sm text-gray-500">Bowler feeds from cricket-data</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
          bowler-stats-feed.json
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {entries.map((entry) => (
            <div
              key={entry.event_id}
              className="w-72 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase text-purple-600 font-semibold">{entry.sub_type}</p>
                  <h3 className="text-lg font-bold text-gray-900">{entry.bowler_name || entry.bowler_id}</h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">#{entry.ball_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs text-gray-500">Speed</p>
                  <p className="font-semibold text-gray-900">{formatValue(entry.release_speed_kmh, ' km/h')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spin</p>
                  <p className="font-semibold text-gray-900">{formatValue(entry.spin_rpm, ' rpm')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fatigue</p>
                  <p className="font-semibold text-gray-900">
                    {entry.fatigue_level ? `${Math.round(entry.fatigue_level * 100)}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seam</p>
                  <p className="font-semibold text-gray-900">{entry.seam_position || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Swing</p>
                  <p className="font-semibold text-gray-900">{entry.swing_type || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Over</p>
                  <p className="font-semibold text-gray-900">
                    {entry.innings} / {entry.over_number}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

