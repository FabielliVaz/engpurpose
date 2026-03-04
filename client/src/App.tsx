import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { SessionWarning } from './components/SessionWarning'
import { SessionDebug } from './components/SessionDebug'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Songs from './pages/Songs'
import SongDetail from './pages/SongDetail'
import QuickAccess from './pages/QuickAccess'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-gray-600">Carregando...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <>
      <SessionWarning />
      <SessionDebug />
      <Routes>
        <Route path="/" element={<QuickAccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/songs"
          element={
            //<PrivateRoute>
              <Songs />
            //</PrivateRoute>
          }
        />
        <Route
          path="/songs/:id"
          element={
            //<PrivateRoute>
              <SongDetail />
            //</PrivateRoute>
          }
        />
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