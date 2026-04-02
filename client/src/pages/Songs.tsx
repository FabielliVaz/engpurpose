import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { songsService, Song } from '../services/api'

export const getDifficultyColor = (level: string) => {
  const l = (level || '').toUpperCase()
  if (l === 'A2') return 'bg-green-100 text-green-800'
  if (l === 'B1') return 'bg-yellow-100 text-yellow-800'
  if (l === 'B2') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

export const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds === 0) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true)

      try {
        const data = await songsService.getAllSongs()
        setSongs(data)
      } catch (err) {
        console.warn('Erro ao buscar músicas:', err)
        setSongs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [])

  const filteredSongs = filterDifficulty === 'all'
    ? songs
    : songs.filter(song => (song.difficultyLevel || '').toUpperCase() === filterDifficulty.toUpperCase())

  return (
    <div className="min-h-screen bg-[#f5f3ff] p-8 transition-none">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Biblioteca de Músicas</h1>
          <p className="text-gray-600">Aprenda inglês através das melhores músicas para o seu PDI</p>
        </div>

        <div className="mb-8 bg-white rounded-lg shadow p-4 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por nível:</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'A2', 'B1', 'B2'].map(level => (
              <button
                key={level}
                onClick={() => setFilterDifficulty(level)}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterDifficulty === level ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {level === 'all' ? 'Todas' : level === 'A2' ? 'Fácil (A2)' : level === 'B1' ? 'Intermediário (B1)' : 'Avançado (B2)'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 animate-pulse">Carregando músicas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map(song => (
              <Link key={song.id} to={`/songs/${song.id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-6 border border-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{song.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">por {song.artist}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(song.difficultyLevel)}`}>
                    {song.difficultyLevel === 'A2' ? 'Fácil' : song.difficultyLevel === 'B1' ? 'Intermediário' : 'Avançado'}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1 font-medium">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
