import React from 'react';
import errorHandler from '../../lib/errorHandler.js';
import logger from '../../lib/logger.js';

/**
 * Componente Error Boundary para capturar errores en React
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error, errorInfo) {
    // Generar ID único para el error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Manejar el error con el sistema centralizado
    const structuredError = errorHandler.handleError(error, {
      component: 'ErrorBoundary',
      errorInfo,
      errorId,
      stack: error.stack
    });

    return { 
      hasError: true, 
      error: structuredError, 
      errorInfo,
      errorId
    };
  }

  componentDidCatch(error, errorInfo) {
    // Loggear el error
    logger.error('Error capturado por ErrorBoundary', {
      error: error.message,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      errorInfo
    });

    // Notificar al componente padre si existe la prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderizar UI de error personalizada
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.state.errorId);
      }

      // UI de error por defecto
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          textAlign: 'center'
        }}>
          <h2>⚠️ Ha ocurrido un error inesperado</h2>
          <p><strong>Error ID:</strong> {this.state.errorId}</p>
          <p><strong>Mensaje:</strong> {this.state.error?.message || 'Error desconocido'}</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Detalles técnicos (solo desarrollo)</summary>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {this.state.error?.stack || 'No hay stack trace disponible'}
              </pre>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {this.state.errorInfo?.componentStack || 'No hay component stack disponible'}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;