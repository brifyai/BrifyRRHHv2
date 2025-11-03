import React, { Component } from 'react';

// Componente funcional para el contenido del error
const ErrorFallback = ({ error, resetError, goHome }) => {
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
          <p className="text-gray-600 mb-4">
            Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
          </p>
          
          {/* Detalles del error (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                Ver detalles del error
              </summary>
              <pre className="text-xs text-red-700 overflow-auto max-h-32">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={goHome}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir al inicio
          </button>
          
          <button
            onClick={resetError}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Intentar de nuevo
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full border border-gray-300 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
            <li>• Limpiar el caché del navegador</li>
            <li>• Contactar soporte si el problema persiste</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ErrorBoundary como Class Component
class ReactErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Opcional: Enviar error a un servicio de monitoreo
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  goHome = () => {
    this.resetError();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ReactErrorBoundary;