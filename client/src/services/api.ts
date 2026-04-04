import { mockedSongs } from '../mocks/songs'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const AUTH_STORAGE_KEY = 'mock_auth_users'

type MockAuthUser = {
  id: number
  name: string
  email: string
  password: string
}

interface LoginResponse {
  expiresIn: number
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface SignupResponse {
  message: string
  userId: number
}

export interface Song {
  id: number
  title: string
  artist: string
  description?: string | null
  youtubeUrl?: string | null
  lyrics: string
  translation: string
  themes?: any
  coverUrl?: string | null
  playerUrl?: string | null
  difficultyLevel: 'A2' | 'B1' | 'B2'
  duration?: number | null
  lyricsTimestamps?: string | null
  createdAt: string
  updatedAt: string
}

export interface AiChatResponse {
  response: string
  fallback?: boolean
  providerStatus?: 'ok' | 'rate_limit' | 'unavailable' | 'missing_key'
  message?: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  translation?: string
  isTranslating?: boolean
}

const readMockUsers = (): MockAuthUser[] => {
  if (typeof window === 'undefined') return []

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as MockAuthUser[]
  } catch {
    return []
  }
}

const writeMockUsers = (users: MockAuthUser[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users))
}

const createMockToken = (userId: number) => `mock-token-${userId}`

const loginWithMock = (email: string, password: string): LoginResponse => {
  const users = readMockUsers()
  const user = users.find(entry => entry.email.toLowerCase() === email.toLowerCase())

  if (!user || user.password !== password) {
    throw new Error('Email ou senha inválidos')
  }

  return {
    token: createMockToken(user.id),
    expiresIn: 900,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  }
}

const signupWithMock = (name: string, email: string, password: string): SignupResponse => {
  const users = readMockUsers()
  const alreadyExists = users.some(entry => entry.email.toLowerCase() === email.toLowerCase())

  if (alreadyExists) {
    throw new Error('Email já cadastrado')
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(entry => entry.id)) + 1 : 1,
    name,
    email,
    password,
  }

  writeMockUsers([...users, newUser])

  return {
    message: 'Usuário criado com sucesso!',
    userId: newUser.id,
  }
}

const getMockUser = (id: number, token: string) => {
  if (token !== createMockToken(id)) {
    throw new Error('Erro ao obter dados do usuário')
  }

  const user = readMockUsers().find(entry => entry.id === id)
  if (!user) {
    throw new Error('Erro ao obter dados do usuário')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

const normalizeSong = (song: any): Song => ({
  ...song,
  youtubeUrl: song.youtubeUrl ?? song.youtube_url ?? null,
  createdAt: song.createdAt ?? new Date(0).toISOString(),
  updatedAt: song.updatedAt ?? new Date(0).toISOString(),
})

const getMockSongs = (): Song[] => mockedSongs.map(normalizeSong)

const getMockSongById = (id: number): Song => {
  const song = getMockSongs().find(entry => entry.id === id)
  if (!song) {
    throw new Error('Erro ao buscar música')
  }
  return song
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return loginWithMock(email, password)
        }

        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer login')
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.message === 'Email ou senha inválidos') {
        throw error
      }
      return loginWithMock(email, password)
    }
  },

  signup: async (
    name: string,
    email: string,
    password: string
  ): Promise<SignupResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return signupWithMock(name, email, password)
        }

        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar usuário')
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.message === 'Email já cadastrado') {
        throw error
      }
      return signupWithMock(name, email, password)
    }
  },

  getUser: async (id: number, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return getMockUser(id, token)
        }

        throw new Error('Erro ao obter dados do usuário')
      }

      return response.json()
    } catch {
      return getMockUser(id, token)
    }
  },
}

export const songsService = {
  getAllSongs: async (): Promise<Song[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar músicas')
      }

      const data = await response.json()
      return (data as any[]).map(normalizeSong)
    } catch {
      return getMockSongs()
    }
  },

  getSongById: async (id: number): Promise<Song> => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar música')
      }

      const data = await response.json()
      return normalizeSong(data)
    } catch {
      return getMockSongById(id)
    }
  },

  createSong: async (
    songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>,
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(songData),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar música')
    }

    return response.json()
  },

  updateSong: async (id: number, songData: Partial<Song>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(songData),
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar música')
    }

    return response.json()
  },

  deleteSong: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error('Erro ao deletar música')
    }

    return response.json()
  },
}

export const aiService = {
  getLimit: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/ai/limit?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar limite')
    }
    return response.json()
  },

  chat: async (
    input: string,
    userId: number,
    mode: 'chat' | 'translate' = 'chat'
  ): Promise<AiChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, userId, mode }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(data.error || 'Erro na comunicação com o servidor') as Error & {
        status?: number
      }
      error.status = response.status
      throw error
    }

    return data
  },

  translate: async (input: string, userId: number): Promise<AiChatResponse> => {
    return aiService.chat(input, userId, 'translate')
  },
}
