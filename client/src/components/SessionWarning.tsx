import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export function SessionWarning() {
  const { logout, token } = useAuth()
  const [sessionExpiring, setSessionExpiring] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutos em segundos

  useEffect(() => {
    if (!token) {
      setSessionExpiring(false)
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const nextValue = prev - 1
        
        if (nextValue <= 120 && nextValue > 0) {
          setSessionExpiring(true)
        }
        
        if (nextValue <= 0) {
          setSessionExpiring(false)
          return 0
        }
        
        return nextValue
      })
    }, 1000)

    const resetTimer = () => {
      setTimeRemaining(900)
      setSessionExpiring(false)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'click']
    events.forEach(event => window.addEventListener(event, resetTimer))

    return () => {
      clearInterval(timer)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [token])

  if (!sessionExpiring) return null

  const handleExtendSession = () => {
    window.dispatchEvent(new Event('click')) // Dispara evento para o useAuth e para o reset local
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-sm z-40 animate-bounce">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⏰</span>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 mb-1">Sessão Expirando!</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Sua sessão expira em <strong>{timeRemaining}</strong> segundos por inatividade.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExtendSession}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1 rounded transition-colors"
            >
              Continuar Sessão
            </button>
            <button
              onClick={logout}
              className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-1 rounded transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}