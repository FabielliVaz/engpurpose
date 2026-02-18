const API_BASE_URL = 'http://localhost:3000/api'

interface LoginResponse {
  expiresIn: any
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

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao fazer login')
    }

    return response.json()
  },

  signup: async (
    name: string,
    email: string,
    password: string
  ): Promise<SignupResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar usuário')
    }

    return response.json()
  },

  getUser: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário')
    }

    return response.json()
  },
}

export const songsService = {
  getAllSongs: async (): Promise<Song[]> => {
    const response = await fetch(`${API_BASE_URL}/songs`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar músicas')
    }

    return response.json()
  },

  getSongById: async (id: number): Promise<Song> => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar música')
    }

    return response.json()
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
