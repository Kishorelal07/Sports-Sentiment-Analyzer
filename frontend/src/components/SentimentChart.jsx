import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'

export default function SentimentChart({ matchId }) {
  const { sentiments, fetchSentiment } = useStore()
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (matchId) {
      fetchSentiment(matchId)
    }
    const interval = setInterval(() => {
      if (matchId) {
        fetchSentiment(matchId)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [matchId])

  useEffect(() => {
    const matchSentiments = sentiments.filter((s) => s.matchId === matchId)
    const grouped = matchSentiments.reduce((acc, s, index) => {
      const time = s.timestamp
        ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `T${index}`
      if (!acc[time]) {
        acc[time] = { time, positive: 0, negative: 0, neutral: 0 }
      }
      const label = (s.sentimentLabel || '').toLowerCase()
      if (label === 'positive') acc[time].positive++
      else if (label === 'negative') acc[time].negative++
      else acc[time].neutral++
      return acc
    }, {})

    setChartData(Object.values(grouped).slice(-20))
  }, [sentiments, matchId])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sentiment Timeline</h2>

      {chartData.length > 0 ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No sentiment data available
        </div>
      )}
    </div>
  )
}
