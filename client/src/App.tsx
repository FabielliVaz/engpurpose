import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { SessionDebug } from './components/SessionDebug'
import { SessionWarning } from './components/SessionWarning'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import QuickAccess from './pages/QuickAccess'
import Signup from './pages/Signup'
import SongDetail from './pages/SongDetail'
import Songs from './pages/Songs'
import Chat_AI from './pages/Chat_AI' 

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
        <Route path="/tutor-ia" element={<Chat_AI />} />
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