import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

export default function LiveScoreboard({ match }) {
  const { events } = useStore()
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0 })
  const [isUpdating, setIsUpdating] = useState(false)
  
  useEffect(() => {
    // Calculate current score from events
    const statsEvents = events.filter(e => e.eventType === 'match_statistics')
    if (statsEvents.length > 0) {
      const latest = statsEvents[statsEvents.length - 1]
      const data = latest.data || {}
      const teamStats = data.team_stats || {}
      const battingTeam = match.innings?.[0]?.battingTeam || 'Australia'
      const teamKey = battingTeam.toLowerCase()
      
      if (teamStats[teamKey]) {
        setIsUpdating(true)
        setTimeout(() => {
          setScore({
            runs: teamStats[teamKey].runs || 0,
            wickets: teamStats[teamKey].wickets || 0,
            overs: teamStats[teamKey].overs || 0
          })
          setIsUpdating(false)
        }, 300)
      }
    }
  }, [events, match])
  
  const currentInnings = match.innings?.[0]
  const battingTeam = currentInnings?.battingTeam || 'Australia'
  const bowlingTeam = currentInnings?.bowlingTeam || 'England'
  const runRate = score.overs > 0 ? (score.runs / score.overs).toFixed(2) : '0.00'
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
          Live Score
        </h2>
        <span className="text-xs font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">
          LIVE
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Batting Team */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Batting</p>
              <p className="text-xl font-bold text-gray-900">{battingTeam}</p>
            </div>
            <div className="text-right">
              <div className={`
                text-5xl font-black text-red-600 transition-all duration-500
                ${isUpdating ? 'scale-110' : 'scale-100'}
              `}>
                {score.runs}
                <span className="text-3xl text-gray-400">/{score.wickets}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ({score.overs.toFixed(1)} overs) • RR: {runRate}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bowling Team */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Bowling</p>
              <p className="text-xl font-bold text-gray-900">{bowlingTeam}</p>
            </div>
            {currentInnings?.target && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-2xl font-bold text-blue-600">{currentInnings.target}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Runs</p>
            <p className="text-lg font-bold text-gray-900">{score.runs}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Wickets</p>
            <p className="text-lg font-bold text-red-600">{score.wickets}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Run Rate</p>
            <p className="text-lg font-bold text-green-600">{runRate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
