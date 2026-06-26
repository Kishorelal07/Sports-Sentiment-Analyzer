import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'

export default function WormChart({ matchId }) {
  const { events } = useStore()
  const [chartData, setChartData] = useState([])
  
  useEffect(() => {
    const statsEvents = events
      .filter(e => e.matchId === matchId && e.eventType === 'match_statistics')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    
    const data = statsEvents.map(event => {
      const data = event.data || {}
      const teamStats = data.team_stats || {}
      const battingTeam = 'australia' // Default, should be dynamic
      const runs = teamStats[battingTeam]?.runs || 0
      const overs = teamStats[battingTeam]?.overs || 0
      
      return {
        over: overs.toFixed(1),
        runs: runs
      }
    })
    
    setChartData(data)
  }, [events, matchId])
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📈</span>
        Run Rate (Worm Chart)
      </h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="over" label={{ value: 'Overs', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="runs" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl mb-2">📊</div>
            <p>No data available</p>
          </div>
        </div>
      )}
    </div>
  )
}
