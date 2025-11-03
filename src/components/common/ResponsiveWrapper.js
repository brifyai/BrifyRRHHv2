/**
 * Responsive Wrapper
 * Interfaz responsiva mejorada con gestos táctiles y navegación adaptativa
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const ResponsiveWrapper = ({ children, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [orientation, setOrientation] = useState('portrait')
  
  const containerRef = useRef(null)
  const sidebarRef = useRef(null)

  // Detectar tamaño de pantalla y orientación
  useEffect(() => {
    const updateViewportSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setViewportSize({ width, height })
      setOrientation(width > height ? 'landscape' : 'portrait')
      
      // Definir breakpoints
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    updateViewportSize()
    window.addEventListener('resize', updateViewportSize)
    window.addEventListener('orientationchange', updateViewportSize)

    return () => {
      window.removeEventListener('resize', updateViewportSize)
      window.removeEventListener('orientationchange', updateViewportSize)
    }
  }, [])

  // Detectar conexión a internet
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Manejar gestos táctiles
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    })
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return
    
    const touch = e.touches[0]
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    })
  }, [touchStart])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const deltaTime = touchEnd.time - touchStart.time

    // Umbral para considerar como swipe (mínimo 50px y máximo 300ms)
    const minSwipeDistance = 50
    const maxSwipeTime = 300

    if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaX > 0) {
        setSwipeDirection('right')
        // Swipe derecho - abrir sidebar en móvil
        if (isMobile && !sidebarOpen) {
          setSidebarOpen(true)
        }
      } else {
        setSwipeDirection('left')
        // Swipe izquierdo - cerrar sidebar en móvil
        if (isMobile && sidebarOpen) {
          setSidebarOpen(false)
        }
      }
    }

    // Resetear valores
    setTouchStart(null)
    setTouchEnd(null)
    setTimeout(() => setSwipeDirection(null), 100)
  }, [touchStart, touchEnd, isMobile, sidebarOpen])

  // Navegación por teclado
  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + B: Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      setSidebarOpen(!sidebarOpen)
    }
    
    // Escape: Cerrar sidebar en móvil
    if (e.key === 'Escape' && isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
    
    // Flechas: Navegación en móvil
    if (isMobile && sidebarOpen) {
      if (e.key === 'ArrowLeft') {
        setSidebarOpen(false)
      } else if (e.key === 'ArrowRight') {
        setSidebarOpen(true)
      }
    }
  }, [isMobile, sidebarOpen])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Menú de navegación móvil
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        <button
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Inicio</span>
        </button>
        
        <button
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Buscar</span>
        </button>
        
        <button
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
        >
          <BellIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Alertas</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
        
        <button
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Cog6ToothIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Config</span>
        </button>
      </div>
    </div>
  )

  // Sidebar adaptable
  const AdaptiveSidebar = () => {
    const sidebarClasses = `
      fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40
      transform transition-transform duration-300 ease-in-out
      ${isMobile ? 'w-72' : isTablet ? 'w-64' : 'w-80'}
      ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      ${isTablet && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
    `

    return (
      <>
        {/* Overlay para móvil/tablet */}
        {(isMobile || isTablet) && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div ref={sidebarRef} className={sidebarClasses}>
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Menú
            </h2>
            
            {(isMobile || isTablet) && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Contenido del sidebar */}
          <div className="p-4 space-y-4">
            <nav className="space-y-2">
              <a
                href="/panel-principal"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">Panel Principal</span>
              </a>
              
              <a
                href="/communication"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">Comunicación</span>
              </a>
              
              <a
                href="/configuracion"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">Configuración</span>
              </a>
            </nav>
          </div>
          
          {/* Footer del sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{viewportSize.width}x{viewportSize.height}</span>
              <span>{orientation}</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Header adaptable
  const AdaptiveHeader = () => (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Botón de menú para móvil/tablet */}
          {(isMobile || isTablet) && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
          
          {/* Título */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              BrifyRRHH v2
            </h1>
            {(isMobile || isTablet) && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isOffline ? 'Modo offline' : 'Conectado'}
              </p>
            )}
          </div>
          
          {/* Acciones rápidas */}
          <div className="flex items-center space-x-2">
            {/* Indicador de conexión */}
            {isOffline && (
              <div className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                <span className="text-xs text-red-700 dark:text-red-400">Offline</span>
              </div>
            )}
            
            {/* Botón de refresh */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Notificaciones (solo en desktop) */}
            {!isMobile && (
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )

  // Indicador de gestos (solo en móvil)
  const GestureIndicator = () => {
    if (!isMobile || !swipeDirection) return null
    
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-sm">
          Swipe {swipeDirection === 'left' ? '←' : '→'} {swipeDirection === 'left' ? 'Cerrar' : 'Abrir'} menú
        </div>
      </div>
    )
  }

  // Clases adaptativas según dispositivo
  const getResponsiveClasses = useCallback(() => {
    let classes = 'transition-all duration-300'
    
    if (isMobile) {
      classes += ' px-4 py-2'
      classes += ' text-sm'
    } else if (isTablet) {
      classes += ' px-6 py-4'
      classes += ' text-base'
    } else {
      classes += ' px-8 py-6'
      classes += ' text-base'
    }
    
    return classes
  }, [isMobile, isTablet])

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${getResponsiveClasses()} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header adaptable */}
      <AdaptiveHeader />
      
      {/* Sidebar adaptable */}
      <AdaptiveSidebar />
      
      {/* Contenido principal */}
      <main className={`${isMobile ? 'mb-16' : ''} ${isMobile || isTablet ? '' : 'ml-80'}`}>
        {/* Indicador de dispositivo (solo para desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-20 right-4 z-20 bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-xs">
            {isMobile ? '📱 Móvil' : isTablet ? '📱 Tablet' : '🖥️ Desktop'}
            {orientation === 'landscape' ? ' ↻' : ' ↕'}
          </div>
        )}
        
        {/* Indicador de gestos */}
        <GestureIndicator />
        
        {/* Contenido children */}
        <div className="max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
      
      {/* Navegación móvil */}
      {isMobile && <MobileNavigation />}
      
      {/* Script para accesibilidad WCAG */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Mejorar accesibilidad WCAG 2.1
          document.addEventListener('DOMContentLoaded', function() {
            // Skip to main content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Saltar al contenido principal';
            skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded';
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Aumentar contraste para usuarios con preferencia
            if (window.matchMedia('(prefers-contrast: high)').matches) {
              document.documentElement.classList.add('high-contrast');
            }
            
            // Reducir movimiento para usuarios con preferencia
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              document.documentElement.classList.add('reduce-motion');
            }
          });
        `
      }} />
    </div>
  )
}

// Hook personalizado para detectar gestos
export const useGestures = () => {
  const [gestures, setGestures] = useState({
    swipeLeft: false,
    swipeRight: false,
    swipeUp: false,
    swipeDown: false,
    pinch: false,
    tap: false
  })

  const handleGesture = useCallback((gesture) => {
    setGestures(prev => ({ ...prev, [gesture]: true }))
    setTimeout(() => {
      setGestures(prev => ({ ...prev, [gesture]: false }))
    }, 300)
  }, [])

  return { gestures, handleGesture }
}

// Hook para responsive design
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait'
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait'
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', updateScreenSize)

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener('orientationchange', updateScreenSize)
    }
  }, [])

  return screenSize
}

export default ResponsiveWrapper