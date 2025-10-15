import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

const LoginInnovador = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await signIn(email, password)
      if (!result.error) {
        toast.success('¡Bienvenido de nuevo!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      toast.error('Error al iniciar sesión. Por favor, verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-engage-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="logo-container p-3 bg-engage-black rounded-lg">
              <img 
                src="/images/Mesa-de-trabajo-105-1.png" 
                alt="Logo" 
                className="logo-image h-16 w-auto"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="mt-2 text-gray-300">Inicia sesión para continuar con tu experiencia</p>
        </div>

        <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border border-engage-blue/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-engage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-700 rounded-2xl bg-gray-800 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-engage-blue focus:border-engage-blue text-lg text-white"
                  placeholder="tu@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-engage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-700 rounded-2xl bg-gray-800 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-engage-blue focus:border-engage-blue text-lg text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-engage-blue focus:ring-engage-blue border-gray-600 rounded bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-engage-blue hover:text-engage-yellow">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-engage-blue to-engage-yellow hover:from-engage-yellow hover:to-engage-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-300">
                  ¿Primera vez aquí?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-4 px-4 border border-engage-blue rounded-2xl shadow-sm text-lg font-medium text-engage-blue bg-gray-800 hover:bg-engage-blue/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue transition-all duration-300"
              >
                Crear una cuenta
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Al iniciar sesión, aceptas nuestros{' '}
            <a href="#" className="font-medium text-engage-blue hover:text-engage-yellow">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="font-medium text-engage-blue hover:text-engage-yellow">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginInnovador