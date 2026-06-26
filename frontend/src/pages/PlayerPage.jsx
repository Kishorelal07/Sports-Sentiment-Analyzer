import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function PlayerPage() {
  const { playerId } = useParams()
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const [playerRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE}/players/${playerId}`),
          axios.get(`${API_BASE}/players/${playerId}/stats`)
        ])
        setPlayer(playerRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching player:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (playerId) {
      fetchPlayer()
    }
  }, [playerId])
  
  if (loading) {
    return <div className="text-center py-12">Loading player...</div>
  }
  
  if (!player) {
    return <div className="text-center py-12">Player not found</div>
  }
  
  // Mock performance data
  const performanceData = [
    { metric: 'Runs', value: stats?.statistics?.runs || 250 },
    { metric: 'Average', value: stats?.statistics?.average || 35.5 },
    { metric: 'Strike Rate', value: stats?.statistics?.strikeRate || 145.2 },
    { metric: 'Matches', value: stats?.statistics?.matches || 15 }
  ]
  
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-6 text-white">
        <h1 className="text-4xl font-black mb-2">{player.name}</h1>
        <div className="flex items-center space-x-4 text-green-100">
          <span>{player.role}</span>
          <span>•</span>
          <span>Team: {player.teamId}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Statistics</h2>
          <div className="space-y-3">
            {stats?.statistics && Object.entries(stats.statistics).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

