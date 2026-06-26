import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function CommentarySection({ matchId }) {
  const [commentary, setCommentary] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = 'demo-user-1' // Mock user ID
  
  useEffect(() => {
    if (!matchId) return
    
    const fetchCommentary = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}/commentary/personalized`, {
          params: { userId, matchId }
        })
        setCommentary(response.data)
      } catch (error) {
        console.error('Error fetching commentary:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCommentary()
    const interval = setInterval(fetchCommentary, 10000) // Refresh every 10 seconds
    
    return () => clearInterval(interval)
  }, [matchId, userId])
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500">Loading commentary...</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💬</span>
        Personalized Commentary
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {commentary.map((comment, index) => (
          <div 
            key={index}
            className={`
              p-4 rounded-lg border-l-4
              ${comment.type === 'sentiment' 
                ? 'bg-purple-50 border-purple-400' 
                : 'bg-blue-50 border-blue-400'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                {comment.type === 'sentiment' ? '📊 Sentiment' : '⚡ Event'}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.timestamp), 'HH:mm:ss')}
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.text}</p>
          </div>
        ))}
        
        {commentary.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No commentary available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

