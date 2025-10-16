import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const HomeModernFixed = () => {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      if (!result.error) {
        toast.success('¡Bienvenido a BrifyRRHH!');
        navigate('/panel-principal');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '👥',
      title: 'Gestión de Empleados',
      description: 'Administra tu equipo de forma eficiente con herramientas modernas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '📊',
      title: 'Análisis de Datos',
      description: 'Visualiza métricas clave y toma decisiones basadas en datos',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💬',
      title: 'Comunicación Interna',
      description: 'Mantén a tu equipo conectado y colaborando en tiempo real',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🤖',
      title: 'IA Integrada',
      description: 'Automatiza procesos con inteligencia artificial avanzada',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '🔐',
      title: 'Seguridad Total',
      description: 'Protección de datos de nivel empresarial',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '📱',
      title: 'Acceso Móvil',
      description: 'Gestiona tu RRHH desde cualquier dispositivo',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      position: 'HR Manager',
      company: 'TechCorp',
      image: '👩‍💼',
      comment: 'BrifyRRHH transformó completamente nuestra gestión de talento. El ahorro de tiempo es increíble.'
    },
    {
      name: 'Carlos Rodríguez',
      position: 'CEO',
      company: 'StartupX',
      image: '👨‍💼',
      comment: 'La interfaz es intuitiva y las herramientas de análisis nos han ayudado a tomar mejores decisiones.'
    },
    {
      name: 'Ana Martínez',
      position: 'Directora de RRHH',
      company: 'InnovaLab',
      image: '👩‍💻',
      comment: 'La integración con nuestras herramientas existentes fue perfecta. ¡Recomendado 100%!'
    }
  ];

  // Si está autenticado, redirigir en lugar de devolver null
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al panel principal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Navegación */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BrifyRRHH
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Características
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Testimonios
              </a>
              <button 
                onClick={() => setActiveTab('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
              >
                Registrarse
              </button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button className="text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                🚀 La nueva era de la gestión RRHH
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transforma tu gestión de{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recursos Humanos
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Potencia tu equipo con herramientas inteligentes, análisis de datos avanzados y una experiencia de usuario excepcional. Todo en una plataforma.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setActiveTab('register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Comenzar Gratis
                </button>
                <button className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                  <Link to="/landing-prueba">Ver Demo</Link>
                </button>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600">Empresas confían</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600">Empleados gestionados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Auth Forms */}
                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Bienvenido de vuelta</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>

                    <div className="text-center">
                      <span className="text-gray-600">¿No tienes cuenta? </span>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Regístrate gratis
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Crea tu cuenta</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu nombre"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                      <Link to="/register">Crear Cuenta Gratis</Link>
                    </button>

                    <div className="text-center">
                      <span className="text-gray-600">¿Ya tienes cuenta? </span>
                      <button 
                        onClick={() => setActiveTab('login')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Inicia sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                gestionar tu equipo
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas potentes diseñadas para modernizar tu departamento de RRHH
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                clientes
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas como la tuya ya están transformando su gestión de RRHH
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.position}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu gestión de RRHH?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a cientos de empresas que ya están optimizando sus procesos con BrifyRRHH
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setActiveTab('register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Comenzar Gratis
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Solicitar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-xl font-bold">BrifyRRHH</span>
              </div>
              <p className="text-gray-400">
                La plataforma moderna para la gestión de recursos humanos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 BrifyRRHH. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeModernFixed;