import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewsPage from './pages/NewsPage'
import PastMatchesPage from './pages/PastMatchesPage'
import UpcomingMatchesPage from './pages/UpcomingMatchesPage'
import MatchDetail from './pages/MatchDetail'
import PlayerPage from './pages/PlayerPage'
import TeamPage from './pages/TeamPage'
import UserPreferences from './pages/UserPreferences'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/matches/past" element={<PastMatchesPage />} />
              <Route path="/matches/upcoming" element={<UpcomingMatchesPage />} />
              <Route path="/match/:matchId" element={<MatchDetail />} />
              <Route path="/player/:playerId" element={<PlayerPage />} />
              <Route path="/team/:teamId" element={<TeamPage />} />
              <Route path="/preferences" element={<UserPreferences />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App

