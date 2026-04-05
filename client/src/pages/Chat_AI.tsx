import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { aiService, AiMessage } from '../services/api'

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

type TutorLocationState = {
  initialPrompt?: string
  contextLabel?: string
}

export default function Chat_AI() {
  const location = useLocation()
  const navigationState = (location.state as TutorLocationState | null) ?? null
  const [input, setInput] = useState('')
  const [chatHistory, setChatHistory] = useState<AiMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [limit, setLimit] = useState(5)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (navigationState?.initialPrompt) {
      setInput(current => current || navigationState.initialPrompt || '')
    }
  }, [navigationState?.initialPrompt])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined

    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    } else {
      setIsLocked(false)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const data = await aiService.getLimit(1)
        if (data.remaining !== undefined) {
          const today = new Date().toDateString()
          const storedUsage = localStorage.getItem(`ai_usage_${today}`)
          const usedToday = storedUsage ? parseInt(storedUsage, 10) : 0
          setLimit(Math.max(0, 5 - usedToday))
        }
      } catch (err) {
        console.error('Erro ao carregar limite inicial:', err)
        const today = new Date().toDateString()
        const storedUsage = localStorage.getItem(`ai_usage_${today}`)
        const usedToday = storedUsage ? parseInt(storedUsage, 10) : 0
        setLimit(Math.max(0, 5 - usedToday))
      }
    }

    fetchLimit()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || limit <= 0 || isLoading || isLocked) return

    setError('')
    setStatusMessage('')
    const userMessage = input.trim()
    setInput('')
    setIsLocked(true)
    setChatHistory(prev => [...prev, { id: createMessageId(), role: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const data = await aiService.chat(userMessage, 1)
      setChatHistory(prev => [...prev, { id: createMessageId(), role: 'ai', text: data.response }])

      if (data.fallback) {
        if (data.providerStatus === 'rate_limit') {
          setStatusMessage('Tutor in contingency mode: the main provider hit a temporary rate limit.')
        } else if (data.providerStatus === 'missing_key') {
          setStatusMessage('Tutor in contingency mode: the external AI is not configured in this environment.')
        } else {
          setStatusMessage('Tutor in contingency mode: this response came from the local fallback.')
        }
      }

      const today = new Date().toDateString()
      const storedUsage = localStorage.getItem(`ai_usage_${today}`)
      const usedToday = storedUsage ? parseInt(storedUsage, 10) : 0
      localStorage.setItem(`ai_usage_${today}`, (usedToday + 1).toString())
      setLimit(prev => Math.max(0, prev - 1))
      setCountdown(5)
    } catch (err: any) {
      const status = typeof err?.status === 'number' ? err.status : undefined

      if (status === 429) {
        setCountdown(30)
        setError('The AI provider is busy. Please wait a few seconds and try again.')
        setIsLoading(false)
        return
      }

      if (status === 403) {
        setLimit(0)
        setError('Your daily limit is over for now. Please come back tomorrow.')
        setIsLoading(false)
        return
      }

      setError(err instanceof Error ? err.message : 'Something went wrong while contacting the AI tutor.')
      setIsLocked(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslate = async (messageId: string, text: string) => {
    setError('')

    setChatHistory(prev =>
      prev.map(message =>
        message.id === messageId ? { ...message, isTranslating: true } : message
      )
    )

    try {
      const data = await aiService.translate(text, 1)
      setChatHistory(prev =>
        prev.map(message =>
          message.id === messageId
            ? { ...message, translation: data.response, isTranslating: false }
            : message
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not translate this block right now.')
      setChatHistory(prev =>
        prev.map(message =>
          message.id === messageId ? { ...message, isTranslating: false } : message
        )
      )
    }
  }

  return (
    <div className="h-screen bg-[#f5f3ff] flex flex-col overflow-hidden">
      <header className="bg-indigo-600 pt-10 pb-8 px-10 text-white shadow-md flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/songs" className="text-indigo-200 hover:text-white mb-4 inline-flex items-center gap-2 font-medium transition">
            <span>←</span> Voltar
          </Link>
          <h1 className="text-3xl font-black tracking-tight">English AI Tutor</h1>
          <p className="opacity-90 text-sm font-medium">Practice in English and translate each reply when needed</p>
          {navigationState?.contextLabel && (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-indigo-100">
              Context: {navigationState.contextLabel}
            </p>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-6 overflow-hidden">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-4xl flex flex-col h-full max-h-[85vh] overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center px-8 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                {isLocked ? 'Waiting...' : 'Tutor Online'}
              </span>
            </div>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-wider transition-colors ${limit > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {limit > 0 ? `${limit} REQUESTS LEFT` : 'LIMIT REACHED'}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-6">
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center py-10 opacity-40">
                <div className="text-5xl mb-4">💬</div>
                <p className="font-bold text-slate-400 italic">"How do I use 'schedule' in a sentence?"</p>
              </div>
            )}

            {chatHistory.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] p-5 rounded-[2rem] shadow-sm text-lg leading-relaxed ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none font-medium'}`}>
                  {message.role === 'ai' ? (
                    <>
                      <article className="prose prose-indigo prose-sm sm:prose-base max-w-none prose-table:border prose-table:rounded-xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      </article>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTranslate(message.id, message.text)}
                          disabled={message.isTranslating}
                          className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                        >
                          {message.isTranslating ? 'Translating...' : 'Translate'}
                        </button>
                      </div>
                      {message.translation && (
                        <article className="prose prose-slate prose-sm sm:prose-base mt-4 max-w-none rounded-2xl border border-slate-200 bg-white/70 p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.translation}
                          </ReactMarkdown>
                        </article>
                      )}
                    </>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-[1.5rem] rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-100 font-bold text-sm">
                {error}
              </div>
            )}

            {statusMessage && !error && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-center border border-amber-100 font-bold text-sm">
                {statusMessage}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  disabled={limit <= 0 || isLoading || isLocked}
                  placeholder={isLocked ? `Wait ${countdown}s...` : limit > 0 ? 'Ask about this song, vocabulary, grammar, or pronunciation.' : 'Come back tomorrow!'}
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-2xl px-6 py-4 outline-none font-medium transition-all text-slate-700 disabled:opacity-50"
                />
                {isLocked && countdown > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
                    {countdown}s
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={limit <= 0 || isLoading || isLocked || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? '...' : isLocked && countdown > 0 ? `${countdown}s` : 'SEND'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
