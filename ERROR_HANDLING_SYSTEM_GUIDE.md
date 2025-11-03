# Sistema Centralizado de Manejo de Errores y Logging

## Overview

Este documento describe el sistema centralizado de manejo de errores y logging implementado para mejorar la robustez, mantenibilidad y experiencia de usuario de la aplicación.

## Arquitectura del Sistema

### Componentes Principales

1. **Error Handler** (`src/lib/errorHandler.js`)
   - Manejo centralizado de errores
   - Clasificación por tipo y severidad
   - Sistema de suscripciones para notificaciones
   - Utilidades para manejo asíncrono y síncrono

2. **Logger** (`src/lib/logger.js`)
   - Sistema de logging estructurado
   - Múltiples niveles de log (DEBUG, INFO, WARN, ERROR, FATAL)
   - Transportes configurables (consola, memoria, servicios externos)
   - Métodos especializados para diferentes tipos de eventos

3. **Error Boundary** (`src/components/common/ErrorBoundary.js`)
   - Componente React para capturar errores en el árbol de componentes
   - UI personalizada para diferentes tipos de errores
   - Integración con el sistema centralizado

4. **Error Notifications** (`src/components/common/ErrorNotifications.js`)
   - Sistema de notificaciones visuales para errores
   - Configuración por severidad y tipo
   - Auto-ocultamiento y gestión de cola

5. **React Hooks** (`src/hooks/useErrorHandler.js`)
   - Hook personalizado para manejo de errores en componentes
   - Integración con el sistema centralizado
   - Utilidades para diferentes tipos de errores

6. **Higher-Order Components** (`src/components/hoc/WithErrorHandling.js`)
   - HOCs para envolver componentes con manejo de errores
   - Variantes para diferentes casos de uso (básico, asíncrono, formularios)

7. **Configuración** (`src/config/errorHandlingConfig.js`)
   - Configuración centralizada del sistema
   - Inicialización y setup global
   - Utilidades específicas de la aplicación

## Tipos de Errores

### 1. NETWORK
- **Descripción**: Errores de conexión, timeouts, fallos en API
- **Severidad**: HIGH
- **Auto-retry**: Sí
- **Ejemplo**: Fallo al conectar con el servidor

### 2. DATABASE
- **Descripción**: Errores en operaciones de base de datos
- **Severidad**: HIGH
- **Auto-retry**: Sí
- **Ejemplo**: Fallo en consulta SQL

### 3. AUTHENTICATION
- **Descripción**: Errores de autenticación y autorización
- **Severidad**: MEDIUM
- **Auto-retry**: No
- **Ejemplo**: Token expirado, permisos insuficientes

### 4. VALIDATION
- **Descripción**: Errores de validación de datos
- **Severidad**: LOW
- **Auto-retry**: No
- **Ejemplo**: Campo requerido faltante

### 5. BUSINESS_LOGIC
- **Descripción**: Errores en la lógica de negocio
- **Severidad**: MEDIUM
- **Auto-retry**: No
- **Ejemplo**: Regla de negocio violada

### 6. UI
- **Descripción**: Errores en la interfaz de usuario
- **Severidad**: LOW
- **Auto-retry**: No
- **Ejemplo**: Error en renderizado de componente

### 7. SYSTEM
- **Descripción**: Errores del sistema, críticos
- **Severidad**: CRITICAL
- **Auto-retry**: No
- **Ejemplo**: Error de JavaScript global

## Niveles de Severidad

### LOW
- **Color**: Azul claro (#17a2b8)
- **Auto-ocultar**: 3 segundos
- **Acción requerida**: No
- **Ejemplo**: Error de validación

### MEDIUM
- **Color**: Amarillo (#ffc107)
- **Auto-ocultar**: 5 segundos
- **Acción requerida**: Opcional
- **Ejemplo**: Error de autenticación

### HIGH
- **Color**: Naranja (#fd7e14)
- **Auto-ocultar**: No
- **Acción requerida**: Sí
- **Ejemplo**: Error de red

### CRITICAL
- **Color**: Rojo (#dc3545)
- **Auto-ocultar**: No
- **Acción requerida**: Inmediata
- **Ejemplo**: Error del sistema

## Implementación

### 1. Configuración Inicial

```javascript
import { initializeErrorHandling } from './config/errorHandlingConfig.js';

// En el punto de entrada de la aplicación
const isInitialized = initializeErrorHandling();
if (!isInitialized) {
  console.error('No se pudo inicializar el sistema de manejo de errores');
}
```

### 2. Uso en Componentes

#### Con Hook Personalizado

```javascript
import { useErrorHandler } from '../hooks/useErrorHandler.js';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  const handleClick = async () => {
    try {
      await handleAsyncError(async () => {
        // Operación asíncrona que puede fallar
        const result = await apiCall();
        return result;
      }, { component: 'MyComponent', operation: 'handleClick' });
    } catch (error) {
      // El error ya fue manejado por el sistema
    }
  };

  const handleSyncError = () => {
    handleError(new Error('Error síncrono'), {
      component: 'MyComponent',
      operation: 'handleSyncError'
    });
  };

  return <button onClick={handleClick}>Operación</button>;
}
```

#### Con Higher-Order Component

```javascript
import { withErrorHandling } from '../components/hoc/WithErrorHandling.js';

const MyComponent = ({ errorHandler }) => {
  // Componente original
  return <div>Contenido</div>;
};

export default withErrorHandling(MyComponent, {
  errorHandlerOptions: {
    enableNotifications: true,
    maxErrors: 10
  }
});
```

#### Con Error Boundary

```javascript
import ErrorBoundary from '../components/common/ErrorBoundary.js';

function App() {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, errorId) => (
        <div>Error: {error.message}</div>
      )}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### 3. Manejo de Errores Específicos

```javascript
import { AppErrorUtils } from '../config/errorHandlingConfig.js';

// Error de red
const networkError = AppErrorUtils.createNetworkError(
  'No se pudo conectar al servidor',
  { endpoint: '/api/users' }
);

// Error de validación
const validationError = AppErrorUtils.createValidationError(
  'El email es requerido',
  { field: 'email', value: '' }
);

// Error de API
try {
  const response = await fetch('/api/data');
} catch (error) {
  AppErrorUtils.handleApiError(error, {
    component: 'DataService',
    operation: 'fetchData'
  });
}
```

### 4. Logging

```javascript
import logger from '../lib/logger.js';

// Logs básicos
logger.debug('Información de depuración', { data: someData });
logger.info('Operación completada', { operation: 'userLogin' });
logger.warn('Advertencia', { warning: 'deprecated API' });
logger.error('Error occurred', { error: errorMessage });
logger.fatal('Error crítico', { system: 'database' });

// Logs especializados
logger.logPerformance('database

Ahora voy a crear una documentación completa del sistema de manejo de errores:

<write_to_file>
<path>ERROR_HANDLING_SYSTEM.md</path>
<content>
# Sistema Centralizado de Manejo de Errores y Logging

## Overview

Este documento describe el sistema centralizado de manejo de errores y logging implementado para mejorar la robustez, mantenibilidad y experiencia de usuario de la aplicación.

## 🎯 Objetivos del Sistema

1. **Centralización**: Unificar el manejo de errores en toda la aplicación
2. **Consistencia**: Proporcionar una experiencia consistente para el usuario
3. **Debugging**: Facilitar el diagnóstico y solución de problemas
4. **Monitoreo**: Permitir el seguimiento de errores en producción
5. **Resiliencia**: Mejorar la capacidad de recuperación de la aplicación

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── lib/
│   ├── errorHandler.js          # Núcleo del manejador de errores
│   └── logger.js               # Sistema de logging estructurado
├── hooks/
│   └── useErrorHandler.js      # Hooks personalizados para React
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.js    # React Error Boundary
│   │   └── ErrorNotifications.js # UI de notificaciones
│   └── hoc/
│       └── WithErrorHandling.js # Higher-Order Components
├── config/
│   └── errorHandlingConfig.js  # Configuración centralizada
└── AppWithErrorHandling.js     # Integración con la aplicación
```

## 🔧 Componentes Detallados

### 1. ErrorHandler (`src/lib/errorHandler.js`)

**Clase principal para el manejo estructurado de errores**

#### Características:
- **Tipos de errores**: NETWORK, DATABASE, AUTHENTICATION, VALIDATION, BUSINESS_LOGIC, UI, SYSTEM
- **Niveles de severidad**: LOW, MEDIUM, HIGH, CRITICAL
- **Sistema de suscripción**: Para notificaciones en tiempo real
- **Contexto enriquecido**: Información adicional para debugging

#### Uso básico:
```javascript
import { errorHandler } from './lib/errorHandler.js';

// Crear un error estructurado
const error = errorHandler.createError(
  'Error de conexión',
  'NETWORK',
  'HIGH',
  { endpoint: '/api/users', retryCount: 3 }
);

// Manejar un error existente
const handledError = errorHandler.handleError(error, {
  component: 'UserProfile',
  operation: 'loadUserData'
});
```

### 2. Logger (`src/lib/logger.js`)

**Sistema de logging flexible y estructurado**

#### Características:
- **Múltiples niveles**: DEBUG, INFO, WARN, ERROR, FATAL
- **Transports**: Console, Memory, External Services
- **Métodos especializados**: Performance, User Actions, Business Events
- **Exportación**: JSON, CSV, TXT

#### Uso básico:
```javascript
import logger from './lib/logger.js';

// Logging básico
logger.info('Usuario inició sesión', { userId: '123', timestamp: Date.now() });

// Performance logging
logger.logPerformance('API_CALL', '/api/users', 1500, { method: 'GET' });

// User action logging
logger.logUserAction('BUTTON_CLICK', 'submit_form', { formId: 'contact' });
```

### 3. React Error Boundary (`src/components/common/ErrorBoundary.js`)

**Componente para capturar errores de React**

#### Características:
- **Fallback UI personalizable**
- **Modo desarrollo con detalles técnicos**
- **Integración con el sistema centralizado**
- **Recuperación automática**

#### Uso:
```jsx
import ErrorBoundary from './components/common/ErrorBoundary.js';

<ErrorBoundary
  fallback={(error, errorInfo, errorId) => (
    <div>Error personalizado: {error.message}</div>
  )}
  onError={(error, errorInfo, errorId) => {
    // Manejo adicional del error
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### 4. Hook useErrorHandler (`src/hooks/useErrorHandler.js`)

**Hook personalizado para manejo de errores en componentes**

#### Características:
- **Sincronización con el sistema centralizado**
- **Gestión local de errores**
- **Métodos de conveniencia**
- **Contadores y estadísticas**

#### Uso:
```jsx
import { useErrorHandler } from './hooks/useErrorHandler.js';

function MyComponent() {
  const { 
    handleError, 
    handleAsyncError, 
    errorCounts,
    removeError 
  } = useErrorHandler({
    enableNotifications: true,
    maxErrors: 10
  });

  const loadData = async () => {
    try {
      const data = await handleAsyncError(
        () => api.getData(),
        { operation: 'loadData' }
      );
      return data;
    } catch (error) {
      // Error ya manejado por el sistema
    }
  };

  // ...
}
```

### 5. ErrorNotifications (`src/components/common/ErrorNotifications.js`)

**Componente UI para mostrar notificaciones de errores**

#### Características:
- **Notificaciones no intrusivas**
- **Clasificación por severidad y tipo**
- **Auto-ocultamiento configurable**
- **Detalles expandibles**
- **Acciones de recuperación**

#### Uso:
```jsx
import ErrorNotifications from './components/common/ErrorNotifications.js';

// En el componente principal de la app
<ErrorNotifications 
  position="top-right" 
  maxVisible={5}
/>
```

### 6. Higher-Order Components (`src/components/hoc/WithErrorHandling.js`)

**HOCs para añadir manejo de errores a componentes**

#### Tipos disponibles:
- `withErrorHandling`: Manejo completo de errores
- `withSimpleErrorHandling`: Manejo básico simplificado
- `withAsyncErrorHandling`: Para operaciones asíncronas
- `withFormErrorHandling`: Para formularios con validación

#### Uso:
```jsx
import { withErrorHandling, withFormErrorHandling } from './components/hoc/WithErrorHandling.js';

// Componente con manejo básico
const EnhancedComponent = withErrorHandling(MyComponent, {
  errorHandlerOptions: { enableNotifications: true }
});

// Formulario con validación
const EnhancedForm = withFormErrorHandling(MyForm, {
  validationSchema: userValidationSchema,
  onSubmit: handleSubmit
});
```

## 📋 Configuración

### Configuración Centralizada (`src/config/errorHandlingConfig.js`)

```javascript
export const errorHandlingConfig = {
  logger: {
    level: 'INFO',
    enableConsole: true,
    enableMemory: true,
    enableRemote: false
  },
  errorHandler: {
    enableNotifications: true,
    maxErrors: 50,
    autoRetryAttempts: 3
  },
  notifications: {
    position: 'top-right',
    maxVisible: 5,
    autoHideDelay: 5000
  },
  reporting: {
    enableErrorReporting: false,
    reportingEndpoint: null,
    reportInterval: 60000
  }
};
```

### Variables de Entorno

```bash
# .env.production
REACT_APP_LOG_ENDPOINT=https://logs.example.com/api/logs
REACT_APP_LOG_API_KEY=your-log-api-key
REACT_APP_ERROR_REPORTING_ENDPOINT=https://errors.example.com/api/errors
REACT_APP_ERROR_REPORTING_API_KEY=your-error-api-key
```

## 🚀 Integración con la Aplicación

### Paso 1: Reemplazar el componente App

```javascript
// En index.js
import AppWithErrorHandling from './AppWithErrorHandling.js';

ReactDOM.render(
  <React.StrictMode>
    <AppWithErrorHandling />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### Paso 2: Envolver componentes críticos

```jsx
import { withErrorHandling } from './components/hoc/WithErrorHandling.js';

const Dashboard = withErrorHandling(DashboardComponent);
const UserProfile = withErrorHandling(UserProfileComponent);
const FileManager = withErrorHandling(FileManagerComponent);
```

### Paso 3: Actualizar servicios y API calls

```javascript
import { AppErrorUtils } from './config/errorHandlingConfig.js';

// En servicios de API
export const userService = {
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw AppErrorUtils.handleApiError(error, {
        service: 'userService',
        operation: 'getUsers'
      });
    }
  }
};
```

## 📊 Tipos y Severidades de Errores

### Tipos de Errores

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| `NETWORK` | Problemas de conectividad | Timeout, conexión rechazada |
| `DATABASE` | Errores de base de datos | Query fallido, conexión perdida |
| `AUTHENTICATION` | Problemas de autenticación | Token inválido, sesión expirada |
| `VALIDATION` | Errores de validación | Campo requerido faltante |
| `BUSINESS_LOGIC` | Errores de lógica de negocio | Regla de negocio violada |
| `UI` | Errores de interfaz | Componente no renderiza |
| `SYSTEM` | Errores del sistema | Memory overflow, crash |

### Niveles de Severidad

| Severidad | Descripción | Auto-ocultar | Notificación |
|-----------|-------------|---------------|--------------|
| `LOW` | Informativo, no crítico | 3 segundos | ✅ |
| `MEDIUM` | Problema menor, funcionalidad afectada | 5 segundos | ✅ |
| `HIGH` | Problema grave, funcionalidad limitada | No | ✅ |
| `CRITICAL` | Error crítico, aplicación inestable | No | ✅ + Acción requerida |

## 🔍 Mejores Prácticas

### 1. Manejo de Errores en Componentes

```jsx
function MyComponent() {
  const { handleAsyncError } = useErrorHandler();

  const handleSubmit = async (data) => {
    try {
      await handleAsyncError(
        () => api.submitForm(data),
        { operation: 'submitForm', component: 'MyComponent' }
      );
    } catch (error) {
      // El error ya fue manejado y notificado
      console.log('Error manejado automáticamente:', error.errorId);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2. Validación de Formularios

```jsx
const UserForm = withFormErrorHandling(FormComponent, {
  validationSchema: userValidation,
  onSubmit: async (data) => {
    // El manejo de errores es automático
    return await userService.createUser(data);
  }
});
```

### 3. Operaciones Asíncronas

```jsx
const AsyncComponent = withAsyncErrorHandling(DataLoader, {
  loadingComponent: <LoadingSpinner />,
  errorComponent: ({ error, onRetry }) => (
    <ErrorMessage error={error} onRetry={onRetry} />
  ),
  retryFunction: () => api.loadData()
});
```

### 4. Logging Efectivo

```javascript
// Logging estructurado
logger.info('Operación completada', {
  operation: 'user_registration',
  userId: user.id,
  duration: performance.now() - startTime,
  metadata: { source: 'web_app' }
});

// Performance logging
logger.logPerformance('DATABASE_QUERY', 'SELECT users', 250, {
  rows: 100,
  indexed: true
});

// User actions
logger.logUserAction('NAVIGATION', 'dashboard_to_profile', {
  from: '/dashboard',
  to: '/profile',
  method: 'sidebar_click'
});
```

## 🛠️ Herramientas de Debugging

### 1. Consola del Navegador

```javascript
// Inspeccionar errores actuales
console.log('Errores activos:', errorHandler.getRecentErrors(10));

// Ver configuración del logger
console.log('Configuración logger:', logger.getConfiguration());

// Exportar logs
logger.exportLogs('json').then(logs => {
  console.log('Logs exportados:', logs);
});
```

### 2. React DevTools

Los componentes con manejo de errores muestran:
- `errorHandler`: Hook con estado actual
- `errorCounts`: Estadísticas de errores
- `lastError`: Último error ocurrido

### 3. Network Tab

Los errores de red se registran con:
- Request URL y método
- Status code y mensaje
- Tiempo de respuesta
- Headers relevantes

## 📈 Monitoreo en Producción

### 1. Métricas Clave

- **Tasa de errores**: Errores por minuto/hora
- **Tipos de errores**: Distribución por tipo
- **Severidad**: Errores críticos vs leves
- **Componentes afectados**: Top 10 componentes con errores
- **Impacto de usuario**: Errores por sesión de usuario

### 2. Alertas

Configurar alertas para:
- Aumento súbito de errores críticos
- Tasa de errores > 5% en última hora
- Errores en componentes críticos (login, dashboard)
- Problemas de conectividad generalizados

### 3. Reportes Automáticos

```javascript
// Reporte diario de errores
const dailyReport = {
  timestamp: new Date().toISOString(),
  totalErrors: errorCounts.total,
  criticalErrors: errorCounts.critical,
  topComponents: getTopErrorComponents(),
  trends: getErrorTrends()
};
```

## 🔄 Mantenimiento

### 1. Actualización de Tipos de Error

```javascript
// Agregar nuevo tipo de error
errorHandler.addErrorType('PAYMENT', {
  severity: 'HIGH',
  autoRetry: false,
  notifyUser: true
});
```

### 2. Configuración Dinámica

```javascript
// Ajustar nivel de logging en runtime
logger.setLevel('DEBUG');

// Habilitar/deshabilitar notificaciones
errorHandler.configure({
  enableNotifications: false
});
```

### 3. Limpieza de Logs

```javascript
// Limpiar logs antiguos
logger.clearOldLogs(7 * 24 * 60 * 60 * 1000); // 7 días

// Limpiar errores resueltos
errorHandler.clearResolvedErrors();
```

## 🎯 Casos de Uso Específicos

### 1. Dashboard Principal

```jsx
const Dashboard = withErrorHandling(DashboardComponent, {
  errorHandlerOptions: {
    enableNotifications: true,
    maxErrors: 5
  },
  errorBoundaryOptions: {
    fallback: (error) => (
      <DashboardFallback error={error} />
    )
  }
});
```

### 2. Sistema de Archivos

```jsx
const FileManager = withAsyncErrorHandling(FileManagerComponent, {
  loadingComponent: <FileLoadingSpinner />,
  errorComponent: ({ error, onRetry }) => (
    <FileErrorDisplay error={error} onRetry={onRetry} />
  ),
  retryFunction: (props) => props.loadFiles()
});
```

### 3. Formularios Complejos

```jsx
const UserRegistrationForm = withFormErrorHandling(
  RegistrationFormComponent,
  {
    validationSchema: registrationValidation,
    onSubmit: async (data) => {
      const result = await userService.createUser(data);
      logger.logUserAction('USER_REGISTRATION', 'form_submit', {
        userId: result.id,
        email: data.email
      });
      return result;
    },
    resetOnSubmit: true
  }
);
```

## 📚 Referencia Rápida

### Importaciones Principales

```javascript
import { errorHandler } from './lib/errorHandler.js';
import logger from './lib/logger.js';
import { useErrorHandler } from './hooks/useErrorHandler.js';
import ErrorBoundary from './components/common/ErrorBoundary.js';
import ErrorNotifications from './components/common/ErrorNotifications.js';
import { withErrorHandling } from './components/hoc/WithErrorHandling.js';
import { initializeErrorHandling, AppErrorUtils } from './config/errorHandlingConfig.js';
```

### Métodos Más Comunes

```javascript
// Crear error
const error = errorHandler.createError(message, type, severity, context);

// Manejar error
const handled = errorHandler.handleError(error, context);

// Loggear
logger.info(message, metadata);
logger.error(message, metadata);

// Hook
const { handleError, handleAsyncError } = useErrorHandler();

// Utilidades
AppErrorUtils.handleApiError(error, context);
AppErrorUtils.createNetworkError(message, context);
```

## 🎉 Conclusión

Este sistema de manejo de errores proporciona:

- **Experiencia de usuario mejorada**: Notificaciones claras y útiles
- **Debugging eficiente**: Información detallada y estructurada
- **Monitoreo proactivo**: Detección temprana de problemas
- **Código mantenible**: Arquitectura modular y extensible
- **Resiliencia**: Recuperación automática y manejo graceful

La implementación completa transforma la forma en que la aplicación maneja errores, pasando de un enfoque reactivo a uno proactivo y centrado en el usuario.