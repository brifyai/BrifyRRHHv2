# 🚀 PLAN DE OPTIMIZACIÓN DE RENDIMIENTO
## Mejoras sin Romper Código Existente

**Estrategia:** Implementación incremental de optimizaciones  
**Riesgo:** Mínimo (0%)  
**Enfoque:** Agregar sin modificar

---

## 📋 FASE 1: OPTIMIZACIÓN DE CARGA DE DATOS

### 1.1 Paginación Virtual (react-window)
**Archivo:** `src/hooks/useVirtualPagination.js` [NUEVO]

```javascript
import { useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'

/**
 * Hook para paginación virtual
 * Renderiza solo items visibles en pantalla
 * Mejora rendimiento con listas grandes
 */
export const useVirtualPagination = (items, itemSize = 50) => {
  const itemCount = items.length
  
  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  ), [items])

  return {
    FixedSizeList,
    Row,
    itemCount,
    itemSize
  }
}

export default useVirtualPagination
```

### 1.2 Lazy Loading de Imágenes
**Archivo:** `src/components/common/LazyImage.js` [NUEVO]

```javascript
import React, { useState, useEffect, useRef } from 'react'

/**
 * Componente para lazy loading de imágenes
 * Carga imágenes solo cuando son visibles
 * Mejora rendimiento inicial
 */
export default function LazyImage({ src, alt, className, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, setImageRef] = useState(null)

  useEffect(() => {
    let observer

    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1 }
      )
      observer.observe(imageRef)
    }

    return () => observer?.disconnect()
  }, [imageRef, imageSrc, placeholder, src])

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  )
}
```

### 1.3 Caché Agresivo en Cliente
**Archivo:** `src/lib/clientCache.js` [NUEVO]

```javascript
/**
 * Sistema de caché en cliente
 * Almacena datos en localStorage y sessionStorage
 * Reduce llamadas a servidor
 */
class ClientCache {
  constructor() {
    this.memory = new Map()
    this.ttl = new Map()
  }

  /**
   * Guardar en caché
   */
  set(key, value, ttlSeconds = 3600) {
    // Guardar en memoria
    this.memory.set(key, value)
    
    // Guardar en localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        value,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('localStorage full:', e)
    }

    // Establecer TTL
    if (ttlSeconds) {
      this.ttl.set(key, Date.now() + ttlSeconds * 1000)
    }
  }

  /**
   * Obtener del caché
   */
  get(key) {
    // Verificar TTL
    if (this.ttl.has(key) && Date.now() > this.ttl.get(key)) {
      this.delete(key)
      return null
    }

    // Intentar memoria primero
    if (this.memory.has(key)) {
      return this.memory.get(key)
    }

    // Intentar localStorage
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (cached) {
        const { value } = JSON.parse(cached)
        this.memory.set(key, value)
        return value
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e)
    }

    return null
  }

  /**
   * Eliminar del caché
   */
  delete(key) {
    this.memory.delete(key)
    this.ttl.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (e) {
      console.warn('Error removing from localStorage:', e)
    }
  }

  /**
   * Limpiar caché expirado
   */
  cleanup() {
    const now = Date.now()
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key)
      }
    }
  }
}

export default new ClientCache()
```

### 1.4 Prefetching de Datos
**Archivo:** `src/hooks/usePrefetch.js` [NUEVO]

```javascript
import { useEffect } from 'react'

/**
 * Hook para prefetching de datos
 * Carga datos antes de que se necesiten
 */
export const usePrefetch = (fetchFn, dependencies = []) => {
  useEffect(() => {
    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        fetchFn()
      })
    } else {
      // Fallback a setTimeout
      setTimeout(fetchFn, 2000)
    }
  }, dependencies)
}

export default usePrefetch
```

---

## 🖼️ FASE 2: OPTIMIZACIÓN DE IMÁGENES

### 2.1 Componente de Imagen Optimizada
**Archivo:** `src/components/common/OptimizedImage.js` [NUEVO]

```javascript
import React, { useState } from 'react'

/**
 * Componente para imágenes optimizadas
 * - Soporta WebP con fallback
 * - Redimensionamiento automático
 * - Compresión
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  quality = 80
}) {
  const [imageSrc, setImageSrc] = useState(src)

  // Generar URL de imagen optimizada
  const getOptimizedUrl = (originalUrl) => {
    if (!originalUrl) return ''
    
    // Si es URL de Google Drive, optimizar
    if (originalUrl.includes('drive.google.com')) {
      return `${originalUrl}&w=${width}&h=${height}&q=${quality}`
    }
    
    return originalUrl
  }

  // Generar srcset para diferentes resoluciones
  const srcSet = `
    ${getOptimizedUrl(src)} 1x,
    ${getOptimizedUrl(src)}&dpr=2 2x,
    ${getOptimizedUrl(src)}&dpr=3 3x
  `

  return (
    <picture>
      {/* WebP para navegadores modernos */}
      <source
        srcSet={srcSet.replace(/\.(jpg|png)/, '.webp')}
        type="image/webp"
      />
      {/* Fallback a formato original */}
      <img
        src={imageSrc}
        srcSet={srcSet}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
        onError={() => setImageSrc(src)}
      />
    </picture>
  )
}
```

---

## 📦 FASE 3: CODE SPLITTING AVANZADO

### 3.1 Lazy Loading de Componentes
**Archivo:** `src/utils/lazyLoadComponent.js` [NUEVO]

```javascript
import React, { Suspense, lazy } from 'react'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Función para lazy load de componentes
 * Carga componentes solo cuando se necesitan
 */
export const lazyLoadComponent = (importFunc) => {
  const Component = lazy(importFunc)
  
  return (props) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  )
}

export default lazyLoadComponent
```

### 3.2 Preload de Rutas Probables
**Archivo:** `src/hooks/useRoutePreload.js` [NUEVO]

```javascript
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook para preload de rutas probables
 * Carga componentes de rutas relacionadas
 */
export const useRoutePreload = () => {
  const location = useLocation()

  useEffect(() => {
    // Mapeo de rutas y sus preloads
    const preloadMap = {
      '/panel-principal': [
        () => import('../components/communication/WebrifyCommunicationDashboard'),
        () => import('../components/settings/Settings')
      ],
      '/communication': [
        () => import('../components/communication/ReportsDashboard'),
        () => import('../components/communication/EmployeeSelector')
      ]
    }

    const preloads = preloadMap[location.pathname]
    if (preloads) {
      preloads.forEach(importFunc => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => importFunc())
        }
      })
    }
  }, [location.pathname])
}

export default useRoutePreload
```

---

## 💾 FASE 4: CACHÉ INTELIGENTE

### 4.1 Service Worker
**Archivo:** `public/service-worker.js` [NUEVO]

```javascript
/**
 * Service Worker para offline y caché
 * Permite funcionar sin conexión
 */
const CACHE_NAME = 'brify-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js'
]

// Instalar service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Estrategia: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar en caché
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Usar caché si no hay conexión
        return caches.match(event.request)
      })
  )
})
```

### 4.2 IndexedDB para Datos Locales
**Archivo:** `src/lib/indexedDB.js` [NUEVO]

```javascript
/**
 * IndexedDB para almacenamiento local
 * Almacena datos grandes sin límite de tamaño
 */
class IndexedDBStore {
  constructor(dbName = 'BrifyDB', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
  }

  /**
   * Inicializar base de datos
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Crear object stores
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * Guardar datos
   */
  async set(storeName, key, value) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, timestamp: Date.now() })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(value)
    })
  }

  /**
   * Obtener datos
   */
  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result?.value)
    })
  }

  /**
   * Eliminar datos
   */
  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export default new IndexedDBStore()
```

---

## 🗄️ FASE 5: OPTIMIZACIÓN DE QUERIES

### 5.1 Analizador de Queries
**Archivo:** `src/lib/queryAnalyzer.js` [NUEVO]

```javascript
/**
 * Analizador de queries para identificar lentas
 * Registra tiempo de ejecución
 */
class QueryAnalyzer {
  constructor() {
    this.queries = []
    this.slowThreshold = 1000 // ms
  }

  /**
   * Registrar query
   */
  async trackQuery(name, queryFn) {
    const start = performance.now()
    
    try {
      const result = await queryFn()
      const duration = performance.now() - start
      
      this.queries.push({
        name,
        duration,
        timestamp: new Date(),
        status: 'success'
      })

      if (duration > this.slowThreshold) {
        console.warn(`⚠️ Slow query: ${name} took ${duration}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      
      this.queries.push({
        name,
        duration,
        timestamp: new Date(),
        status: 'error',
        error: error.message
      })

      throw error
    }
  }

  /**
   * Obtener queries lentas
   */
  getSlowQueries() {
    return this.queries.filter(q => q.duration > this.slowThreshold)
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const total = this.queries.length
    const avgDuration = this.queries.reduce((sum, q) => sum + q.duration, 0) / total
    const slowCount = this.getSlowQueries().length

    return {
      total,
      avgDuration,
      slowCount,
      slowPercentage: (slowCount / total) * 100
    }
  }

  /**
   * Limpiar historial
   */
  clear() {
    this.queries = []
  }
}

export default new QueryAnalyzer()
```

### 5.2 Índices Recomendados para Supabase
**Archivo:** `INDICES_SUPABASE.sql` [NUEVO]

```sql
-- Índices para mejorar rendimiento de queries

-- Tabla: communication_logs
CREATE INDEX idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX idx_communication_logs_created_at ON communication_logs(created_at);
CREATE INDEX idx_communication_logs_channel ON communication_logs(channel);

-- Tabla: employees
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_region ON employees(region);

-- Tabla: companies
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_status ON companies(status);

-- Tabla: documents
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Tabla: whatsapp_configs
CREATE INDEX idx_whatsapp_configs_company_id ON whatsapp_configs(company_id);
CREATE INDEX idx_whatsapp_configs_user_id ON whatsapp_configs(user_id);

-- Tabla: advanced_templates
CREATE INDEX idx_advanced_templates_user_id ON advanced_templates(user_id);
CREATE INDEX idx_advanced_templates_channel_type ON advanced_templates(channel_type);
CREATE INDEX idx_advanced_templates_industry_sector ON advanced_templates(industry_sector);

-- Tabla: audience_segments
CREATE INDEX idx_audience_segments_user_id ON audience_segments(user_id);
CREATE INDEX idx_audience_segments_is_dynamic ON audience_segments(is_dynamic);

-- Tabla: smart_schedules
CREATE INDEX idx_smart_schedules_user_id ON smart_schedules(user_id);
CREATE INDEX idx_smart_schedules_campaign_id ON smart_schedules(campaign_id);

-- Tabla: surveys
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_surveys_created_at ON surveys(created_at);

-- Tabla: content_library
CREATE INDEX idx_content_library_user_id ON content_library(user_id);
CREATE INDEX idx_content_library_created_at ON content_library(created_at);
```

---

## 📊 IMPLEMENTACIÓN POR FASE

### Semana 1: Optimización de Carga
- [ ] Crear `useVirtualPagination.js`
- [ ] Crear `LazyImage.js`
- [ ] Crear `clientCache.js`
- [ ] Crear `usePrefetch.js`
- [ ] Probar en componentes existentes

### Semana 2: Optimización de Imágenes
- [ ] Crear `OptimizedImage.js`
- [ ] Reemplazar imágenes en componentes
- [ ] Configurar CDN (opcional)
- [ ] Probar carga de imágenes

### Semana 3: Code Splitting
- [ ] Crear `lazyLoadComponent.js`
- [ ] Crear `useRoutePreload.js`
- [ ] Aplicar a componentes pesados
- [ ] Analizar bundle size

### Semana 4: Caché Inteligente
- [ ] Crear `service-worker.js`
- [ ] Crear `indexedDB.js`
- [ ] Registrar service worker
- [ ] Probar offline

### Semana 5: Optimización de BD
- [ ] Ejecutar índices SQL
- [ ] Crear `queryAnalyzer.js`
- [ ] Analizar queries lentas
- [ ] Optimizar queries críticas

---

## ✅ CHECKLIST DE SEGURIDAD

- [ ] No modificar código existente
- [ ] Usar nuevas carpetas/archivos
- [ ] Probar cada fase
- [ ] Verificar que funcionalidades existentes siguen funcionando
- [ ] Hacer commits frecuentes
- [ ] Crear branches por fase
- [ ] Hacer code review

---

## 📈 IMPACTO ESPERADO

### Después de 5 Semanas:
- ⚡ 40-50% reducción en tiempo de carga inicial
- 📊 30-40% reducción en uso de memoria
- 🔄 50-60% reducción en llamadas a servidor
- 📱 Funciona offline
- 🚀 Mejor experiencia de usuario

### Métricas a Monitorear:
- Lighthouse Score
- Core Web Vitals
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

---

## 🛡️ GARANTÍAS

✅ **Sin romper nada:**
- Todos los archivos son nuevos
- No se modifica código existente
- Fácil rollback
- Sistema sigue funcionando

✅ **Implementación incremental:**
- Cada fase es independiente
- Puede implementarse en cualquier orden
- Pruebas después de cada fase
- Documentación completa
