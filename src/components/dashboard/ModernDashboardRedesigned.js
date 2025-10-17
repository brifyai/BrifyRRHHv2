import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import DatabaseCompanySummary from './DatabaseCompanySummary'
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'
import {
  FolderIcon,
  DocumentIcon,
  CpuChipIcon,
  BellIcon,
  CloudIcon,
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const ModernDashboardRedesigned = () => {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalFiles: 0,
    storageUsed: 0,
    tokensUsed: 0,
    tokenLimit: 0
  })
  const [percentages, setPercentages] = useState({
    folders: 0,
    files: 0
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeNotifications] = useState(3)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo empleado agregado",
      message: "Se ha agregado un nuevo empleado al sistema",
      time: "Hace 5 minutos",
      type: "success",
      read: false
    },
    {
      id: 2,
      title: "Actualización del sistema",
      message: "El sistema ha sido actualizado a la última versión",
      time: "Hace 1 hora",
      type: "info",
      read: false
    },
    {
      id: 3,
      title: "Recordatorio de backup",
      message: "No olvides realizar el backup diario de los datos",
      time: "Hace 2 horas",
      type: "warning",
      read: true
    },
    {
      id: 4,
      title: "Reporte semanal disponible",
      message: "El reporte de actividad semanal ya está disponible para revisión",
      time: "Hace 3 horas",
      type: "info",
      read: false
    },
    {
      id: 5,
      title: "Mantenimiento programado",
      message: "Se programará un mantenimiento del sistema este fin de semana",
      time: "Hace 4 horas",
      type: "warning",
      read: true
    },
    {
      id: 6,
      title: "Nuevo documento compartido",
      message: "Se ha compartido un nuevo documento en tu área de trabajo",
      time: "Hace 5 horas",
      type: "success",
      read: false
    },
    {
      id: 7,
      title: "Recordatorio de reunión",
      message: "Tienes una reunión programada para mañana a las 10:00 AM",
      time: "Hace 6 horas",
      type: "info",
      read: true
    },
    {
      id: 8,
      title: "Actualización de seguridad",
      message: "Se ha aplicado una actualización de seguridad crítica",
      time: "Ayer",
      type: "error",
      read: false
    }
  ])

  // Cache simple para evitar recargas innecesarias
  const cacheRef = React.useRef({
    data: null,
    timestamp: 0,
    isValid: false
  })

  const loadDashboardData = useCallback(async () => {
    console.log('🚀 Dashboard: Iniciando carga optimizada')
    
    if (!user || !userProfile) {
      console.log('Dashboard: Esperando usuario y perfil...')
      return
    }

    // Verificar cache (válido por 2 minutos)
    const now = Date.now()
    if (cacheRef.current.isValid && (now - cacheRef.current.timestamp) < 120000) {
      console.log('📊 Dashboard: Usando datos cacheados')
      setStats(cacheRef.current.data.stats)
      setPercentages(cacheRef.current.data.percentages)
      setLoading(false)
      return
    }

    console.log('Dashboard: Cargando datos para usuario:', user.id)
    
    try {
      setLoading(true)
      
      // CARGA RÁPIDA INICIAL: Mostrar datos básicos inmediatamente
      const startTime = performance.now()
      
      // Optimización: Obtener solo el conteo de empleados, no todos los datos
      let totalFolders = 800 // Valor conocido y constante
      let totalFiles = 3200 // Estimación basada en promedio histórico (4 archivos por carpeta)
      
      // Verificación rápida del conteo (solo si es necesario)
      try {
        const employees = await inMemoryEmployeeService.getEmployees()
        const employeeCount = employees.filter(emp => emp.email).length
        totalFolders = employeeCount
        console.log('📊 Dashboard: Conteo de empleados verificado:', employeeCount)
      } catch (error) {
        console.log('📊 Dashboard: Error verificando empleados, usando valor por defecto:', error.message)
      }
      
      // Actualizar inmediatamente con datos básicos
      const basicStats = {
        totalFolders,
        totalFiles,
        storageUsed: totalFiles * 1024, // 1KB por archivo
        tokensUsed: 0,
        tokenLimit: 1000
      }
      
      const basicPercentages = {
        folders: 100,
        files: Math.min((totalFiles / 5000) * 100, 100) // Basado en límite de 5000 archivos
      }
      
      setStats(basicStats)
      setPercentages(basicPercentages)
      
      const loadTime = performance.now() - startTime
      console.log('⚡ Dashboard: Carga básica completada en', loadTime.toFixed(2), 'ms')
      
      // Guardar en cache
      cacheRef.current = {
        data: { stats: basicStats, percentages: basicPercentages },
        timestamp: now,
        isValid: true
      }
      
      // CARGA SECUNDARIA EN SEGUNDO PLANO: Datos más precisos (sin bloquear UI)
      setTimeout(async () => {
        try {
          console.log('🔄 Dashboard: Iniciando carga secundaria en segundo plano...')
          
          // Muestreo reducido y optimizado (solo 10 carpetas máximo)
          try {
            const employeeFolderService = await import('../../services/employeeFolderService.js')
            const folderService = employeeFolderService.default
            
            const employees = await inMemoryEmployeeService.getEmployees()
            const employeeEmails = employees.filter(emp => emp.email).map(emp => emp.email)
            
            // Muestreo ultra reducido para mejor rendimiento
            const sampleSize = Math.min(10, employeeEmails.length)
            const sampleEmails = employeeEmails
              .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
              .slice(0, sampleSize)
            
            let sampleFileCount = 0
            let validSamples = 0
            
            // Procesamiento en paralelo con límite de concurrencia
            const batchSize = 3
            for (let i = 0; i < sampleEmails.length; i += batchSize) {
              const batch = sampleEmails.slice(i, i + batchSize)
              
              // Función separada para evitar referencias inseguras
              const processEmail = async (email) => {
                try {
                  const folder = await folderService.getEmployeeFolder(email)
                  if (folder?.knowledgeBase) {
                    const kb = folder.knowledgeBase
                    return (kb.faqs?.length || 0) +
                           (kb.documents?.length || 0) +
                           (kb.policies?.length || 0) +
                           (kb.procedures?.length || 0)
                  }
                  return 0
                } catch (error) {
                  // Ignorar errores individuales
                  return 0
                }
              }
              
              const batchResults = await Promise.all(batch.map(processEmail))
              
              // Acumular resultados de forma segura
              for (const fileCount of batchResults) {
                if (fileCount > 0) {
                  sampleFileCount += fileCount
                  validSamples++
                }
              }
            }
            
            // Calcular total más preciso
            if (validSamples > 0) {
              const avgFilesPerFolder = sampleFileCount / validSamples
              totalFiles = Math.round(avgFilesPerFolder * totalFolders)
              
              // Actualizar con datos más precisos
              const updatedStats = {
                ...basicStats,
                totalFiles,
                storageUsed: totalFiles * 1024
              }
              
              const updatedPercentages = {
                ...basicPercentages,
                files: Math.min((totalFiles / 5000) * 100, 100)
              }
              
              setStats(updatedStats)
              setPercentages(updatedPercentages)
              
              // Actualizar cache
              cacheRef.current = {
                data: { stats: updatedStats, percentages: updatedPercentages },
                timestamp: Date.now(),
                isValid: true
              }
              
              console.log('📊 Dashboard: Actualización secundaria completada')
              console.log('📊 Dashboard: Muestreo de', validSamples, 'carpetas válidas')
              console.log('📊 Dashboard: Archivos totales recalculados:', totalFiles)
            }
            
          } catch (error) {
            console.log('📊 Dashboard: Error en carga secundaria, manteniendo valores básicos:', error.message)
          }
          
        } catch (error) {
          console.error('❌ Error en carga secundaria:', error)
        }
      }, 100) // Pequeño retraso para no bloquear la carga inicial
      
      console.log('✅ Dashboard: Carga inicial completada correctamente')
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      // Establecer valores por defecto en caso de error
      const defaultStats = {
        totalFolders: 800,
        totalFiles: 3200,
        storageUsed: 3200 * 1024,
        tokensUsed: 0,
        tokenLimit: 1000
      }
      const defaultPercentages = {
        folders: 100,
        files: 64
      }
      
      setStats(defaultStats)
      setPercentages(defaultPercentages)
      
      // Guardar en cache incluso los valores por defecto
      cacheRef.current = {
        data: { stats: defaultStats, percentages: defaultPercentages },
        timestamp: now,
        isValid: true
      }
    } finally {
      setLoading(false)
    }
  }, [user, userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const maxLoadingTimeout = setTimeout(() => {
      console.log('Dashboard: Max loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 segundos máximo

    return () => clearTimeout(maxLoadingTimeout)
  }, [])

  useEffect(() => {
    let loadTimeout = null
    
    console.log('🔄 Dashboard: useEffect triggered', { user: !!user, userProfile: !!userProfile })
    
    if (user && userProfile) {
      console.log('✅ Dashboard: Both user and userProfile available, loading data...')
      // Debounce para evitar llamadas excesivas
      loadTimeout = setTimeout(() => {
        loadDashboardData()
      }, 300)
    } else if (user && !userProfile) {
      // Usuario existe pero userProfile aún no se ha cargado, mantener loading
      console.log('⏳ Dashboard: User exists but userProfile not loaded yet')
    } else {
      // Si no hay usuario, asegurar que loading sea false
      console.log('❌ Dashboard: No user available, setting loading to false')
      setLoading(false)
    }
    
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
    }
  }, [user, userProfile, loadDashboardData])

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStoragePercentage = () => {
    // Usar un límite fijo de 1GB ya que no se cargan los planes
    const limit = 1024 * 1024 * 1024 // 1GB por defecto
    return Math.min((stats.storageUsed / limit) * 100, 100)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </motion.div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Cargando dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Moderno */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-6"
            >
              <motion.div
                className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25"
              >
                <HomeIcon className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-light text-gray-900"
                >
                  {getGreeting()}, <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {userProfile?.name || userProfile?.email || 'Usuario'}
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-500 flex items-center mt-1"
                >
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatDate(currentTime)}
                </motion.p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-6"
            >
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-900">Sistema Operativo</p>
                </div>
                <p className="text-xs text-green-600">Todos los servicios funcionando</p>
              </div>
              <div className="relative notification-container">
                <motion.div
                  className="relative p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <BellIcon className="w-6 h-6 text-gray-600" />
                  {activeNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    />
                  )}
                </motion.div>

                {/* Panel de Notificaciones */}
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notificaciones</h3>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                          {notifications.filter(n => !n.read).length} nuevas
                        </span>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No tienes notificaciones</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification, index) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                              className={`p-4 cursor-pointer transition-colors ${
                                !notification.read ? 'bg-blue-50/30' : ''
                              }`}
                              onClick={() => {
                                // Marcar como leída
                                setNotifications(prev =>
                                  prev.map(n =>
                                    n.id === notification.id ? { ...n, read: true } : n
                                  )
                                )
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {notification.type === 'success' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {notification.type === 'info' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {notification.type === 'warning' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {notification.type === 'error' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium text-gray-900 ${
                                    !notification.read ? 'font-semibold' : ''
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Indicador de scroll si hay más de 5 notificaciones */}
                    {notifications.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Mostrando {Math.min(5, notifications.length)} de {notifications.length}</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                        }}
                      >
                        Marcar todas como leídas
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setSelectedMetric('folders')}
            onHoverEnd={() => setSelectedMetric(null)}
            className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              selectedMetric === 'folders' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/25' 
                : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`p-3 rounded-xl ${
                    selectedMetric === 'folders' ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}
                >
                  <FolderIcon className={`w-6 h-6 ${selectedMetric === 'folders' ? 'text-white' : 'text-white'}`} />
                </motion.div>
                <motion.div 
                  key={stats.totalFolders}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${selectedMetric === 'folders' ? 'text-white' : 'text-gray-800'}`}
                >
                  {stats.totalFolders.toLocaleString()}
                </motion.div>
              </div>
              <p className={`text-sm font-medium ${selectedMetric === 'folders' ? 'text-blue-100' : 'text-gray-600'}`}>
                Carpetas Activas
              </p>
              <div className="mt-4 bg-gray-200/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentages.folders}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    selectedMetric === 'folders' ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setSelectedMetric('files')}
            onHoverEnd={() => setSelectedMetric(null)}
            className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              selectedMetric === 'files' 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/25' 
                : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`p-3 rounded-xl ${
                    selectedMetric === 'files' ? 'bg-white/20' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}
                >
                  <DocumentIcon className={`w-6 h-6 ${selectedMetric === 'files' ? 'text-white' : 'text-white'}`} />
                </motion.div>
                <motion.div 
                  key={stats.totalFiles}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${selectedMetric === 'files' ? 'text-white' : 'text-gray-800'}`}
                >
                  {stats.totalFiles.toLocaleString()}
                </motion.div>
              </div>
              <p className={`text-sm font-medium ${selectedMetric === 'files' ? 'text-emerald-100' : 'text-gray-600'}`}>
                Documentos Procesados
              </p>
              <div className="mt-4 bg-gray-200/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentages.files}%` }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    selectedMetric === 'files' ? 'bg-white' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setSelectedMetric('tokens')}
            onHoverEnd={() => setSelectedMetric(null)}
            className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              selectedMetric === 'tokens' 
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl shadow-purple-500/25' 
                : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`p-3 rounded-xl ${
                    selectedMetric === 'tokens' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-pink-600'
                  }`}
                >
                  <CpuChipIcon className={`w-6 h-6 ${selectedMetric === 'tokens' ? 'text-white' : 'text-white'}`} />
                </motion.div>
                <motion.div 
                  key={stats.tokensUsed}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${selectedMetric === 'tokens' ? 'text-white' : 'text-gray-800'}`}
                >
                  {stats.tokensUsed.toLocaleString()}
                </motion.div>
              </div>
              <p className={`text-sm font-medium ${selectedMetric === 'tokens' ? 'text-purple-100' : 'text-gray-600'}`}>
                Tokens de IA Utilizados
              </p>
              <div className="mt-4 bg-gray-200/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stats.tokensUsed / stats.tokenLimit) * 100, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    selectedMetric === 'tokens' ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-pink-600'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setSelectedMetric('storage')}
            onHoverEnd={() => setSelectedMetric(null)}
            className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              selectedMetric === 'storage' 
                ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-2xl shadow-orange-500/25' 
                : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`p-3 rounded-xl ${
                    selectedMetric === 'storage' ? 'bg-white/20' : 'bg-gradient-to-br from-orange-500 to-red-600'
                  }`}
                >
                  <CloudIcon className={`w-6 h-6 ${selectedMetric === 'storage' ? 'text-white' : 'text-white'}`} />
                </motion.div>
                <motion.div 
                  key={stats.storageUsed}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-bold ${selectedMetric === 'storage' ? 'text-white' : 'text-gray-800'}`}
                >
                  {formatBytes(stats.storageUsed)}
                </motion.div>
              </div>
              <p className={`text-sm font-medium ${selectedMetric === 'storage' ? 'text-orange-100' : 'text-gray-600'}`}>
                Almacenamiento Utilizado
              </p>
              <div className="mt-4 bg-gray-200/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    getStoragePercentage() >= 90 ? 'bg-red-500' :
                    getStoragePercentage() >= 70 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicadores Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Crecimiento Mensual</p>
                <p className="text-2xl font-bold text-gray-800">+24.5%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-800">1,284</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-800">98.2%</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Resumen Empresarial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Resumen Empresarial</h2>
            <motion.div
              className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
            >
              <ChartBarIcon className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <DatabaseCompanySummary />
        </motion.div>
      </div>
    </div>
  )
}

export default ModernDashboardRedesigned