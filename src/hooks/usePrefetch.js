/**
 * Prefetch Hook
 * Precarga datos antes de que sean necesarios
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import { useEffect, useCallback, useRef } from 'react'
import clientCache from '../lib/clientCache'

/**
 * Hook para prefetch de datos
 * @param {Function} fetchFn - Función que retorna Promise
 * @param {Array} dependencies - Dependencias para ejecutar prefetch
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones de prefetch
 */
export const usePrefetch = (fetchFn, dependencies = [], options = {}) => {
  const {
    enabled = true,
    delay = 0,
    cacheKey = null,
    cacheTTL = 3600,
    onSuccess = null,
    onError = null
  } = options

  const prefetchRef = useRef(null)
  const timeoutRef = useRef(null)

  const prefetch = useCallback(async () => {
    if (!enabled || !fetchFn) return

    try {
      // Verificar si está en caché
      if (cacheKey && clientCache.has(cacheKey)) {
        if (onSuccess) onSuccess(clientCache.get(cacheKey))
        return
      }

      // Ejecutar fetch
      const data = await fetchFn()

      // Guardar en caché
      if (cacheKey) {
        clientCache.set(cacheKey, data, cacheTTL)
      }

      if (onSuccess) onSuccess(data)
    } catch (error) {
      console.error('Prefetch error:', error)
      if (onError) onError(error)
    }
  }, [enabled, fetchFn, cacheKey, cacheTTL, onSuccess, onError])

  useEffect(() => {
    if (!enabled) return

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Ejecutar prefetch con delay
    if (delay > 0) {
      timeoutRef.current = setTimeout(prefetch, delay)
    } else {
      prefetch()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, dependencies)

  return {
    prefetch,
    cancel: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }
}

/**
 * Hook para prefetch de múltiples recursos
 * @param {Array} resources - Array de recursos a prefetch
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones de prefetch
 */
export const usePrefetchMultiple = (resources = [], options = {}) => {
  const {
    enabled = true,
    parallel = true,
    onSuccess = null,
    onError = null
  } = options

  const prefetchRef = useRef(null)

  const prefetch = useCallback(async () => {
    if (!enabled || !resources || resources.length === 0) return

    try {
      const promises = resources.map(resource => {
        const { fetchFn, cacheKey, cacheTTL = 3600 } = resource

        return (async () => {
          try {
            // Verificar caché
            if (cacheKey && clientCache.has(cacheKey)) {
              return { success: true, data: clientCache.get(cacheKey) }
            }

            // Fetch
            const data = await fetchFn()

            // Guardar en caché
            if (cacheKey) {
              clientCache.set(cacheKey, data, cacheTTL)
            }

            return { success: true, data }
          } catch (error) {
            return { success: false, error }
          }
        })()
      })

      const results = parallel
        ? await Promise.all(promises)
        : await promises.reduce(
            (acc, promise) => acc.then(results => promise.then(r => [...results, r])),
            Promise.resolve([])
          )

      if (onSuccess) onSuccess(results)
      return results
    } catch (error) {
      console.error('Prefetch multiple error:', error)
      if (onError) onError(error)
    }
  }, [enabled, resources, onSuccess, onError, parallel])

  useEffect(() => {
    if (!enabled) return
    prefetch()
  }, [enabled, resources.length])

  return {
    prefetch,
    cancel: () => {
      // Cancelar si es posible
    }
  }
}

/**
 * Hook para prefetch en hover
 * @param {Function} fetchFn - Función que retorna Promise
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Handlers y estado
 */
export const usePrefetchOnHover = (fetchFn, options = {}) => {
  const {
    enabled = true,
    cacheKey = null,
    cacheTTL = 3600,
    onSuccess = null,
    onError = null,
    delay = 200
  } = options

  const timeoutRef = useRef(null)
  const prefetchRef = useRef(false)

  const handleMouseEnter = useCallback(() => {
    if (!enabled || !fetchFn || prefetchRef.current) return

    timeoutRef.current = setTimeout(async () => {
      try {
        // Verificar caché
        if (cacheKey && clientCache.has(cacheKey)) {
          if (onSuccess) onSuccess(clientCache.get(cacheKey))
          return
        }

        // Fetch
        const data = await fetchFn()

        // Guardar en caché
        if (cacheKey) {
          clientCache.set(cacheKey, data, cacheTTL)
        }

        prefetchRef.current = true
        if (onSuccess) onSuccess(data)
      } catch (error) {
        console.error('Prefetch on hover error:', error)
        if (onError) onError(error)
      }
    }, delay)
  }, [enabled, fetchFn, cacheKey, cacheTTL, onSuccess, onError, delay])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    reset: () => {
      prefetchRef.current = false
    }
  }
}

/**
 * Hook para prefetch en scroll
 * @param {Function} fetchFn - Función que retorna Promise
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Ref y estado
 */
export const usePrefetchOnScroll = (fetchFn, options = {}) => {
  const {
    enabled = true,
    cacheKey = null,
    cacheTTL = 3600,
    onSuccess = null,
    onError = null,
    threshold = 0.8
  } = options

  const containerRef = useRef(null)
  const prefetchRef = useRef(false)

  useEffect(() => {
    if (!enabled || !fetchFn || !containerRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !prefetchRef.current) {
            prefetchRef.current = true

            // Ejecutar prefetch
            ;(async () => {
              try {
                // Verificar caché
                if (cacheKey && clientCache.has(cacheKey)) {
                  if (onSuccess) onSuccess(clientCache.get(cacheKey))
                  return
                }

                // Fetch
                const data = await fetchFn()

                // Guardar en caché
                if (cacheKey) {
                  clientCache.set(cacheKey, data, cacheTTL)
                }

                if (onSuccess) onSuccess(data)
              } catch (error) {
                console.error('Prefetch on scroll error:', error)
                if (onError) onError(error)
              }
            })()
          }
        })
      },
      { threshold }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [enabled, fetchFn, cacheKey, cacheTTL, onSuccess, onError, threshold])

  return {
    ref: containerRef,
    reset: () => {
      prefetchRef.current = false
    }
  }
}

