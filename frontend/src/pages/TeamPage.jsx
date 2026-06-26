import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function TeamPage() {
  const { teamId } = useParams()
  const [team, setTeam] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [teamRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE}/teams/${teamId}`),
          axios.get(`${API_BASE}/teams/${teamId}/stats`)
        ])
        setTeam(teamRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (teamId) {
      fetchTeam()
    }
  }, [teamId])
  
  if (loading) {
    return <div className="text-center py-12">Loading team...</div>
  }
  
  if (!team) {
    return <div className="text-center py-12">Team not found</div>
  }
  
  // Mock performance data for chart
  const performanceData = [
    { name: 'Runs', value: stats?.statistics?.totalRuns || 1500 },
    { name: 'Wickets', value: stats?.statistics?.totalWickets || 45 },
    { name: 'Matches', value: stats?.statistics?.matchesPlayed || 12 },
    { name: 'Wins', value: stats?.statistics?.wins || 8 }
  ]
  
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white">
        <h1 className="text-4xl font-black mb-2">{team.name}</h1>
        <p className="text-blue-100">{team.country}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Statistics</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

