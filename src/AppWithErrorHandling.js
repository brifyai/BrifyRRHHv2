import React, { useEffect } from 'react';
import { initializeErrorHandling, AppErrorUtils } from './config/errorHandlingConfig.js';
import ErrorBoundary from './components/common/ErrorBoundary.js';
import ErrorNotifications from './components/common/ErrorNotifications.js';
import { withErrorHandling } from './components/hoc/WithErrorHandling.js';

// Importar el componente App original
import App from './App.js';

/**
 * Componente App con manejo de errores integrado
 */
const AppWithErrorHandling = () => {
  // Inicializar el sistema de manejo de errores al montar la aplicación
  useEffect(() => {
    const isInitialized = initializeErrorHandling();
    
    if (!isInitialized) {
      console.error('No se pudo inicializar el sistema de manejo de errores');
    }

    // Loggear inicio de la aplicación
    console.log('🚀 Aplicación iniciada con sistema de manejo de errores');
    
    return () => {
      console.log('🔄 Aplicación deteniéndose');
    };
  }, []);

  // Manejar errores globales no capturados
  useEffect(() => {
    const handleUnhandledError = (event) => {
      AppErrorUtils.handleApiError(event.error || new Error(event.message), {
        component: 'AppWithErrorHandling',
        source: 'unhandled_error'
      });
    };

    const handleUnhandledRejection = (event) => {
      AppErrorUtils.handleApiError(event.reason || new Error('Promise rechazada'), {
        component: 'AppWithErrorHandling',
        source: 'unhandled_rejection'
      });
    };

    // Suscribir a eventos globales
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary
      fallback={(error, errorInfo, errorId) => (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>⚠️ Error Crítico de la Aplicación</h1>
          <p>La aplicación ha encontrado un error crítico y no puede continuar.</p>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            <h3>Detalles del Error:</h3>
            <p><strong>ID:</strong> {errorId}</p>
            <p><strong>Mensaje:</strong> {error?.message || 'Error desconocido'}</p>
            <p><strong>Tipo:</strong> {error?.type || 'SYSTEM'}</p>
            <p><strong>Severidad:</strong> {error?.severity || 'CRITICAL'}</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Recargar Aplicación
            </button>
            
            <button
              onClick={() => {
                // Intentar limpiar y recargar
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Limpiar y Recargar
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', maxWidth: '800px' }}>
              <summary>Información de Depuración</summary>
              <pre style={{
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                textAlign: 'left',
                marginTop: '10px'
              }}>
                {JSON.stringify({ error, errorInfo }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    >
      {/* Componente de notificaciones de errores */}
      <ErrorNotifications position="top-right" maxVisible={5} />
      
      {/* Aplicación original envuelta con manejo de errores */}
      <AppWithEnhancedErrorHandling />
    </ErrorBoundary>
  );
};

/**
 * Componente App envuelto con manejo de errores mejorado
 */
const AppWithEnhancedErrorHandling = withErrorHandling(App, {
  errorHandlerOptions: {
    enableNotifications: true,
    maxErrors: 20,
    autoHideDelay: 5000
  },
  errorBoundaryOptions: {
    fallback: (error, errorInfo, errorId) => (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>⚠️ Error en la Aplicación</h3>
        <p>Ha ocurrido un error inesperado. La aplicación continuará funcionando, pero algunas funcionalidades pueden verse afectadas.</p>
        <p><strong>ID del Error:</strong> {errorId}</p>
        <p><strong>Mensaje:</strong> {error?.message || 'Error desconocido'}</p>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Recargar Página
        </button>
      </div>
    )
  }
});

export default AppWithErrorHandling;

/**
 * Hook personalizado para manejo de errores en componentes de la aplicación
 */
export const useAppErrorHandler = () => {
  const handleNetworkError = (error, context = {}) => {
    return AppErrorUtils.createNetworkError(error.message, {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  const handleDatabaseError = (error, context = {}) => {
    return AppErrorUtils.createDatabaseError(error.message, {
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  const handleAuthError = (error, context = {}) => {
    return AppErrorUtils.createAuthError(error.message, {
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  const handleValidationError = (error, context = {}) => {
    return AppErrorUtils.createValidationError(error.message, {
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  const handleBusinessError = (error, context = {}) => {
    return AppErrorUtils.createBusinessError(error.message, {
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  const handleApiError = (error, context = {}) => {
    return AppErrorUtils.handleApiError(error, {
      ...context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  };

  return {
    handleNetworkError,
    handleDatabaseError,
    handleAuthError,
    handleValidationError,
    handleBusinessError,
    handleApiError
  };
};

/**
 * Componente de ejemplo que muestra cómo usar el manejo de errores
 */
export const ExampleWithErrorHandling = () => {
  const { handleNetworkError, handleValidationError } = useAppErrorHandler();

  const simulateNetworkError = () => {
    const error = new Error('Error de conexión al servidor');
    handleNetworkError(error, {
      component: 'ExampleWithErrorHandling',
      operation: 'simulateNetworkError'
    });
  };

  const simulateValidationError = () => {
    const error = new Error('El campo email es requerido');
    handleValidationError(error, {
      component: 'ExampleWithErrorHandling',
      operation: 'simulateValidationError',
      field: 'email'
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Ejemplo de Manejo de Errores</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={simulateNetworkError}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Simular Error de Red
        </button>
        
        <button
          onClick={simulateValidationError}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Simular Error de Validación
        </button>
      </div>
      
      <p>
        Haz clic en los botones para ver cómo el sistema de manejo de errores 
        muestra notificaciones y registra los errores de manera centralizada.
      </p>
    </div>
  );
};