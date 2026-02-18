import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">🎵 EngPurpose</h1>
          
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/songs" className="text-gray-700 hover:text-blue-600 font-semibold">
                  📚 Músicas
                </Link>
                <span className="text-gray-600">Olá, {user?.name}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold">
                  Login
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Aprenda Inglês através de Músicas 🎤
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Estude a língua inglesa de forma divertida e interativa com as suas músicas favoritas
          </p>

          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition text-lg"
              >
                Começar Agora
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition text-lg"
              >
                Já tenho conta
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Biblioteca Completa</h3>
            <p className="text-gray-600">
              Acesse uma grande coleção de músicas em inglês, desde clássicos até o mais recente do momento
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quizzes Interativos</h3>
            <p className="text-gray-600">
              Teste seu conhecimento com perguntas divertidas sobre as letras das músicas
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Acompanhe seu Progresso</h3>
            <p className="text-gray-600">
              Monitore seu aprendizado e veja seu progresso melhorar com o tempo
            </p>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Como Funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Passo 1 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cadastre-se</h3>
              <p className="text-gray-600 text-sm">Crie sua conta gratuitamente em segundos</p>
            </div>

            {/* Passo 2 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Escolha uma Música</h3>
              <p className="text-gray-600 text-sm">Navegue pela nossa biblioteca e selecione sua favorita</p>
            </div>

            {/* Passo 3 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Estude as Letras</h3>
              <p className="text-gray-600 text-sm">Leia e estude o significado de cada verso</p>
            </div>

            {/* Passo 4 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Faça Quiz</h3>
              <p className="text-gray-600 text-sm">Teste seu aprendizado com perguntas divertidas</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {isAuthenticated && (
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-lg mb-6">Explore nossa biblioteca de músicas e comece a aprender</p>
            <Link
              to="/songs"
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition text-lg inline-block"
            >
              Ver Músicas →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
