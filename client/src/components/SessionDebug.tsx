import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export function SessionDebug() {
  const { user, token, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionInfo, setSessionInfo] = useState({
    token: '',
    user: null as any,
    expiresIn: 15,
    lastActivity: new Date().toLocaleTimeString(),
    sessionExpired: false
  })

  useEffect(() => {
    const updateInfo = () => {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      const sessionExpired = localStorage.getItem('session_expired') === 'true'

      setSessionInfo({
        token: savedToken ? `${savedToken.substring(0, 20)}...` : 'Nenhum',
        user: savedUser ? JSON.parse(savedUser) : null,
        expiresIn: 15,
        lastActivity: new Date().toLocaleTimeString(),
        sessionExpired
      })
    }

    updateInfo()
    const interval = setInterval(updateInfo, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleFakeLongInactivity = () => {
    console.log('🚨 Simulando 16 minutos de inatividade...')
    window.dispatchEvent(new CustomEvent('disable-inactivity'))
    setTimeout(() => {
      logout()
    }, 2000)
  }

  const handleSimulateActivity = () => {
    window.dispatchEvent(new Event('click'))
    setSessionInfo(prev => ({ ...prev, lastActivity: new Date().toLocaleTimeString() }))
  }

  if (!token || !user) return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-colors"
        title="Debug de Sessão"
      >
        🔍
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700 w-80 max-h-96 overflow-y-auto text-sm">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-3 border-b border-gray-700 pb-2">🔐 Painel QA: {user.name}</h3>

            <div className="space-y-2 mb-4">
              <div><span className="text-gray-400">Status:</span> <span className={sessionInfo.sessionExpired ? 'text-red-400 ml-2' : 'text-green-400 ml-2'}>{sessionInfo.sessionExpired ? '❌ Expirada' : '✅ Ativa'}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="text-blue-400 ml-2">{user.email}</span></div>
              <div><span className="text-gray-400">Token:</span> <span className="text-yellow-400 ml-2 font-mono text-xs">{sessionInfo.token}</span></div>
              <div><span className="text-gray-400">Última atividade:</span> <span className="text-cyan-400 ml-2">{sessionInfo.lastActivity}</span></div>
            </div>

            <div className="border-t border-gray-700 pt-3 space-y-2">
              <button onClick={handleSimulateActivity} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-semibold">🖱️ Simular Atividade</button>
              <button onClick={handleFakeLongInactivity} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-xs font-semibold">⏰ Forçar Expiração</button>
              <button onClick={() => { logout(); setIsOpen(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-semibold">🚪 Logout Imediato</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}