/**
 * Hook para prefetch en idle
 * @param {Function} fetchFn - Función que retorna Promise
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones
 */
export const usePrefetchOnIdle = (fetchFn, options = {}) => {
  const {
    enabled = true,
    cacheKey = null,
    cacheTTL = 3600,
    onSuccess = null,
    onError = null
  } = options

  const idleCallbackRef = useRef(null)

  useEffect(() => {
    if (!enabled || !fetchFn) return

    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = requestIdleCallback(async () => {
        try {
          // Verificar caché
          if (cacheKey && clientCache.has(cacheKey)) {
            if (onSuccess) onSuccess(clientCache.get(cacheKey))
            return
          }

          // Fetch
          const data = await fetchFn()

          // Guardar en caché
          if (cacheKey) {
            clientCache.set(cacheKey, data, cacheTTL)
          }

          if (onSuccess) onSuccess(data)
        } catch (error) {
          console.error('Prefetch on idle error:', error)
          if (onError) onError(error)
        }
      })
    } else {
      // Fallback a setTimeout
      idleCallbackRef.current = setTimeout(async () => {
        try {
          // Verificar caché
          if (cacheKey && clientCache.has(cacheKey)) {
            if (onSuccess) onSuccess(clientCache.get(cacheKey))
            return
          }

          // Fetch
          const data = await fetchFn()

          // Guardar en caché
          if (cacheKey) {
            clientCache.set(cacheKey, data, cacheTTL)
          }

          if (onSuccess) onSuccess(data)
        } catch (error) {
          console.error('Prefetch on idle error:', error)
          if (onError) onError(error)
        }
      }, 2000)
    }

    return () => {
      if (idleCallbackRef.current) {
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(idleCallbackRef.current)
        } else {
          clearTimeout(idleCallbackRef.current)
        }
      }
    }
  }, [enabled, fetchFn, cacheKey, cacheTTL, onSuccess, onError])

  return {
    cancel: () => {
      if (idleCallbackRef.current) {
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(idleCallbackRef.current)
        } else {
          clearTimeout(idleCallbackRef.current)
        }
      }
    }
  }
}

export default usePrefetch
