import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { songsService } from '../services/api'
import { shuffle } from '../utils'

interface Song {
  id: number
  title: string
  artist: string
  theme?: string
  emotion?: string
  genre?: string
  lyrics: string
  translation?: string
  youtube_url?: string
  youtubeUrl?: string
  difficultyLevel?: string
  duration?: number
}

export default function SongDetail() {
  const { id } = useParams<{ id: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        const foundSong = await songsService.getSongById(Number(id))

        if (foundSong && foundSong.lyrics) {
          setSong(foundSong)

          const possibleWords = ['Love', 'Dance', 'Sky', 'Run', 'Fly']
          const wordsNotInLyrics = possibleWords.filter(word => !foundSong.lyrics.toLowerCase().includes(word.toLowerCase()))
          const correctWord = wordsNotInLyrics.length > 0 ? wordsNotInLyrics[Math.floor(Math.random() * wordsNotInLyrics.length)] : 'Love'
          const otherOptions = possibleWords.filter(word => word !== correctWord).slice(0, 2)

          setQuizzes([
            {
              question: 'What is the main theme of this song?',
              options: shuffle([foundSong.theme || 'Love', 'Adventure', 'Friendship']),
              correctAnswer: foundSong.theme || 'Love',
            },
            {
              question: 'Which word appears in the title?',
              options: shuffle([foundSong.title, 'Trees', 'Sun']),
              correctAnswer: foundSong.title,
            },
            {
              question: 'What emotion does the song primarily convey?',
              options: shuffle([foundSong.emotion || 'Joy', 'Sadness', 'Excitement']),
              correctAnswer: foundSong.emotion || 'Joy',
            },
            {
              question: 'What is the genre of this song?',
              options: shuffle([foundSong.genre || 'Pop', 'Rock', 'Pop']),
              correctAnswer: foundSong.genre || 'Pop',
            },
            {
              question: 'Which of these words is NOT in the lyrics?',
              options: shuffle([correctWord, ...otherOptions]),
              correctAnswer: correctWord,
            },
          ])
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const youtubeUrl = song?.youtube_url || song?.youtubeUrl

  useEffect(() => {
    document.body.style.overflow = showQuiz ? 'hidden' : 'unset'
  }, [showQuiz])

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    if (selectedAnswer === quizzes[currentQuizIndex].correctAnswer) setQuizScore(prev => prev + 1)
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ff]">
        <p className="text-xl font-bold text-indigo-600 animate-pulse">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="bg-indigo-600 pt-16 pb-14 px-10 text-white shadow-md relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/songs" className="text-indigo-200 hover:text-white mb-6 inline-flex items-center gap-2 font-medium transition">
            <span>←</span> Voltar para músicas
          </Link>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">{song?.title}</h1>
          <p className="text-xl sm:text-2xl opacity-80 mt-2 font-medium">por {song?.artist}</p>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-6 sm:px-12 flex-grow -mt-8 mb-20 relative z-20">
        <section className="mb-16 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-white aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={youtubeUrl?.replace('watch?v=', 'embed/')}
              title="Player"
              allowFullScreen
              className="w-full h-full border-none"
            ></iframe>
          </div>
        </section>

        <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Letra e Tradução</h2>
              <p className="text-slate-400 mt-2 font-medium">Clique na frase para ver a tradução</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/tutor-ia"
                state={{
                  contextLabel: `${song?.title} by ${song?.artist}`,
                  initialPrompt: `Please help me study the song "${song?.title}" by ${song?.artist}. Focus on vocabulary, useful expressions, grammar patterns, and pronunciation tips. Here is an excerpt of the lyrics:\n\n${song?.lyrics?.split('\n').slice(0, 8).join('\n')}`,
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Study With AI</span>
              </Link>
              <button onClick={() => setShowQuiz(true)} className="bg-amber-400 hover:bg-amber-500 text-black font-black py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95">
                Quiz
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {song?.lyrics?.split('\n').map((line: string, index: number) => {
              const translation = song.translation?.split('\n')[index] || 'Tradução não disponível para esta linha'
              const isOpen = activeLine === index
              return (
                <article
                  key={index}
                  onClick={() => setActiveLine(isOpen ? null : index)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${isOpen ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-[#5143eb] hover:shadow-lg'}`}
                >
                  <p className={`text-xl leading-relaxed ${isOpen ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>{line}</p>
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-indigo-100">
                      <p className="text-indigo-600 italic font-medium text-lg leading-relaxed">{translation}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </main>

      {showQuiz && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 overflow-hidden">
            {!showResults ? (
              <>
                <div className="p-8 pb-4 border-b">
                  <button onClick={() => setShowQuiz(false)} className="absolute top-6 right-8 text-slate-400 text-3xl hover:text-slate-600">×</button>
                  <h2 className="text-2xl font-black text-slate-800 mb-1">Quiz da Música</h2>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Pergunta {currentQuizIndex + 1} de {quizzes.length}</p>
                </div>
                <div className="p-8 overflow-y-auto flex-grow text-left">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">{quizzes[currentQuizIndex].question}</h3>
                  <div className="grid gap-3">
                    {quizzes[currentQuizIndex].options.map((option: string) => (
                      <button
                        key={option}
                        onClick={() => setSelectedAnswer(option)}
                        className={`flex items-center p-5 border-2 rounded-2xl font-bold transition-all text-left ${selectedAnswer === option ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer === option ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                          {selectedAnswer === option && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <footer className="p-8 pt-4 border-t bg-slate-50/50">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-60"
                  >
                    {currentQuizIndex === quizzes.length - 1 ? 'Finalizar desafio' : 'Próxima pergunta'}
                  </button>
                </footer>
              </>
            ) : (
              <div className="text-center p-12">
                <div className="text-7xl mb-6">🏆</div>
                <h2 className="text-4xl font-black text-slate-800 mb-4">Resultado Final</h2>
                <div className="bg-indigo-50 rounded-3xl p-10 mb-10 inline-block px-16">
                  <p className="text-7xl font-black text-indigo-600">{quizScore}/{quizzes.length}</p>
                </div>
                <button
                  onClick={() => {
                    setShowQuiz(false)
                    setShowResults(false)
                    setCurrentQuizIndex(0)
                    setQuizScore(0)
                  }}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700"
                >
                  Voltar para a música
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
