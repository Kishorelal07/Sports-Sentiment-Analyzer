import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('matches')
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddMatchModal, setShowAddMatchModal] = useState(false)
  const [showEditMatchModal, setShowEditMatchModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [matchForm, setMatchForm] = useState({
    matchId: '',
    series: '',
    format: 'T20',
    date: '',
    venue: '',
    city: '',
    country: '',
    team1Name: '',
    team2Name: '',
    team1Captain: '',
    team2Captain: ''
  })
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'ADMIN') {
      navigate('/admin/login')
      return
    }
    
    loadData()
  }, [activeTab])
  
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  
  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (activeTab === 'matches') {
        const response = await axios.get(`${API_BASE}/admin/matches`, getAuthHeaders())
        setMatches(response.data)
      } else if (activeTab === 'users') {
        const response = await axios.get(`${API_BASE}/admin/users`, getAuthHeaders())
        setUsers(response.data)
      } else if (activeTab === 'stats') {
        const response = await axios.get(`${API_BASE}/admin/stats`, getAuthHeaders())
        setStats(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data')
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteMatch = async (id) => {
    if (!confirm('Are you sure you want to delete this match?')) return
    
    try {
      await axios.delete(`${API_BASE}/admin/matches/${id}`, getAuthHeaders())
      loadData()
    } catch (err) {
      setError('Failed to delete match')
    }
  }
  
  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await axios.delete(`${API_BASE}/admin/users/${id}`, getAuthHeaders())
      loadData()
    } catch (err) {
      setError('Failed to delete user')
    }
  }
  
  const handleReloadMatch = async () => {
    try {
      await axios.post(`${API_BASE}/admin/matches/reload`, {}, getAuthHeaders())
      loadData()
      alert('Match reloaded successfully')
    } catch (err) {
      setError('Failed to reload match')
    }
  }
  
  const handleAddMatch = async (e) => {
    e.preventDefault()
    try {
      const matchData = {
        matchId: matchForm.matchId,
        series: matchForm.series,
        format: matchForm.format,
        date: matchForm.date,
        venue: matchForm.venue,
        city: matchForm.city,
        country: matchForm.country,
        teams: {
          team1: {
            name: matchForm.team1Name,
            captain: matchForm.team1Captain,
            players: []
          },
          team2: {
            name: matchForm.team2Name,
            captain: matchForm.team2Captain,
            players: []
          }
        },
        innings: [],
        result: {
          status: 'scheduled'
        }
      }
      
      await axios.post(`${API_BASE}/admin/matches`, matchData, getAuthHeaders())
      setShowAddMatchModal(false)
      setMatchForm({
        matchId: '',
        series: '',
        format: 'T20',
        date: '',
        venue: '',
        city: '',
        country: '',
        team1Name: '',
        team2Name: '',
        team1Captain: '',
        team2Captain: ''
      })
      loadData()
      alert('Match added successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add match')
    }
  }
  
  const handleEditMatch = (match) => {
    setEditingMatch(match)
    setMatchForm({
      matchId: match.matchId || '',
      series: match.series || '',
      format: match.format || 'T20',
      date: match.date ? new Date(match.date).toISOString().split('T')[0] : '',
      venue: match.venue || '',
      city: match.city || '',
      country: match.country || '',
      team1Name: match.teams?.team1?.name || '',
      team2Name: match.teams?.team2?.name || '',
      team1Captain: match.teams?.team1?.captain || '',
      team2Captain: match.teams?.team2?.captain || ''
    })
    setShowEditMatchModal(true)
  }
  
  const handleUpdateMatch = async (e) => {
    e.preventDefault()
    try {
      const matchData = {
        matchId: matchForm.matchId,
        series: matchForm.series,
        format: matchForm.format,
        date: matchForm.date,
        venue: matchForm.venue,
        city: matchForm.city,
        country: matchForm.country,
        teams: {
          team1: {
            name: matchForm.team1Name,
            captain: matchForm.team1Captain,
            players: editingMatch?.teams?.team1?.players || []
          },
          team2: {
            name: matchForm.team2Name,
            captain: matchForm.team2Captain,
            players: editingMatch?.teams?.team2?.players || []
          }
        },
        innings: editingMatch?.innings || [],
        result: editingMatch?.result || { status: 'scheduled' }
      }
      
      await axios.put(`${API_BASE}/admin/matches/${editingMatch.id}`, matchData, getAuthHeaders())
      setShowEditMatchModal(false)
      setEditingMatch(null)
      loadData()
      alert('Match updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update match')
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-red-600">H-SPORTS Admin</h1>
              <p className="text-sm text-gray-600">Control Panel</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {['matches', 'users', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-red-600 text-white border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'matches' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddMatchModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      + Add Match
                    </button>
                    <button
                      onClick={handleReloadMatch}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Reload from File
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Series</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {match.matchId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {match.series}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {match.venue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(match.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditMatch(match)}
                              className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Matches</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.totalMatches || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Admin Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.adminUsers || 0}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add Match Modal */}
      {showAddMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Match</h2>
              <button
                onClick={() => setShowAddMatchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Match ID *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.matchId}
                    onChange={(e) => setMatchForm({...matchForm, matchId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., eng-aus-t20-2025-11-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Series *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.series}
                    onChange={(e) => setMatchForm({...matchForm, series: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., England vs Australia T20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Format *</label>
                  <select
                    required
                    value={matchForm.format}
                    onChange={(e) => setMatchForm({...matchForm, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={matchForm.date}
                    onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.venue}
                    onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Melbourne Cricket Ground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.city}
                    onChange={(e) => setMatchForm({...matchForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Melbourne"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.country}
                    onChange={(e) => setMatchForm({...matchForm, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Australia"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Team 1</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={matchForm.team1Name}
                      onChange={(e) => setMatchForm({...matchForm, team1Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., England"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Captain</label>
                    <input
                      type="text"
                      value={matchForm.team1Captain}
                      onChange={(e) => setMatchForm({...matchForm, team1Captain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Joe Root"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Team 2</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={matchForm.team2Name}
                      onChange={(e) => setMatchForm({...matchForm, team2Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Australia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Captain</label>
                    <input
                      type="text"
                      value={matchForm.team2Captain}
                      onChange={(e) => setMatchForm({...matchForm, team2Captain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Pat Cummins"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMatchModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Add Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Match Modal */}
      {showEditMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Match</h2>
              <button
                onClick={() => {
                  setShowEditMatchModal(false)
                  setEditingMatch(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Match ID *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.matchId}
                    onChange={(e) => setMatchForm({...matchForm, matchId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Series *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.series}
                    onChange={(e) => setMatchForm({...matchForm, series: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Format *</label>
                  <select
                    required
                    value={matchForm.format}
                    onChange={(e) => setMatchForm({...matchForm, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={matchForm.date}
                    onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.venue}
                    onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.city}
                    onChange={(e) => setMatchForm({...matchForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={matchForm.country}
                    onChange={(e) => setMatchForm({...matchForm, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Team 1</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={matchForm.team1Name}
                      onChange={(e) => setMatchForm({...matchForm, team1Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Captain</label>
                    <input
                      type="text"
                      value={matchForm.team1Captain}
                      onChange={(e) => setMatchForm({...matchForm, team1Captain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Team 2</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={matchForm.team2Name}
                      onChange={(e) => setMatchForm({...matchForm, team2Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Captain</label>
                    <input
                      type="text"
                      value={matchForm.team2Captain}
                      onChange={(e) => setMatchForm({...matchForm, team2Captain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMatchModal(false)
                    setEditingMatch(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Update Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

