import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

export default function UpcomingMatchesPage() {
  const { matches, fetchMatches } = useStore()
  const [upcomingMatches, setUpcomingMatches] = useState([])
  
  useEffect(() => {
    fetchMatches()
  }, [])
  
  useEffect(() => {
    // Filter upcoming matches (matches without completed status)
    const upcoming = matches.filter(match => 
      !match.result?.status?.includes('completed') && 
      !match.result?.status?.includes('finished') &&
      !match.result?.status?.includes('won')
    )
    
    // If no upcoming, create mock upcoming matches
    if (upcoming.length === 0) {
      const mockUpcoming = [
        {
          id: 'upcoming-1',
          matchId: 'upcoming-1',
          series: 'India vs Pakistan T20',
          venue: 'Eden Gardens',
          city: 'Kolkata',
          country: 'India',
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          format: 'T20',
          teams: {
            team1: { name: 'India' },
            team2: { name: 'Pakistan' }
          }
        },
        {
          id: 'upcoming-2',
          matchId: 'upcoming-2',
          series: 'Australia vs New Zealand ODI',
          venue: 'Sydney Cricket Ground',
          city: 'Sydney',
          country: 'Australia',
          date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          format: 'ODI',
          teams: {
            team1: { name: 'Australia' },
            team2: { name: 'New Zealand' }
          }
        },
        {
          id: 'upcoming-3',
          matchId: 'upcoming-3',
          series: 'England vs South Africa Test',
          venue: 'Lord\'s',
          city: 'London',
          country: 'England',
          date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          format: 'Test',
          teams: {
            team1: { name: 'England' },
            team2: { name: 'South Africa' }
          }
        }
      ]
      setUpcomingMatches(mockUpcoming)
    } else {
      setUpcomingMatches(upcoming)
    }
  }, [matches])
  
  const getDaysUntil = (dateStr) => {
    const matchDate = new Date(dateStr)
    const today = new Date()
    const diffTime = matchDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  return (
    <div className="px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Matches</h1>
          <p className="text-gray-600">Schedule of upcoming cricket matches</p>
        </div>
      </div>
      
      {upcomingMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match) => {
            const daysUntil = getDaysUntil(match.date)
            return (
              <div
                key={match.id || match.matchId}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 transform hover:-translate-y-1"
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
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    match.format === 'T20' ? 'bg-purple-100 text-purple-800' :
                    match.format === 'ODI' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {match.format}
                  </span>
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(match.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Time Until:</span>
                    <span className={`font-semibold ${
                      daysUntil <= 1 ? 'text-red-600' :
                      daysUntil <= 7 ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {daysUntil === 0 ? 'Today' :
                       daysUntil === 1 ? 'Tomorrow' :
                       `${daysUntil} days`}
                    </span>
                  </div>
                  {match.teams && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600 text-sm">Teams:</span>
                      <div className="flex space-x-2">
                        {Object.values(match.teams).slice(0, 2).map((team, idx) => (
                          <span key={idx} className="text-xs font-medium text-gray-700">
                            {team.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Set Reminder 🔔
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Matches</p>
          <p className="text-gray-500">Upcoming match schedules will appear here</p>
        </div>
      )}
    </div>
  )
}

