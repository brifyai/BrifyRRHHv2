import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

const LoginRedesigned = () => {
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
        navigate('/panel-principal')
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      toast.error('Error al iniciar sesión. Por favor, verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* SEO Section */}
      <div className="hidden">
        <h1>StaffHub - Iniciar Sesión</h1>
        <h2>Accede a tu cuenta de StaffHub para gestionar la comunicación interna de tu empresa</h2>
        <p>Inicia sesión en StaffHub, la plataforma de comunicación interna para empresas. Gestiona empleados, automatiza comunicaciones y mejora la productividad con nuestra solución integral.</p>
        <p>iniciar sesión, cuenta, comunicación interna, gestión de empleados, plataforma empresarial, StaffHub</p>
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">StaffHub</span>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
                  Inicio
                </Link>
                <Link to="/#solution" className="text-gray-600 hover:text-blue-600 font-medium">
                  Solución
                </Link>
                <Link to="/#features" className="text-gray-600 hover:text-blue-600 font-medium">
                  Características
                </Link>
                <Link to="/#benefits" className="text-gray-600 hover:text-blue-600 font-medium">
                  Beneficios
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Acceso seguro
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  <span className="block">Bienvenido de</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                    vuelta a StaffHub
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  Accede a tu cuenta para continuar gestionando la comunicación interna de tu empresa.
                </p>
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
                    <p className="mt-2 text-gray-600">Accede a tu cuenta</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="tu@email.com"
                          required
                          aria-label="Correo electrónico"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                          </label>
                          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="••••••••"
                          required
                          aria-label="Contraseña"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Recordarme
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Iniciando...
                        </span>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      ¿No tienes cuenta?{' '}
                      <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Regístrate gratis
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-bold">StaffHub</span>
              </Link>
              <p className="mt-4 text-gray-400">
                La plataforma definitiva para la gestión moderna de recursos humanos.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Producto</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/#features" className="text-base text-gray-300 hover:text-white">Características</Link></li>
                <li><button className="text-base text-gray-300 hover:text-white">Precios</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">API</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Integraciones</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Empresa</h3>
              <ul className="mt-4 space-y-4">
                <li><button className="text-base text-gray-300 hover:text-white">Sobre nosotros</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Blog</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Carreras</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Contacto</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><button className="text-base text-gray-300 hover:text-white">Privacidad</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Términos</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Seguridad</button></li>
                <li><button className="text-base text-gray-300 hover:text-white">Compliance</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 StaffHub. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LoginRedesigned