import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { SessionWarning } from './components/SessionWarning'
import { SessionDebug } from './components/SessionDebug'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Songs from './pages/Songs'
import SongDetail from './pages/SongDetail'
import QuickAccess from './pages/QuickAccess'

function AppRoutes() {
  return (
    <>
      <SessionWarning />
      <SessionDebug />
      <Routes>

        <Route path="/" element={<QuickAccess />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/songs" element={<Songs />} />
        <Route path="/songs/:id" element={<SongDetail />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App