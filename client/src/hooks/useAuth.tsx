import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INACTIVITY_TIMEOUT = 15 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    if (token) {
      const now = new Date().toLocaleTimeString()
      console.log(`⏱️  [${now}] Timer de inatividade resetado (15 minutos)`)

      inactivityTimerRef.current = setTimeout(() => {
        const expireTime = new Date().toLocaleTimeString()
        console.log(`🔴 [${expireTime}] Sessão expirada por inatividade de 15 minutos`)
        console.error('❌ Você será desconectado em breve...')

        const savedToken = localStorage.getItem('auth_token')
        if (savedToken) {
          setUser(null)
          setToken(null)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          localStorage.setItem('session_expired', 'true')
          console.log('✅ Logout automático realizado')
        }
      }, INACTIVITY_TIMEOUT)
    }
  }

  useEffect(() => {
    const restorSession = () => {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (savedToken && savedUser) {
        console.log('🔓 [Inicialização] Sessão restaurada do localStorage')
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        setTimeout(() => {
          resetInactivityTimer()
        }, 0)
      } else {
        console.log('🔒 [Inicialização] Nenhuma sessão ativa')
      }
      setIsLoading(false)
    }

    restorSession()
  }, [])

  useEffect(() => {
    if (!token) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    const handleActivity = (e: Event) => {
      const now = new Date().toLocaleTimeString()
      console.log(`🎯 [${now}] Atividade detectada - ${e.type}`)
      resetInactivityTimer()
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [token])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { authService } = await import('../services/api')
      console.log('🔓 Tentando fazer login com:', email)
      const response = await authService.login(email, password)

      setToken(response.token)
      setUser(response.user)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      localStorage.removeItem('session_expired')

      console.log(`✅ Login bem-sucedido para ${response.user.name}`)
      console.log(`⏱️  Token expira em: ${response.expiresIn} segundos (15 minutos)`)

      resetInactivityTimer()
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const { authService } = await import('../services/api')
      await authService.signup(name, email, password)

      await login(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Logout manual acionado')
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('session_expired')

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    console.log('✅ Sessão finalizada')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
