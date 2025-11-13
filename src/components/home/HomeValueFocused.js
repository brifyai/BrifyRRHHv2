import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { toast } from 'react-hot-toast';

const HomeValueFocused = () => {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Redirección automática para usuarios autenticados
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/panel-principal');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (!result.error) {
        toast.success('¡Bienvenido a StaffHub!');
        navigate('/panel-principal');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Redirigiendo al dashboard...</p>
          <div className="text-sm text-gray-500">Serás redirigido automáticamente</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">StaffHub</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#benefits" className="text-gray-600 hover:text-blue-600 font-medium">
                  Beneficios
                </a>
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium">
                  Características
                </a>
                <a href="#results" className="text-gray-600 hover:text-blue-600 font-medium">
                  Resultados
                </a>
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Comenzar
                </button>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#benefits" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Beneficios
              </a>
              <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Características
              </a>
              <a href="#results" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Resultados
              </a>
              <button
                onClick={() => {
                  setActiveTab('login');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Comenzar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Value Focused */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  <span className="block">Transforma la gestión</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                    de tus 800 empleados
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  La plataforma todo-en-uno que revoluciona la comunicación interna con inteligencia artificial avanzada y resultados medibles.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => setActiveTab('register')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Comenzar prueba gratuita
                  </button>
                  <button className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    <Link to="/landing-prueba" className="flex items-center justify-center">
                      Ver demo
                      <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="max-w-md mx-auto">
                  {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h2>
                        <p className="mt-2 text-gray-600">Ingresa a tu cuenta</p>
                      </div>
                      
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
                      
                      <div className="text-center">
                        <p className="text-gray-600">
                          ¿No tienes cuenta?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Regístrate gratis
                          </button>
                        </p>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
                        <p className="mt-2 text-gray-600">Comienza tu prueba gratuita</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo
                          </label>
                          <input
                            id="full-name"
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Tu nombre"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            id="register-email"
                            type="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                          </label>
                          <input
                            id="register-password"
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300">
                        <Link to="/register">Crear cuenta gratis</Link>
                      </button>
                      
                      <div className="text-center">
                        <p className="text-gray-600">
                          ¿Ya tienes cuenta?{' '}
                          <button
                            onClick={() => setActiveTab('login')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Inicia sesión
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Value Proposition */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Beneficios que impulsan tu negocio
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones concretas para los desafíos de gestión de equipos grandes
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">45% más de engagement</h3>
              <p className="text-gray-700">
                Nuestra IA predictiva optimiza la comunicación para cada empleado, aumentando la participación y conexión con la empresa.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">60% menos de tiempo en comunicación</h3>
              <p className="text-gray-700">
                Automatización inteligente y flujos optimizados reducen el tiempo dedicado a la comunicación interna.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">250% ROI en 12 meses</h3>
              <p className="text-gray-700">
                Reducción de costos operativos y aumento de productividad generan un retorno de inversión excepcional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section - System Strengths */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tecnología avanzada para 800+ empleados
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Características diseñadas específicamente para la escala y complejidad de tu organización
            </p>
          </div>

          <div className="space-y-16">
            {/* AI Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    Inteligencia Artificial
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Chatbot Empresarial 24/7</h3>
                  <p className="text-gray-700 mb-6">
                    Asistente virtual especializado en RRHH que responde preguntas frecuentes, facilita procesos de onboarding y guía a empleados en tiempo real.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Respuestas instantáneas a 500+ preguntas comunes</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Integración con base de conocimiento existente</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Soporte multilingüe para equipos diversos</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Precisión de respuestas</span>
                      <span className="font-bold">94%</span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Tiempo de respuesta</span>
                      <span className="font-bold">{'<'}2 segundos</span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Satisfacción de usuarios</span>
                      <span className="font-bold">4.8/5</span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{width: '96%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Channel Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-sm">Canales de comunicación</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-sm">Tasa de entrega</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm">Disponibilidad</div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">15h</div>
                      <div className="text-sm">Ahorro semanal</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    Comunicación Multicanal
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Comunicación donde tus empleados están</h3>
                  <p className="text-gray-700 mb-6">
                    Integra WhatsApp, Telegram, Email, Microsoft Teams y SMS en una sola plataforma unificada.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mensajería programada y plantillas inteligentes</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Análisis de sentimiento en tiempo real</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Personalización por canal preferido de cada empleado</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                    Analíticas Avanzadas
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Ejecutivo en Tiempo Real</h3>
                  <p className="text-gray-700 mb-6">
                    Métricas completas que muestran el impacto real de tu comunicación interna en la productividad y el clima laboral.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Índice compuesto de engagement</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Predicción de rotación basada en patrones</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>ROI de campañas internas medible</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">+35%</div>
                      <div className="text-sm">Productividad</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">-20%</div>
                      <div className="text-sm">Rotación</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">96%</div>
                      <div className="text-sm">Satisfacción</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-white">
                      <div className="text-2xl font-bold">2.5x</div>
                      <div className="text-sm">Eficiencia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section - Real Impact */}
      <section id="results" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Resultados reales, medidos y comprobados
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              KPIs que demuestran el impacto tangible en tu organización
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">45%</div>
              <div className="text-blue-100">Aumento de engagement</div>
              <div className="text-sm text-blue-200 mt-2">En 6 meses</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-blue-100">Reducción de tiempo</div>
              <div className="text-sm text-blue-200 mt-2">En comunicación</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">250%</div>
              <div className="text-blue-100">ROI proyectado</div>
              <div className="text-sm text-blue-200 mt-2">En 12 meses</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">20%</div>
              <div className="text-blue-100">Mejora en retención</div>
              <div className="text-sm text-blue-200 mt-2">De empleados</div>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <blockquote className="text-xl text-center">
              <p className="mb-4">
                "StaffHub transformó completamente nuestra comunicación interna. Pasamos de horas semanales gestionando mensajes a una plataforma automatizada que nos ahorra 15 horas por semana y ha aumentado el engagement de nuestros 800 empleados en un 45%."
              </p>
              <footer className="text-blue-100">
                <div className="font-bold">María González</div>
                <div className="text-sm">Directora de RRHH, Empresa Fortune 500</div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
              Listo para transformar tu gestión de empleados?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Únete a las empresas que ya están revolucionando su comunicación interna con StaffHub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('register')}
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300"
              >
                Comenzar prueba gratuita
              </button>
              <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-all duration-300">
                Solicitar demo personalizado
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-bold">StaffHub</span>
              </div>
              <p className="mt-4 text-gray-400">
                La plataforma definitiva para la gestión moderna de recursos humanos.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Producto</h3>
              <ul className="mt-4 space-y-4">
                <li><button className="text-base text-gray-300 hover:text-white">Características</button></li>
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
  );
};

export default HomeValueFocused;