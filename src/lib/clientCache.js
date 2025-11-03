/**
 * Client Cache Service
 * Sistema de caché en cliente para reducir llamadas al servidor
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

class ClientCache {
  constructor() {
    this.memory = new Map()
    this.ttl = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    }
  }

  /**
   * Guardar en caché
   * @param {string} key - Clave del caché
   * @param {*} value - Valor a guardar
   * @param {number} ttlSeconds - Tiempo de vida en segundos (default: 1 hora)
   */
  set(key, value, ttlSeconds = 3600) {
    try {
      // Guardar en memoria
      this.memory.set(key, value)
      this.stats.sets++

      // Guardar en localStorage
      try {
        const cacheData = {
          value,
          timestamp: Date.now(),
          ttl: ttlSeconds
        }
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData))
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage full, clearing old entries')
          this.clearOldEntries()
        }
      }

      // Establecer TTL
      if (ttlSeconds) {
        this.ttl.set(key, Date.now() + ttlSeconds * 1000)
      }

      return true
    } catch (error) {
      console.error('Error setting cache:', error)
      return false
    }
  }

  /**
   * Obtener del caché
   * @param {string} key - Clave del caché
   * @returns {*} Valor del caché o null
   */
  get(key) {
    try {
      // Verificar TTL
      if (this.ttl.has(key) && Date.now() > this.ttl.get(key)) {
        this.delete(key)
        this.stats.misses++
        return null
      }

      // Intentar memoria primero (más rápido)
      if (this.memory.has(key)) {
        this.stats.hits++
        return this.memory.get(key)
      }

      // Intentar localStorage
      try {
        const cached = localStorage.getItem(`cache_${key}`)
        if (cached) {
          const { value, timestamp, ttl } = JSON.parse(cached)
          
          // Verificar si expiró
          if (Date.now() - timestamp > ttl * 1000) {
            this.delete(key)
            this.stats.misses++
            return null
          }

          // Restaurar en memoria
          this.memory.set(key, value)
          this.ttl.set(key, Date.now() + ttl * 1000)
          this.stats.hits++
          return value
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e)
      }

      this.stats.misses++
      return null
    } catch (error) {
      console.error('Error getting cache:', error)
      return null
    }
  }

  /**
   * Verificar si existe en caché
   * @param {string} key - Clave del caché
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Eliminar del caché
   * @param {string} key - Clave del caché
   */
  delete(key) {
    try {
      this.memory.delete(key)
      this.ttl.delete(key)
      try {
        localStorage.removeItem(`cache_${key}`)
      } catch (e) {
        console.warn('Error removing from localStorage:', e)
      }
    } catch (error) {
      console.error('Error deleting cache:', error)
    }
  }

  /**
   * Limpiar caché expirado
   */
  cleanup() {
    try {
      const now = Date.now()
      const keysToDelete = []

      // Limpiar memoria
      for (const [key, expiry] of this.ttl.entries()) {
        if (now > expiry) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.delete(key))

      // Limpiar localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('cache_')) {
            const cached = localStorage.getItem(key)
            if (cached) {
              const { timestamp, ttl } = JSON.parse(cached)
              if (now - timestamp > ttl * 1000) {
                localStorage.removeItem(key)
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error cleaning localStorage:', e)
      }

      return keysToDelete.length
    } catch (error) {
      console.error('Error in cleanup:', error)
      return 0
    }
  }

  /**
   * Limpiar entradas antiguas cuando localStorage está lleno
   */
  clearOldEntries() {
    try {
      const entries = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cache_')) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { timestamp } = JSON.parse(cached)
            entries.push({ key, timestamp })
          }
        }
      }

      // Ordenar por timestamp y eliminar los más antiguos
      entries.sort((a, b) => a.timestamp - b.timestamp)
      const toDelete = Math.ceil(entries.length * 0.2) // Eliminar 20%
      
      for (let i = 0; i < toDelete; i++) {
        localStorage.removeItem(entries[i].key)
      }
    } catch (error) {
      console.error('Error clearing old entries:', error)
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    try {
      this.memory.clear()
      this.ttl.clear()
      
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.startsWith('cache_')) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        console.warn('Error clearing localStorage:', e)
      }

      this.stats = { hits: 0, misses: 0, sets: 0 }
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * Obtener estadísticas de caché
   * @returns {Object} Estadísticas
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
      memorySize: this.memory.size,
      localStorageSize: this.getLocalStorageSize()
    }
  }

  /**
   * Obtener tamaño de localStorage
   * @returns {string} Tamaño en KB
   */
  getLocalStorageSize() {
    try {
      let size = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cache_')) {
          size += localStorage.getItem(key).length
        }
      }
      return `${(size / 1024).toFixed(2)} KB`
    } catch (e) {
      return 'N/A'
    }
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this.stats = { hits: 0, misses: 0, sets: 0 }
  }
}

// Crear instancia singleton
const clientCache = new ClientCache()

// Limpiar caché expirado cada 5 minutos
setInterval(() => {
  const cleaned = clientCache.cleanup()
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`)
  }
}, 5 * 60 * 1000)

export default clientCache
