import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

export default function PastMatchesPage() {
  const { matches, fetchMatches } = useStore()
  const [pastMatches, setPastMatches] = useState([])
  
  useEffect(() => {
    fetchMatches()
  }, [])
  
  useEffect(() => {
    // Filter past matches (matches with completed status)
    const past = matches.filter(match => 
      match.result?.status?.includes('completed') || 
      match.result?.status?.includes('finished') ||
      match.result?.status?.includes('won')
    )
    setPastMatches(past)
  }, [matches])
  
  return (
    <div className="px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Past Matches</h1>
          <p className="text-gray-600">Complete match history and results</p>
        </div>
      </div>
      
      {pastMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastMatches.map((match) => (
            <Link
              key={match.id}
              to={`/match/${match.matchId}`}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {match.series}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {match.venue}, {match.city}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
                  {match.format}
                </span>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Date:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(match.date).toLocaleDateString()}
                  </span>
                </div>
                {match.result && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Result:</span>
                    <span className="font-semibold text-green-600">
                      {match.result.projectedWinner || match.result.status}
                    </span>
                  </div>
                )}
                {match.playerOfMatch && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Player of Match:</span>
                    <span className="font-semibold text-gray-900">
                      {match.playerOfMatch}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  View Details →
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No Past Matches</p>
          <p className="text-gray-500">Past match records will appear here</p>
        </div>
      )}
    </div>
  )
}

