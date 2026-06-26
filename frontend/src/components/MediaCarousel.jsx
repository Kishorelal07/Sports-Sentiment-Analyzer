import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function MediaCarousel({ matchId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [mediaFiles, setMediaFiles] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get(`${API_BASE}/media/match/${matchId}`)
        setMediaFiles(response.data)
      } catch (error) {
        console.error('Error fetching media:', error)
        // Fallback to mock media
        setMediaFiles([
          { url: '/api/media/file/highlight1.jpg', title: 'Match Highlight 1', type: 'image' },
          { url: '/api/media/file/highlight2.jpg', title: 'Match Highlight 2', type: 'image' },
          { url: '/api/media/file/highlight3.jpg', title: 'Match Highlight 3', type: 'image' }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    if (matchId) {
      fetchMedia()
    }
  }, [matchId])
  
  useEffect(() => {
    if (isAutoPlaying && mediaFiles.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaFiles.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, mediaFiles.length])
  
  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaFiles.length)
    setIsAutoPlaying(false)
  }
  
  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length)
    setIsAutoPlaying(false)
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">📸</span>
          Match Highlights
        </h2>
        {mediaFiles.length > 1 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        )}
      </div>
      
      {mediaFiles.length > 0 ? (
        <div className="relative group">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
            {mediaFiles[currentIndex].type === 'image' ? (
              <img 
                src={`${API_BASE}${mediaFiles[currentIndex].url}`}
                alt={mediaFiles[currentIndex].name || mediaFiles[currentIndex].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `
                    <div class="text-center p-8">
                      <div class="text-6xl mb-4 animate-bounce-slow">🏏</div>
                      <p class="text-lg font-semibold text-gray-700 mb-2">${mediaFiles[currentIndex].title || mediaFiles[currentIndex].name}</p>
                    </div>
                  `
                }}
              />
            ) : (
              <div className="text-center p-8">
                <div className="text-6xl mb-4 animate-bounce-slow">🎥</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {mediaFiles[currentIndex].title || mediaFiles[currentIndex].name}
                </p>
              </div>
            )}
            
            {/* Navigation Arrows */}
            {mediaFiles.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots Indicator */}
          {mediaFiles.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {mediaFiles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setIsAutoPlaying(false)
                  }}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${idx === currentIndex 
                      ? 'bg-red-600 w-8 scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                    }
                  `}
                />
              ))}
            </div>
          )}
          
          {/* Counter */}
          {mediaFiles.length > 1 && (
            <div className="text-center mt-2 text-xs text-gray-500">
              {currentIndex + 1} / {mediaFiles.length}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl mb-2">📷</div>
            <p>No media available</p>
          </div>
        </div>
      )}
    </div>
  )
}
