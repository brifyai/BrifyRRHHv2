/**
 * Lazy Load Component Utility
 * Utilidad para lazy loading de componentes React
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { Suspense, lazy } from 'react'

/**
 * Componente de fallback mientras carga
 */
const DefaultFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '14px',
    color: '#666'
  }}>
    <div>Cargando...</div>
  </div>
)

/**
 * Lazy load un componente con retry automático
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {React.Component} Componente lazy loaded
 */
export const lazyLoadComponent = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    retries = 3,
    delay = 1000,
    onError = null
  } = options

  let retryCount = 0

  const LazyComponent = lazy(() => {
    return importFn().catch(error => {
      if (retryCount < retries) {
        retryCount++
        console.warn(`Retry ${retryCount}/${retries} loading component...`)
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(importFn())
          }, delay)
        })
      }

      console.error('Failed to load component:', error)
      if (onError) onError(error)
      
      throw error
    })
  })

  return LazyComponent
}

/**
 * Lazy load múltiples componentes
 * @param {Object} components - Objeto con componentes a lazy load
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con componentes lazy loaded
 */
export const lazyLoadComponents = (components = {}, options = {}) => {
  const lazyComponents = {}

  for (const [key, importFn] of Object.entries(components)) {
    lazyComponents[key] = lazyLoadComponent(importFn, options)
  }

  return lazyComponents
}

/**
 * Wrapper para Suspense con fallback personalizado
 * @param {React.Component} Component - Componente lazy loaded
 * @param {React.Component} fallback - Componente de fallback
 * @returns {React.Component} Componente envuelto en Suspense
 */
export const withSuspense = (Component, fallback = <DefaultFallback />) => {
  return (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
}

/**
 * Lazy load por ruta (para React Router)
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con componente y fallback para React Router
 */
export const lazyLoadRoute = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    ...restOptions
  } = options

  const Component = lazyLoadComponent(importFn, restOptions)

  return {
    Component: withSuspense(Component, fallback),
    fallback
  }
}

/**
 * Lazy load con prefetch
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con componente y función de prefetch
 */
export const lazyLoadWithPrefetch = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    ...restOptions
  } = options

  const Component = lazyLoadComponent(importFn, restOptions)
  let prefetched = false

  const prefetch = () => {
    if (!prefetched) {
      prefetched = true
      importFn().catch(error => {
        console.warn('Prefetch failed:', error)
      })
    }
  }

  return {
    Component: withSuspense(Component, fallback),
    prefetch,
    fallback
  }
}

/**
 * Lazy load con timeout
 * @param {Function} importFn - Función que retorna import()
 * @param {number} timeoutMs - Timeout en milisegundos
 * @param {Object} options - Opciones de configuración
 * @returns {React.Component} Componente lazy loaded con timeout
 */
export const lazyLoadWithTimeout = (importFn, timeoutMs = 10000, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    onTimeout = null,
    ...restOptions
  } = options

  const LazyComponent = lazy(() => {
    return Promise.race([
      importFn(),
      new Promise((_, reject) =>
        setTimeout(() => {
          const error = new Error(`Component loading timeout after ${timeoutMs}ms`)
          if (onTimeout) onTimeout(error)
          reject(error)
        }, timeoutMs)
      )
    ])
  })

  return withSuspense(LazyComponent, fallback)
}

/**
 * Lazy load con error boundary
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {React.Component} Componente lazy loaded con error boundary
 */
export const lazyLoadWithErrorBoundary = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    errorFallback = null,
    onError = null
  } = options

  const Component = lazyLoadComponent(importFn, options)

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
      console.error('Component error:', error, errorInfo)
      if (onError) onError(error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        return errorFallback || (
          <div style={{
            padding: '20px',
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}>
            Error loading component: {this.state.error?.message}
          </div>
        )
      }

      return (
        <Suspense fallback={fallback}>
          <Component {...this.props} />
        </Suspense>
      )
    }
  }

  return ErrorBoundary
}

/**
 * Lazy load con estadísticas
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con componente y estadísticas
 */
export const lazyLoadWithStats = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    name = 'Component'
  } = options

  const stats = {
    name,
    startTime: null,
    endTime: null,
    duration: null,
    success: false,
    error: null
  }

  const LazyComponent = lazy(() => {
    stats.startTime = performance.now()

    return importFn()
      .then(module => {
        stats.endTime = performance.now()
        stats.duration = stats.endTime - stats.startTime
        stats.success = true
        console.log(`✅ ${name} loaded in ${stats.duration.toFixed(2)}ms`)
        return module
      })
      .catch(error => {
        stats.endTime = performance.now()
        stats.duration = stats.endTime - stats.startTime
        stats.error = error
        console.error(`❌ ${name} failed to load after ${stats.duration.toFixed(2)}ms:`, error)
        throw error
      })
  })

  return {
    Component: withSuspense(LazyComponent, fallback),
    stats,
    fallback
  }
}

/**
 * Lazy load con caché
 * @param {Function} importFn - Función que retorna import()
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con componente y funciones de caché
 */
export const lazyLoadWithCache = (importFn, options = {}) => {
  const {
    fallback = <DefaultFallback />,
    cacheKey = null
  } = options

  let cachedModule = null
  const key = cacheKey || importFn.toString()

  const LazyComponent = lazy(() => {
    if (cachedModule) {
      console.log(`📦 Using cached module: ${key}`)
      return Promise.resolve(cachedModule)
    }

    return importFn().then(module => {
      cachedModule = module
      console.log(`💾 Cached module: ${key}`)
      return module
    })
  })

  return {
    Component: withSuspense(LazyComponent, fallback),
    clearCache: () => {
      cachedModule = null
      console.log(`🗑️ Cleared cache: ${key}`)
    },
    fallback
  }
}

export default lazyLoadComponent
