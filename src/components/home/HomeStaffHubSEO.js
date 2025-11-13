import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { toast } from 'react-hot-toast';

const HomeStaffHubSEO = () => {
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
      {/* Sección de SEO y Metadatos */}
      <div className="hidden">
        <h1>StaffHub - Plataforma de Comunicación Interna para Empresas</h1>
        <h2>Automatiza la comunicación con tus trabajadores. Carga masiva de documentos, comunicación multicanal y asistente de IA.</h2>
        <p>StaffHub es la solución definitiva para agencias de comunicación interna y empresas con miles de trabajadores. Simplifica la gestión de comunicaciones masivas con IA personalizada y carga automatizada de documentos. Mejora la productividad y la satisfacción de los trabajadores con nuestra plataforma integral.</p>
        <p>comunicación interna, carga masiva, automatización, IA, WhatsApp, email, SMS, gestión de trabajadores, base de conocimiento, comunicación corporativa, productividad empresarial, plataforma de RRHH</p>
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
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium">
                  Somos
                </a>
                <a href="#solution" className="text-gray-600 hover:text-blue-600 font-medium">
                  Solución
                </a>
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium">
                  Características
                </a>
                <a href="#benefits" className="text-gray-600 hover:text-blue-600 font-medium">
                  Beneficios
                </a>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Iniciar Sesión
                </Link>
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
              <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Somos
              </a>
              <a href="#solution" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Solución
              </a>
              <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Características
              </a>
              <a href="#benefits" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                Beneficios
              </a>
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
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

      {/* Hero Section - StaffHub Focus */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Solución para agencias de comunicación interna
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  <span className="block">Simplifica la comunicación</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                    a miles de trabajadores
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  La plataforma que permite a agencias y empresas gestionar comunicaciones masivas con IA personalizada y carga automatizada de documentos.
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
                            aria-label="Nombre completo"
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
                            aria-label="Correo electrónico"
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
                            aria-label="Contraseña"
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

      {/* About Section - Somos - Rediseño Moderno */}
      <section id="about" className="py-12 bg-white relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg mb-8">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-gray-700 font-medium">Conoce nuestra historia</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Somos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">StaffHub</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La plataforma que revoluciona la comunicación interna de las empresas modernas con tecnología de vanguardia y resultados comprobados
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Right Column - Why Choose Us & CTA */}
            <div className="lg:col-span-12 space-y-8">
              {/* Why Choose Us Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-white/50 backdrop-blur-sm">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">¿Por qué elegir StaffHub?</h3>
                  <p className="text-gray-600">Descubre lo que nos hace diferentes</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Tecnología de Vanguardia</h4>
                      <p className="text-gray-600 leading-relaxed">IA avanzada y automatización inteligente para resultados excepcionales que superan las expectativas.</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Escalabilidad Total</h4>
                      <p className="text-gray-600 leading-relaxed">Desde 10 hasta 100.000 trabajadores, crecemos con tu empresa sin comprometer el rendimiento.</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Soporte Especializado</h4>
                      <p className="text-gray-600 leading-relaxed">Equipo dedicado de expertos para garantizar tu éxito en cada paso del camino.</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Resultados Comprobados</h4>
                      <p className="text-gray-600 leading-relaxed">Más de 500 empresas ya transformaron su comunicación interna con resultados medibles.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
                <div className="relative">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-3">¿Listo para transformar tu comunicación?</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Únete a las empresas que ya revolucionaron su comunicación interna con StaffHub.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setActiveTab('register')}
                      className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      🚀 Comenzar Ahora
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300">
                      <Link to="/landing-prueba" className="flex items-center justify-center">
                        🎬 Ver Demo
                      </Link>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Solution Section */}
      <section id="solution" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              La solución para comunicaciones internas a gran escala
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Simplifica la gestión de comunicaciones a miles de trabajadores con tecnología inteligente
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  El desafío actual
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold">1</span>
                    </div>
                    <p className="text-gray-700">
                      <span className="font-semibold">Carga manual de documentos:</span> Subir archivos individuales para cada empleado consume horas de trabajo.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold">2</span>
                    </div>
                    <p className="text-gray-700">
                      <span className="font-semibold">Comunicación sin personalización:</span> Los mensajes masivos no llegan al punto correcto.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold">3</span>
                    </div>
                    <p className="text-gray-700">
                      <span className="font-semibold">Gestión de preguntas manual:</span> Responder a cientos de trabajadores consume tiempo valioso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <svg className="h-6 w-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  La solución StaffHub
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <p>
                      <span className="font-semibold">Carga automatizada:</span> Arrastra un archivo y se distribuye a miles de trabajadores en segundos.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <p>
                      <span className="font-semibold">Comunicación personalizada:</span> Envía mensajes segmentados por cargo, región, sucursal o contrato.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <p>
                      <span className="font-semibold">Asistente de IA:</span> Respuestas automáticas basadas en la base de conocimiento de cada empleado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center">Visualización del impacto</h3>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Tiempo de carga de documentos</span>
                    <span className="font-bold text-lg">90% ↓</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full" style={{width: '90%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Antes: 8 horas</span>
                    <span>Ahora: 48 minutos</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Alcance de trabajadores</span>
                    <span className="font-bold text-lg">20x ↑</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Antes: 500 trabajadores</span>
                    <span>Ahora: 10,000 trabajadores</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Satisfacción de trabajadores</span>
                    <span className="font-bold text-lg">85% ↑</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Antes: 45%</span>
                    <span>Ahora: 83%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                  <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">Resultados comprobados en tiempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - StaffHub Capabilities */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Características que transforman la comunicación interna
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas diseñadas específicamente para agencias y empresas con miles de trabajadores
            </p>
          </div>

          {/* Feature Highlights with Icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Carga Masiva</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Multicanal</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">IA Personalizada</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Base de Datos</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Reuniones</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <svg className="h-8 w-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Filtros</h3>
            </div>
          </div>

          {/* Redesigned Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-blue-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Carga Masiva Automatizada</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Arrastra un archivo y se distribuye automáticamente a las carpetas de miles de trabajadores. Sin necesidad de subir documentos uno por uno.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Velocidad</span>
                  <span className="font-bold text-lg">1000x más rápido</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '95%'}}></div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-green-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Comunicación Multicanal</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Envía mensajes masivos por WhatsApp, SMS, email o Telegram con personalización avanzada según perfiles de trabajadores.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Canales disponibles</span>
                  <span className="font-bold text-lg">4+</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-purple-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Asistente de IA Personalizado</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Cada empleado tiene su propia base de conocimiento. La IA responde preguntas automáticamente basándose en la información específica de cada perfil.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-purple-500 to-fuchsia-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Precisión</span>
                  <span className="font-bold text-lg">94%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '94%'}}></div>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-amber-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-amber-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Base de Conocimiento por Empleado</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Cada empleado tiene su propia carpeta con información personalizada: reglamentos, beneficios, políticas, vacaciones, etc.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Personalización</span>
                  <span className="font-bold text-lg">100%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-rose-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-rose-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Integración de Reuniones</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Incluye links de video llamadas y agenda reuniones directamente en los mensajes enviados por cualquier canal.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Plataformas</span>
                  <span className="font-bold text-lg">3+</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-t-2xl p-6 group-hover:bg-transparent transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-cyan-100 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg className="h-8 w-8 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">Filtros Avanzados</h3>
                <p className="text-gray-600 mb-6 group-hover:text-white/90 transition-colors duration-300">
                  Segmenta tus comunicaciones por múltiples criterios: cargo, departamento, región, antigüedad, tipo de contrato y más.
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Criterios de filtro</span>
                  <span className="font-bold text-lg">10+</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Value for Agencies */}
      <section id="benefits" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Beneficios que transforman tu agencia
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              Resultados tangibles para agencias de comunicación interna y empresas con fuerza laboral grande
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">90%</div>
              <div className="text-blue-100">Reducción de tiempo</div>
              <div className="text-sm text-blue-200 mt-2">En carga de documentos</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Empleados gestionados</div>
              <div className="text-sm text-blue-200 mt-2">Por agente de comunicación</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Soporte automatizado</div>
              <div className="text-sm text-blue-200 mt-2">Respuestas instantáneas</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-100">Mejora en satisfacción</div>
              <div className="text-sm text-blue-200 mt-2">De trabajadores</div>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <blockquote className="text-xl text-center">
              <p className="mb-4">
                "StaffHub nos permitió escalar nuestra operación de 500 a 5000 trabajadores sin aumentar nuestro equipo de comunicación. La automatización de documentos y el asistente de IA han sido game changers para nuestra agencia."
              </p>
              <footer className="text-blue-100">
                <div className="font-bold">Carlos Ramírez</div>
                <div className="text-sm">Director de Comunicaciones, Agencia ComCorp</div>
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
              Transforma la comunicación de tu agencia hoy
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Únete a las agencias que ya están simplificando la gestión de miles de trabajadores con StaffHub
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

export default HomeStaffHubSEO;