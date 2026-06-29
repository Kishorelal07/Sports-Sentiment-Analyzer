import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

export default function PredictionCard({ matchId }) {
  const { predictions, fetchPrediction } = useStore()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const pred = predictions[matchId]
    if (pred) {
      setPrediction(pred)
      setLoading(false)
    } else {
      fetchPrediction(matchId)
        .then(setPrediction)
        .finally(() => setLoading(false))
    }
  }, [matchId, predictions])
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!prediction || !prediction.prediction) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <p className="text-gray-500">No prediction available</p>
      </div>
    )
  }
  
  const probabilities = prediction.prediction || {}
  const maxProbability = Math.max(...Object.values(probabilities))
  const winnerKey = Object.entries(probabilities)
    .find(([_, value]) => value === maxProbability)?.[0]
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🔮</span>
          Match Prediction
        </h2>
        <span className="text-xs font-semibold bg-purple-600 text-white px-3 py-1 rounded-full">
          AI Powered
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Winner Highlight */}
        {winnerKey && (
          <div className="bg-white rounded-lg p-4 border-2 border-purple-300 animate-pulse-slow">
            <p className="text-xs text-gray-600 mb-1">Most Likely Winner</p>
            <p className="text-xl font-bold text-purple-700 capitalize">
              {winnerKey.replace('_', ' ')} - {(maxProbability * 100).toFixed(1)}%
            </p>
          </div>
        )}
        
        {/* Probabilities */}
        <div>
          <p className="text-sm text-gray-700 font-semibold mb-3">Win Probabilities</p>
          <div className="space-y-3">
            {Object.entries(probabilities).map(([key, value]) => (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {(value * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-1000 ease-out
                      ${key === winnerKey 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }
                    `}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Prediction Text */}
        {prediction.aiPrediction && (
          <div className="border-t border-purple-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold flex items-center">
                <span className="mr-1">🤖</span>
                AI Analysis
              </p>
              {prediction.aiConfidence && (
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    prediction.aiConfidence === 'High'
                      ? 'bg-green-100 text-green-700'
                      : prediction.aiConfidence === 'Low'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {prediction.aiConfidence} confidence
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg p-3">
              {prediction.aiPrediction}
            </p>
            {prediction.aiReasoning && (
              <p className="text-xs text-gray-500 mt-2 italic">{prediction.aiReasoning}</p>
            )}
          </div>
        )}
        
        {/* Key Factors */}
        {prediction.explanations && prediction.explanations.length > 0 && (
          <div className="border-t border-purple-200 pt-4 mt-4">
            <p className="text-xs text-gray-600 font-semibold mb-3">🔑 Key Factors</p>
            <div className="space-y-2">
              {prediction.explanations.slice(0, 5).map((explanation, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 hover:shadow-md transition-shadow">
                  <span className="text-xs text-gray-700 flex-1 capitalize">
                    {explanation.feature?.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-purple-600 ml-2">
                    {Math.abs(explanation.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
