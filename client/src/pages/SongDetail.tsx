import { mockedSongs } from '../mocks/songs'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { songsService } from '../services/api'

export default function SongDetail() {
    const { id } = useParams<{ id: string }>()
    const [song, setSong] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeLine, setActiveLine] = useState<number | null>(null)
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [showQuiz, setShowQuiz] = useState(false)
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [quizScore, setQuizScore] = useState(0)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        try {
            const foundSong = mockedSongs.find(s => s.id === Number(id))

            if (foundSong) {
                setSong(foundSong)
                setQuizzes([
                    { question: 'What is the main theme of this song?', options: ['Love', 'Adventure', 'Friendship'], correctAnswer: 'Love' },
                    { question: 'Which word appears in the title?', options: [foundSong.title, 'Trees', 'Sun'], correctAnswer: foundSong.title }
                ])
            }
        } catch (err) {
            console.error("Erro ao carregar mock:", err)
        } finally {
            setIsLoading(false)
        }
    }, [id])

    useEffect(() => {
        document.body.style.overflow = showQuiz ? 'hidden' : 'unset';
    }, [showQuiz]);

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return
        if (selectedAnswer === quizzes[currentQuizIndex].correctAnswer) setQuizScore(prev => prev + 1)
        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1)
            setSelectedAnswer(null)
        } else { setShowResults(true) }
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">Carregando...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
            {/* O Toggle de tema não fica mais aqui, ele está no App.tsx */}

            <header className="bg-indigo-600 dark:bg-indigo-900 pt-16 pb-14 px-10 text-white shadow-md relative z-10 transition-colors">
                <div className="max-w-5xl mx-auto px-6">
                    <Link to="/songs" className="text-indigo-200 dark:text-indigo-300 hover:text-white mb-6 inline-flex items-center gap-2 font-medium transition">
                        <span>←</span> Voltar para músicas
                    </Link>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">{song?.title}</h1>
                    <p className="text-xl sm:text-2xl opacity-80 mt-2 font-medium">por {song?.artist}</p>
                </div>
            </header>

            <main className="max-w-5xl w-full mx-auto px-6 sm:px-12 flex-grow -mt-8 mb-20 relative z-20">
                <section className="mb-16 relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-white dark:ring-slate-900 aspect-video w-full transition-all">
                        <iframe
                            width="100%" height="100%"
                            src={song?.youtubeUrl?.replace('watch?v=', 'embed/')}
                            title="Player" allowFullScreen className="w-full h-full border-none"
                        ></iframe>
                    </div>
                </section>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 sm:p-16 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Letra e Tradução</h2>
                            <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">💡 Clique na frase para ver a tradução</p>
                        </div>
                        <button onClick={() => setShowQuiz(true)} className="bg-amber-400 hover:bg-amber-500 text-black font-black py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95">
                            🔍 QUIZZ
                        </button>
                    </div>

                    <div className="space-y-4">
                        {song?.lyrics?.split('\n').map((line: string, index: number) => {
                            const translation = song.translation?.split('\n')[index] || "Tradução não disponível para esta linha"                            const isOpen = activeLine === index
                            return (
                                <article key={index} onClick={() => setActiveLine(isOpen ? null : index)}
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${isOpen
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                                        : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900'
                                        }`}>
                                    <p className={`text-xl leading-relaxed ${isOpen ? 'text-indigo-900 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{line}</p>
                                    {isOpen && translation && (
                                        <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
                                            <p className="text-indigo-600 dark:text-indigo-400 italic font-medium text-lg leading-relaxed">{translation}</p>
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                </div>
            </main>

            {showQuiz && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {!showResults ? (
                            <>
                                <div className="p-8 pb-4 border-b dark:border-slate-800">
                                    <button onClick={() => setShowQuiz(false)} className="absolute top-6 right-8 text-slate-400 dark:text-slate-600 text-3xl hover:text-slate-600 transition-colors">✕</button>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1 leading-none">Quiz da Música</h2>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Pergunta {currentQuizIndex + 1} de {quizzes.length}</p>
                                </div>

                                <div className="p-8 overflow-y-auto flex-grow custom-scrollbar text-left">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-8 leading-tight">{quizzes[currentQuizIndex].question}</h3>
                                    <div className="grid gap-3">
                                        {quizzes[currentQuizIndex].options.map((option: string) => (
                                            <button key={option} onClick={() => setSelectedAnswer(option)}
                                                className={`flex items-center p-5 border-2 rounded-2xl font-bold transition-all text-left ${selectedAnswer === option
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}>
                                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer === option ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                    {selectedAnswer === option && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <footer className="p-8 pt-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <button onClick={handleSubmitAnswer} disabled={!selectedAnswer}
                                        className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-60">
                                        {currentQuizIndex === quizzes.length - 1 ? 'FINALIZAR DESAFIO' : 'PRÓXIMA PERGUNTA'}
                                    </button>
                                </footer>
                            </>
                        ) : (
                            <div className="text-center p-12">
                                <div className="text-7xl mb-6">🏆</div>
                                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Resultado Final</h2>
                                <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl p-10 mb-10 inline-block px-16">
                                    <p className="text-7xl font-black text-indigo-600 dark:text-indigo-400">{quizScore}/{quizzes.length}</p>
                                </div>
                                <button onClick={() => { setShowQuiz(false); setShowResults(false); setCurrentQuizIndex(0); setQuizScore(0); }}
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors"
                                >
                                    VOLTAR PARA A MÚSICA
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}