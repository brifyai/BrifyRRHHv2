import React from 'react';
import { Link } from 'react-router-dom';

const LandingInnovadora = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-engage-black via-engage-blue/10 to-engage-yellow/10">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="logo-container">
              <img 
                src="/images/Mesa-de-trabajo-105-1.png" 
                alt="Logo" 
                className="logo-image h-10 w-auto"
              />
            </div>
            <span className="ml-3 text-xl font-bold text-engage-black">EngageChile</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-engage-black hover:text-engage-blue transition-colors">Características</a>
            <a href="#services" className="text-engage-black hover:text-engage-blue transition-colors">Servicios</a>
            <a href="#testimonials" className="text-engage-black hover:text-engage-blue transition-colors">Testimonios</a>
            <a href="#contact" className="text-engage-black hover:text-engage-blue transition-colors">Contacto</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-engage-black hover:text-engage-blue transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn-primary">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-engage-black leading-tight">
                Transforma tu <span className="text-engage-blue">presencia</span> digital con <span className="text-engage-yellow">innovación</span>
              </h1>
              <p className="mt-6 text-lg text-gray-700 max-w-2xl">
                Soluciones tecnológicas de vanguardia que impulsan tu negocio hacia el futuro. 
                Diseño moderno, funcionalidad avanzada y resultados medibles.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="btn-primary px-8 py-4 text-lg">
                  Comenzar Ahora
                </Link>
                <a href="#features" className="btn-secondary px-8 py-4 text-lg">
                  Ver Características
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-full h-full bg-engage-yellow rounded-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-full h-full bg-engage-blue rounded-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border-4 border-engage-black">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-engage-blue/10 rounded-lg p-4">
                    <div className="h-32 bg-engage-blue/20 rounded flex items-center justify-center">
                      <span className="text-engage-blue font-bold">IA</span>
                    </div>
                  </div>
                  <div className="bg-engage-yellow/10 rounded-lg p-4">
                    <div className="h-32 bg-engage-yellow/20 rounded flex items-center justify-center">
                      <span className="text-engage-yellow font-bold">ANÁLISIS</span>
                    </div>
                  </div>
                  <div className="bg-engage-black/10 rounded-lg p-4">
                    <div className="h-32 bg-engage-black/20 rounded flex items-center justify-center">
                      <span className="text-engage-black font-bold">AUTOMATIZACIÓN</span>
                    </div>
                  </div>
                  <div className="bg-engage-blue/10 rounded-lg p-4">
                    <div className="h-32 bg-engage-blue/20 rounded flex items-center justify-center">
                      <span className="text-engage-blue font-bold">INTEGRACIÓN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-engage-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Características <span className="text-engage-yellow">Innovadoras</span>
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre nuestras soluciones únicas que transforman tu negocio
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-engage-blue/10 rounded-2xl p-8 border border-engage-blue/30 hover:border-engage-yellow transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-engage-blue flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="mt-6 text-2xl font-bold">Velocidad Extrema</h3>
              <p className="mt-4 text-gray-300">
                Procesamiento ultrarrápido con inteligencia artificial avanzada para resultados instantáneos.
              </p>
            </div>
            
            <div className="bg-engage-yellow/10 rounded-2xl p-8 border border-engage-yellow/30 hover:border-engage-blue transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-engage-yellow flex items-center justify-center">
                <svg className="w-8 h-8 text-engage-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="mt-6 text-2xl font-bold">Seguridad Total</h3>
              <p className="mt-4 text-gray-300">
                Protección de datos de nivel empresarial con encriptación avanzada y cumplimiento normativo.
              </p>
            </div>
            
            <div className="bg-engage-blue/10 rounded-2xl p-8 border border-engage-blue/30 hover:border-engage-yellow transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-engage-blue flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h3 className="mt-6 text-2xl font-bold">Experiencia Humana</h3>
              <p className="mt-4 text-gray-300">
                Interfaces intuitivas que combinan tecnología avanzada con una experiencia de usuario excepcional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-engage-black">
              Nuestros <span className="text-engage-blue">Servicios</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones personalizadas para cada necesidad de tu negocio
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-engage-blue/5 to-engage-yellow/5 rounded-2xl p-8 border border-engage-blue/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-engage-blue flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-engage-black">Análisis de Datos</h3>
                  <p className="mt-4 text-gray-600">
                    Transformamos tus datos en insights accionables con inteligencia artificial avanzada. 
                    Descubre patrones ocultos y toma decisiones basadas en datos con precisión.
                  </p>
                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Visualización interactiva</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Predicciones precisas</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Informes personalizados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-engage-yellow/5 to-engage-blue/5 rounded-2xl p-8 border border-engage-yellow/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-engage-yellow flex items-center justify-center">
                    <svg className="w-6 h-6 text-engage-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-engage-black">Automatización Inteligente</h3>
                  <p className="mt-4 text-gray-600">
                    Libera a tu equipo de tareas repetitivas con flujos de trabajo automatizados. 
                    Aumenta la productividad y reduce errores con nuestra tecnología de vanguardia.
                  </p>
                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-yellow mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Flujos de trabajo personalizados</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-yellow mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Integración con múltiples plataformas</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-engage-yellow mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Monitoreo en tiempo real</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-engage-black to-engage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            ¿Listo para <span className="text-engage-yellow">transformar</span> tu negocio?
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Únete a cientos de empresas que ya están experimentando el poder de nuestra tecnología innovadora.
          </p>
          <div className="mt-10">
            <Link to="/register" className="btn-yellow px-8 py-4 text-lg font-bold">
              Comenzar Ahora
            </Link>
            <a href="#contact" className="ml-4 btn-black px-8 py-4 text-lg font-bold">
              Solicitar Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-engage-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="logo-container">
                  <img 
                    src="/images/Mesa-de-trabajo-105-1.png" 
                    alt="Logo" 
                    className="logo-image h-8 w-auto"
                  />
                </div>
                <span className="ml-2 text-lg font-bold">EngageChile</span>
              </div>
              <p className="mt-4 text-gray-400">
                Innovación tecnológica para un futuro mejor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Productos</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Análisis de Datos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Automatización</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Integraciones</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recursos</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Documentación</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Tutoriales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Empresa</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Acerca de</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Carreras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Contacto</a></li>
                <li><a href="#" className="text-gray-400 hover:text-engage-yellow">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 EngageChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingInnovadora;