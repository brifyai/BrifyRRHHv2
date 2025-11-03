import React from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler.js';
import ErrorBoundary from '../common/ErrorBoundary.js';

/**
 * Higher-Order Component que añade manejo de errores a un componente
 * @param {React.Component} WrappedComponent - Componente a envolver
 * @param {Object} options - Opciones de configuración
 * @returns {React.Component} Componente envuelto con manejo de errores
 */
const withErrorHandling = (WrappedComponent, options = {}) => {
  const {
    errorBoundaryOptions = {},
    errorHandlerOptions = {},
    showErrorNotifications = true,
    fallbackComponent = null
  } = options;

  // Componente envoltorio con manejo de errores
  const WithErrorHandlingComponent = (props) => {
    const errorHandlerHook = useErrorHandler({
      enableNotifications: showErrorNotifications,
      ...errorHandlerOptions
    });

    // Manejador de errores para el ErrorBoundary
    const handleError = (error, errorInfo, errorId) => {
      errorHandlerHook.handleError(error, {
        component: WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent',
        errorInfo,
        errorId,
        ...props
      });
    };

    // Renderizar componente con manejo de errores
    return (
      <ErrorBoundary
        onError={handleError}
        fallback={fallbackComponent}
        {...errorBoundaryOptions}
      >
        <WrappedComponent
          {...props}
          errorHandler={errorHandlerHook}
        />
      </ErrorBoundary>
    );
  };

  // Establecer displayName para mejor debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithErrorHandlingComponent.displayName = `withErrorHandling(${wrappedComponentName})`;

  return WithErrorHandlingComponent;
};

/**
 * HOC simplificado para manejo básico de errores
 */
const withSimpleErrorHandling = (WrappedComponent, options = {}) => {
  return withErrorHandling(WrappedComponent, {
    errorHandlerOptions: {
      enableNotifications: true,
      maxErrors: 3,
      autoHideDelay: 3000
    },
    errorBoundaryOptions: {
      fallback: (error, errorInfo, errorId) => (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#dc3545',
          border: '1px solid #dc3545',
          borderRadius: '4px',
          backgroundColor: '#f8d7da'
        }}>
          <h4>⚠️ Error en {WrappedComponent.displayName || WrappedComponent.name}</h4>
          <p>{error?.message || 'Ha ocurrido un error inesperado'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recargar
          </button>
        </div>
      )
    },
    ...options
  });
};

/**
 * HOC para componentes asíncronos con manejo de errores
 */
const withAsyncErrorHandling = (WrappedComponent, options = {}) => {
  const {
    loadingComponent = null,
    errorComponent = null,
    retryFunction = null
  } = options;

  return withErrorHandling(
    (props) => {
      const { errorHandler } = props;
      const [isLoading, setIsLoading] = React.useState(false);
      const [asyncError, setAsyncError] = React.useState(null);

      // Función para ejecutar operaciones asíncronas con manejo de errores
      const executeAsync = React.useCallback(async (asyncFn, context = {}) => {
        setIsLoading(true);
        setAsyncError(null);
        
        try {
          const result = await errorHandler.handleAsyncError(asyncFn, {
            operation: 'async_operation',
            ...context
          });
          setIsLoading(false);
          return result;
        } catch (error) {
          setAsyncError(error);
          setIsLoading(false);
          throw error;
        }
      }, [errorHandler]);

      // Función de reintentar
      const handleRetry = React.useCallback(async () => {
        if (retryFunction) {
          try {
            await executeAsync(retryFunction, { operation: 'retry' });
          } catch (error) {
            // El error ya fue manejado por executeAsync
          }
        }
      }, [executeAsync, retryFunction]);

      // Mostrar componente de carga
      if (isLoading && loadingComponent) {
        return loadingComponent;
      }

      // Mostrar componente de error asíncrono
      if (asyncError && errorComponent) {
        return errorComponent({
          error: asyncError,
          onRetry: retryFunction ? handleRetry : null
        });
      }

      // Renderizar componente original con props adicionales
      return (
        <WrappedComponent
          {...props}
          executeAsync={executeAsync}
          isAsyncLoading={isLoading}
          asyncError={asyncError}
          onRetry={handleRetry}
        />
      );
    },
    options
  );
};

/**
 * HOC para componentes de formulario con validación y manejo de errores
 */
const withFormErrorHandling = (WrappedComponent, options = {}) => {
  const {
    validationSchema = null,
    onSubmit = null,
    resetOnSubmit = true
  } = options;

  return withErrorHandling(
    (props) => {
      const { errorHandler } = props;
      const [formErrors, setFormErrors] = React.useState({});
      const [isSubmitting, setIsSubmitting] = React.useState(false);

      // Validar formulario
      const validateForm = React.useCallback((data) => {
        if (!validationSchema) {
          return {};
        }

        try {
          const errors = validationSchema.validateSync(data, { 
            abortEarly: false 
          });
          return {};
        } catch (validationError) {
          if (validationError.inner) {
            const errors = {};
            validationError.inner.forEach(error => {
              errors[error.path] = error.message;
            });
            return errors;
          }
          return { _form: validationError.message };
        }
      }, [validationSchema]);

      // Manejar envío de formulario
      const handleFormSubmit = React.useCallback(async (data) => {
        // Validar datos
        const validationErrors = validateForm(data);
        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          errorHandler.handleError(new Error('Error de validación'), {
            type: 'VALIDATION',
            context: { validationErrors }
          });
          return;
        }

        setIsSubmitting(true);
        setFormErrors({});

        try {
          await errorHandler.handleAsyncError(async () => {
            if (onSubmit) {
              return await onSubmit(data);
            }
            throw new Error('No se definió función onSubmit');
          }, {
            operation: 'form_submit',
            formData: data
          });

          if (resetOnSubmit) {
            setFormErrors({});
          }
        } catch (error) {
          // El error ya fue manejado por el errorHandler
        } finally {
          setIsSubmitting(false);
        }
      }, [validateForm, errorHandler, onSubmit, resetOnSubmit]);

      // Limpiar error específico
      const clearFieldError = React.useCallback((fieldName) => {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }, []);

      // Limpiar todos los errores
      const clearFormErrors = React.useCallback(() => {
        setFormErrors({});
      }, []);

      return (
        <WrappedComponent
          {...props}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          onFormSubmit={handleFormSubmit}
          clearFieldError={clearFieldError}
          clearFormErrors={clearFormErrors}
          validateForm={validateForm}
        />
      );
    },
    {
      errorHandlerOptions: {
        enableNotifications: true
      },
      ...options
    }
  );
};

export default withErrorHandling;
export { withSimpleErrorHandling, withAsyncErrorHandling, withFormErrorHandling };