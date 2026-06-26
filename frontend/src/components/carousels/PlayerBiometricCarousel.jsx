import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function PlayerBiometricCarousel() {
  const [biometrics, setBiometrics] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/analytics/biometrics?limit=15`)
        setBiometrics(response.data || [])
      } catch (error) {
        console.error('Failed to load biometrics feed', error)
        setBiometrics([])
      }
    }

    fetchData()
  }, [])

  if (biometrics.length === 0) {
    return null
  }

  const formatPercent = (value) => {
    if (value === undefined || value === null) return '—'
    return `${Math.round(value * 100)}%`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player Wellness Monitor</h2>
          <p className="text-sm text-gray-500">player-biometric-feed.json</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full">
          Bio Sensors
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {biometrics.map((entry) => (
            <div
              key={entry.event_id}
              className="w-72 flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase text-emerald-600 font-semibold">{entry.player_role}</p>
                  <h3 className="text-lg font-bold text-gray-900">{entry.player_id}</h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">#{entry.ball_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs text-gray-500">Heart Rate</p>
                  <p className="font-semibold text-gray-900">{entry.heart_rate_bpm} bpm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Energy</p>
                  <p className="font-semibold text-gray-900">{formatPercent(entry.energy_level)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hydration</p>
                  <p className="font-semibold text-gray-900">{formatPercent(entry.hydration_level)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fatigue</p>
                  <p className="font-semibold text-gray-900">{formatPercent(entry.muscle_fatigue_index)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Respiration</p>
                  <p className="font-semibold text-gray-900">{entry.respiration_rate} rpm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="font-semibold text-gray-900">{entry.body_temperature_c} °C</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

