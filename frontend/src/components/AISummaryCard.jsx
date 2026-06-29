import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function AISummaryCard({ matchState }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE}/ai/summary`, matchState)
      setSummary(response.data.summary)
    } catch (err) {
      console.error('Error generating AI summary:', err)
      setError('Could not generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={loading || !matchState}
        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Generating...
          </>
        ) : (
          <>✨ Generate AI Summary</>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {summary && (
        <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-5 border-2 border-amber-200">
          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-purple-600 text-white px-2 py-0.5 rounded-full">
            AI Generated
          </span>
          <p className="text-sm text-gray-800 leading-relaxed pr-20">{summary}</p>
        </div>
      )}
    </div>
  )
}
