import { useNavigate } from 'react-router-dom';

export default function QuickAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-6xl mb-6">🗽🎶</div>
        <h1 className="text-3xl font-black text-slate-800 mb-4">Bem-vindo(a) ao EngPurpose!</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Explore nossa biblioteca de músicas e pratique seu inglês com letras e quizzes.
        </p>
        
        <button 
          onClick={() => navigate('/songs')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 text-lg"
        >
          ENTRAR SEM LOGIN
        </button>
        
        <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest font-bold">
          Modo de Visualização (Preview)
        </p>
      </div>
    </div>
  );
}