import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_URL = 'http://localhost:3000/api/ai';

export default function Chat_AI() {
    const [input, setInput] = useState('')
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [limit, setLimit] = useState(5) 
    const [error, setError] = useState('')
    
    const [isLocked, setIsLocked] = useState(false)
    const [countdown, setCountdown] = useState(0)
    
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else {
            setIsLocked(false);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        const fetchLimit = async () => {
            try {
                const res = await fetch(`${API_URL}/limit/1`)
                const data = await res.json()
                if (res.ok && data.remaining !== undefined) {
                    setLimit(data.remaining)
                }
            } catch (err) {
                console.error("Erro ao carregar limite inicial:", err)
            }
        }
        fetchLimit()
    }, [])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chatHistory, isLoading])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'unset' }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!input.trim() || limit <= 0 || isLoading || isLocked) return

        setError('')
        const userMessage = input.trim()
        setInput('')
        setIsLocked(true) 
        
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }])
        setIsLoading(true)

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: userMessage, userId: 1 }), 
            })

            if (res.status === 429) {
                setCountdown(30) 
                setError('O Google está processando muitas requisições. Aguarde o cronômetro.')
                setIsLoading(false)
                return
            }

            if (res.status === 403) {
                setLimit(0)
                setError('Seu limite diário acabou! Volte amanhã para praticar mais.')
                setIsLoading(false)
                return
            }

            if (!res.ok) throw new Error('Erro na comunicação com o servidor')

            const data = await res.json()
            
            setChatHistory(prev => [...prev, { role: 'ai', text: data.response }])
            setLimit(prev => Math.max(0, prev - 1))
            setCountdown(5) 

        } catch (err) {
            setError('Ops! Ocorreu um erro ao falar com a IA. Tente novamente.')
            setIsLocked(false)
        } finally {
            setIsLoading(false)
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
                    <p className="opacity-90 text-sm font-medium">Foco em vocabulário e gramática</p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-6 overflow-hidden">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-4xl flex flex-col h-full max-h-[85vh] overflow-hidden">
                    
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center px-8 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                                {isLocked ? 'Aguardando...' : 'IA Online'}
                            </span>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-wider transition-colors ${limit > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {limit > 0 ? `${limit} PERGUNTAS RESTANTES` : 'LIMITE ESGOTADO'}
                        </span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-6">
                        {chatHistory.length === 0 && !isLoading && (
                            <div className="text-center py-10 opacity-40">
                                <div className="text-5xl mb-4">💬</div>
                                <p className="font-bold text-slate-400 italic">"How do I use 'schedule' in a sentence?"</p>
                            </div>
                        )}
                        
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[90%] p-5 rounded-[2rem] shadow-sm text-lg leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none font-medium'
                                }`}>
                                    {msg.role === 'ai' ? (
                                        <article className="prose prose-indigo prose-sm sm:prose-base max-w-none prose-table:border prose-table:rounded-xl">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </article>
                                    ) : (
                                        msg.text
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
                                ⚠️ {error}
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
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={limit <= 0 || isLoading || isLocked}
                                    placeholder={isLocked ? `Aguarde ${countdown}s...` : limit > 0 ? "Ask me anything about English..." : "Volte amanhã!"}
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
                                {isLoading ? '...' : isLocked && countdown > 0 ? `${countdown}s` : 'ENVIAR'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}