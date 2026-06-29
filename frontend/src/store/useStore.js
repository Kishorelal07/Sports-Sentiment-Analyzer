import { create } from 'zustand'
import axios from 'axios'
import { normalizeMatch } from '../utils/normalize'

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
      set({ matches: (response.data || []).map(normalizeMatch), loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  fetchMatch: async (matchId, options = {}) => {
    const silent = options.silent === true
    try {
      if (!silent) {
        set({ loading: true, error: null })
      }
      const response = await axios.get(`${API_BASE}/matches/${matchId}`)
      if (response.data) {
        const match = normalizeMatch(response.data)
        set({ currentMatch: match, ...(silent ? {} : { loading: false }) })
        return match
      }
      throw new Error('Match not found')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load match'
      if (silent) {
        console.warn('Background match refresh failed:', errorMsg)
        return get().currentMatch
      }
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

