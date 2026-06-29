import { useEffect, useState, useRef } from 'react'
import useStore from '../store/useStore'
import { format } from 'date-fns'

export default function EventTimeline({ matchId }) {
  const { events } = useStore()
  const [filteredEvents, setFilteredEvents] = useState([])
  const [newEventCount, setNewEventCount] = useState(0)
  const prevEventCountRef = useRef(0)
  
  useEffect(() => {
    const filtered = events
      .filter(e => e.matchId === matchId)
      .filter(e => ['commentary', 'wicket', 'match_statistics'].includes(e.eventType))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-20)
      .reverse()
    
    const prevCount = prevEventCountRef.current
    setFilteredEvents(filtered)
    
    if (filtered.length > prevCount && prevCount > 0) {
      setNewEventCount(filtered.length - prevCount)
      setTimeout(() => setNewEventCount(0), 2000)
    }
    prevEventCountRef.current = filtered.length
  }, [events, matchId])
  
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'wicket': return '🎯'
      case 'commentary': return '💬'
      case 'match_statistics': return '📊'
      default: return '⚡'
    }
  }
  
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'wicket': return 'bg-red-100 border-red-300'
      case 'commentary': return 'bg-blue-100 border-blue-300'
      case 'match_statistics': return 'bg-green-100 border-green-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Ball-by-Ball Timeline</h2>
        {newEventCount > 0 && (
          <span className="animate-bounce bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {newEventCount} NEW
          </span>
        )}
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {filteredEvents.map((event, index) => (
          <div 
            key={event.id || event.eventId} 
            className={`
              flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-300
              ${getEventColor(event.eventType)}
              hover:shadow-md hover:scale-[1.02] transform
              ${index === 0 ? 'animate-slideIn' : ''}
            `}
          >
            <span className="text-3xl flex-shrink-0 animate-bounce-slow">{getEventIcon(event.eventType)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-900">
                  Over {event.overNumber}.{event.ballNumber || 0}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {format(new Date(event.timestamp), 'HH:mm:ss')}
                </p>
              </div>
              {event.data?.commentary_text && (
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {event.data.commentary_text}
                </p>
              )}
              {event.eventType === 'match_statistics' && event.data?.team_stats && (
                <p className="text-sm text-gray-700 mt-1">
                  Score update —{' '}
                  {Object.entries(event.data.team_stats)
                    .map(([team, stats]) => `${team}: ${stats.runs}/${stats.wickets} (${stats.overs} ov)`)
                    .join(' • ')}
                </p>
              )}
              {event.eventType === 'wicket' && (
                <div className="mt-2 inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  🎯 WICKET! {event.data?.dismissal_type || 'Out'}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 animate-pulse">🏏</div>
            <p className="text-gray-500 font-medium">No events yet</p>
            <p className="text-sm text-gray-400 mt-1">Events will appear here as the match progresses</p>
          </div>
        )}
      </div>
    </div>
  )
}
