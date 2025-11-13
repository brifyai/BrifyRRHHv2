import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

const SelectorInicio = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, lo redirigimos al dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/panel-principal');
    }
  }, [isAuthenticated, navigate]);

  // Si el usuario está autenticado, no mostramos el selector
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-engage-black via-engage-blue/10 to-engage-yellow/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Sección izquierda - Diseño innovador */}
          <div className="md:w-1/2 bg-gradient-to-br from-engage-blue to-engage-black p-8 text-white">
            <div className="h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Diseño Innovador</h2>
              <p className="mb-6 text-gray-200">
                Experimenta nuestra nueva interfaz con colores vibrantes y un diseño moderno 
                que refleja la identidad de engagechile.cl.
              </p>
              <Link 
                to="/landing-prueba" 
                className="btn-yellow inline-block text-center py-3 px-6 rounded-lg font-bold hover:bg-engage-black hover:text-engage-yellow transition-colors"
              >
                Ver Diseño Innovador
              </Link>
            </div>
          </div>
          
          {/* Sección derecha - Diseño clásico */}
          <div className="md:w-1/2 p-8">
            <div className="h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-engage-black mb-4">Diseño Clásico</h2>
              <p className="mb-6 text-gray-600">
                Accede a la interfaz tradicional de la aplicación con la que ya estás familiarizado.
              </p>
              <Link 
                to="/login" 
                className="btn-primary inline-block text-center py-3 px-6 rounded-lg font-bold"
              >
                Acceder al Diseño Clásico
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer con información */}
        <div className="bg-gray-50 p-6 text-center border-t">
          <p className="text-gray-600">
            ¿No tienes una cuenta? <Link to="/register" className="text-engage-blue hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectorInicio;