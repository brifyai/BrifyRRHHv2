import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ children, fallback }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Si hay un error, mostrar el fallback
  if (fallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          {/* Icono de error */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Título y descripción */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops, algo salió mal
            </h1>
            <p className="text-gray-600">
              Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ir al inicio
            </button>
            
            <button
              onClick={handleReload}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Recargar página
            </button>
          </div>

          {/* Información de ayuda */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            <p className="mb-2">
              <strong>¿Qué puedes hacer?</strong>
            </p>
            <ul className="text-left space-y-1">
              <li>• Recargar la página</li>
              <li>• Verificar tu conexión a internet</li>
              <li>• Contactar soporte si el problema persiste</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay error, mostrar los hijos normalmente
  return children;
};

export default ErrorBoundary;