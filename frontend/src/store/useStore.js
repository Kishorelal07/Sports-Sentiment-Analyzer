import { create } from 'zustand'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const useStore = create((set, get) => ({
  // State
  matches: [],
  currentMatch: null,
  events: [],
  sentiments: [],
  predictions: {},
  user: null,
  loading: false,
  error: null,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchMatches: async () => {
    try {
      set({ loading: true })
      const response = await axios.get(`${API_BASE}/matches`)
      set({ matches: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  fetchMatch: async (matchId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`${API_BASE}/matches/${matchId}`)
      if (response.data) {
        set({ currentMatch: response.data, loading: false })
        return response.data
      } else {
        throw new Error('Match not found')
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load match'
      set({ error: errorMsg, loading: false, currentMatch: null })
      throw new Error(errorMsg)
    }
  },
  
  fetchEvents: async (matchId) => {
    try {
      const response = await axios.get(`${API_BASE}/events/match/${matchId}`)
      set({ events: response.data || [] })
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch events:', error)
      set({ events: [] })
      return []
    }
  },
  
  fetchSentiment: async (matchId) => {
    try {
      const response = await axios.get(`${API_BASE}/sentiment/match/${matchId}`)
      set({ sentiments: response.data || [] })
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch sentiment:', error)
      set({ sentiments: [] })
      return []
    }
  },
  
  fetchPrediction: async (matchId) => {
    try {
      const response = await axios.get(`${API_BASE}/predict/match/${matchId}`)
      set(state => ({
        predictions: {
          ...state.predictions,
          [matchId]: response.data
        }
      }))
      return response.data
    } catch (error) {
      console.warn('Failed to fetch prediction:', error)
      set({ error: error.message })
      // Don't throw, just return null so page can still load
      return null
    }
  },
  
  fetchUser: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}`)
      set({ user: response.data })
      return response.data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  updateUserPreferences: async (userId, preferences) => {
    try {
      const response = await axios.post(
        `${API_BASE}/users/${userId}/preferences`,
        preferences
      )
      set({ user: response.data })
      return response.data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  addEvent: (event) => set(state => ({
    events: [...state.events, event]
  })),
  
  addSentiment: (sentiment) => set(state => ({
    sentiments: [...state.sentiments, sentiment]
  }))
}))

export default useStore

