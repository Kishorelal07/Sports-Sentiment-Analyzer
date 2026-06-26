import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

export default function NewsPage() {
  const { matches, fetchMatches } = useStore()
  const [newsItems, setNewsItems] = useState([])
  
  useEffect(() => {
    fetchMatches()
    // Generate news items from match data
    generateNews()
  }, [matches])
  
  const generateNews = () => {
    const items = [
      {
        id: 1,
        title: "England vs Australia T20 Series Kicks Off",
        summary: "The highly anticipated T20 series between England and Australia begins with an exciting match at MCG.",
        category: "Match Preview",
        date: new Date(),
        image: "🏏",
        featured: true
      },
      {
        id: 2,
        title: "Maxwell's Stunning Performance Leads Australia",
        summary: "Glenn Maxwell's explosive batting display has been the talk of the series, scoring 45 runs off just 28 balls.",
        category: "Player Performance",
        date: new Date(Date.now() - 3600000),
        image: "🔥"
      },
      {
        id: 3,
        title: "Cricket Analytics Platform Launched",
        summary: "H-Sports introduces advanced analytics platform for cricket fans with real-time insights and predictions.",
        category: "Platform News",
        date: new Date(Date.now() - 7200000),
        image: "📊"
      },
      {
        id: 4,
        title: "Sentiment Analysis Shows Strong Fan Engagement",
        summary: "Social media sentiment analysis reveals high engagement levels for the ongoing T20 series.",
        category: "Analytics",
        date: new Date(Date.now() - 10800000),
        image: "💬"
      },
      {
        id: 5,
        title: "Prediction Model Updates",
        summary: "Our AI-powered prediction model has been updated with new features including run rate analysis and wicket predictions.",
        category: "Technology",
        date: new Date(Date.now() - 14400000),
        image: "🤖"
      }
    ]
    setNewsItems(items)
  }
  
  const featuredNews = newsItems.find(item => item.featured)
  const regularNews = newsItems.filter(item => !item.featured)
  
  return (
    <div className="px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Cricket News</h1>
        <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-semibold text-green-800">LIVE UPDATES</span>
        </div>
      </div>
      
      {/* Featured News */}
      {featuredNews && (
        <Link to={`/match/${matches[0]?.matchId || 'eng-aus-t20-2025-11-24'}`}>
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-start space-x-6">
              <div className="text-6xl">{featuredNews.image}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                    {featuredNews.category}
                  </span>
                  <span className="text-red-200 text-sm">
                    {featuredNews.date.toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-3xl font-black mb-3">{featuredNews.title}</h2>
                <p className="text-red-100 text-lg leading-relaxed">{featuredNews.summary}</p>
                <button className="mt-4 bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                  Read More →
                </button>
              </div>
            </div>
          </div>
        </Link>
      )}
      
      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularNews.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl flex-shrink-0">{news.image}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                    {news.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {news.date.toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{news.summary}</p>
                <button className="mt-4 text-red-600 text-sm font-semibold hover:underline">
                  Read More →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{matches.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600 mt-1">Live Now</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">85K+</div>
            <div className="text-sm text-gray-600 mt-1">Events Tracked</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600 mt-1">Data Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )
}

