import { useState, useCallback, useEffect } from 'react';
import errorHandler from '../lib/errorHandler.js';
import logger from '../lib/logger.js';

/**
 * Hook personalizado para manejo de errores en componentes React
 */
export const useErrorHandler = (options = {}) => {
  const [errors, setErrors] = useState([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const {
    enableNotifications = true,
    enableLogging = true,
    maxErrors = 10,
    autoHideDelay = 5000,
    onError: customOnError,
    onResolved: customOnResolved
  } = options;

  // Suscribirse al sistema de errores al montar el componente
  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((error) => {
      if (enableNotifications) {
        addError(error);
      }
      
      if (enableLogging) {
        logger.error('Error notificado desde hook', {
          errorId: error.errorId,
          message: error.message,
          type: error.type,
          severity: error.severity
        });
      }

      if (customOnError) {
        customOnError(error);
      }
    });

    return unsubscribe;
  }, [enableNotifications, enableLogging, customOnError]);

  // Agregar error a la lista local
  const addError = useCallback((error) => {
    setErrors(prevErrors => {
      const newErrors = [...prevErrors, error];
      // Limitar número de errores
      return newErrors.slice(-maxErrors);
    });

    // Auto ocultar errores de baja severidad
    if (error.severity === 'LOW' && autoHideDelay > 0) {
      setTimeout(() => {
        removeError(error.errorId);
      }, autoHideDelay);
    }
  }, [maxErrors, autoHideDelay]);

  // Manejar error manualmente
  const handleError = useCallback((error, context = {}) => {
    const structuredError = errorHandler.handleError(error, {
      component: 'useErrorHandler',
      ...context
    });
    
    return structuredError;
  }, []);

  // Manejar error asíncrono
  const handleAsyncError = useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      const structuredError = handleError(error, context);
      throw structuredError;
    }
  }, [handleError]);

  // Remover error específico
  const removeError = useCallback((errorId) => {
    setErrors(prevErrors => prevErrors.filter(err => err.errorId !== errorId));
    
    if (customOnResolved) {
      customOnResolved(errorId);
    }
  }, [customOnResolved]);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Abrir/cerrar modal de errores
  const toggleErrorModal = useCallback(() => {
    setIsErrorModalOpen(prev => !prev);
  }, []);

  // Obtener errores por severidad
  const getErrorsBySeverity = useCallback((severity) => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  // Obtener errores por tipo
  const getErrorsByType = useCallback((type) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  // Contar errores por severidad
  const errorCounts = {
    total: errors.length,
    low: getErrorsBySeverity('LOW').length,
    medium: getErrorsBySeverity('MEDIUM').length,
    high: getErrorsBySeverity('HIGH').length,
    critical: getErrorsBySeverity('CRITICAL').length
  };

  return {
    // Estado
    errors,
    isErrorModalOpen,
    errorCounts,
    
    // Acciones
    handleError,
    handleAsyncError,
    removeError,
    clearErrors,
    toggleErrorModal,
    
    // Utilidades
    getErrorsBySeverity,
    getErrorsByType,
    
    // Métodos de conveniencia para tipos específicos
    handleNetworkError: useCallback((error, context) => 
      handleError(error, { ...context, type: 'NETWORK' }), [handleError]),
    
    handleDatabaseError: useCallback((error, context) => 
      handleError(error, { ...context, type: 'DATABASE' }), [handleError]),
    
    handleValidationError: useCallback((error, context) => 
      handleError(error, { ...context, type: 'VALIDATION' }), [handleError]),
    
    handleAuthError: useCallback((error, context) => 
      handleError(error, { ...context, type: 'AUTHENTICATION' }), [handleError])
  };
};

/**
 * Hook simplificado para manejo básico de errores
 */
export const useSimpleErrorHandler = () => {
  const [error, setError] = useState(null);
  
  const handleError = useCallback((error) => {
    const structuredError = errorHandler.handleError(error, {
      component: 'useSimpleErrorHandler'
    });
    
    setError(structuredError);
    logger.error('Error simple manejado', {
      errorId: structuredError.errorId,
      message: structuredError.message
    });
    
    return structuredError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
};

export default useErrorHandler;