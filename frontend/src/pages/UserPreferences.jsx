import { useEffect, useState } from 'react'
import axios from 'axios'
import useStore from '../store/useStore'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function UserPreferences() {
  const { user, fetchUser, updateUserPreferences } = useStore()
  const [preferences, setPreferences] = useState({
    favoriteTeams: [],
    favoritePlayers: [],
    commentaryStyle: 'technical',
    showPredictions: true,
    showSentiment: true,
    showBiometrics: false,
    preferredCommentators: [],
    language: 'en'
  })
  
  useEffect(() => {
    // Default user for demo
    const userId = 'demo-user-1'
    fetchUser(userId).catch(() => {
      // User doesn't exist, use defaults
    })
  }, [])
  
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences)
    }
  }, [user])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const userId = 'demo-user-1'
    try {
      // Save to API
      await axios.post(`${API_BASE}/user/preferences`, {
        userId,
        ...preferences
      })
      // Also save locally
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      alert('Preferences saved!')
    } catch (error) {
      // Fallback to local storage
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      alert('Preferences saved locally!')
    }
  }
  
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Preferences</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentary Style
          </label>
          <select
            value={preferences.commentaryStyle}
            onChange={(e) => setPreferences({ ...preferences, commentaryStyle: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="technical">Technical</option>
            <option value="casual">Casual</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Display Options</label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.showPredictions}
              onChange={(e) => setPreferences({ ...preferences, showPredictions: e.target.checked })}
              className="mr-2"
            />
            Show Predictions
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.showSentiment}
              onChange={(e) => setPreferences({ ...preferences, showSentiment: e.target.checked })}
              className="mr-2"
            />
            Show Sentiment Analysis
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.showBiometrics}
              onChange={(e) => setPreferences({ ...preferences, showBiometrics: e.target.checked })}
              className="mr-2"
            />
            Show Player Biometrics
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 font-medium"
        >
          Save Preferences
        </button>
      </form>
    </div>
  )
}

