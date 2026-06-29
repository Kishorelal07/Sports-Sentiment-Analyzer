import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'

export default function WormChart({ matchId, match }) {
  const { events } = useStore()
  const [chartData, setChartData] = useState([])

  const battingTeamKey = (match?.innings?.[0]?.battingTeam || 'Australia').toLowerCase()

  useEffect(() => {
    const statsEvents = events
      .filter((e) => e.matchId === matchId && e.eventType === 'match_statistics')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const data = statsEvents.map((event) => {
      const eventData = event.data || {}
      const teamStats = eventData.team_stats || {}
      const runs = teamStats[battingTeamKey]?.runs ?? 0
      const overs = teamStats[battingTeamKey]?.overs ?? 0

      return {
        over: Number(overs).toFixed(1),
        runs,
        runRate: overs > 0 ? Number((runs / overs).toFixed(2)) : 0,
      }
    })

    setChartData(data)
  }, [events, matchId, battingTeamKey])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📈</span>
        Run Rate (Worm Chart)
      </h2>

      {chartData.length > 0 ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="over" label={{ value: 'Overs', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="runs" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
