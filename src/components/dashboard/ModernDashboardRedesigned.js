import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import DatabaseCompanySummary from './DatabaseCompanySummary'
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'
import {
  FolderIcon,
  DocumentIcon,
  CpuChipIcon,
  BellIcon,
  CloudIcon,
  HomeIcon
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

  const loadDashboardData = useCallback(async () => {
    console.log('🚀 Dashboard: Iniciando carga simplificada')
    
    if (!user || !userProfile) {
      console.log('Dashboard: Esperando usuario y perfil...')
      return
    }

    console.log('Dashboard: Cargando datos para usuario:', user.id)
    
    try {
      setLoading(true)
      
      // Simplificación: Obtener solo los empleados para el contador de carpetas
      const employees = await inMemoryEmployeeService.getEmployees()
      console.log('📊 Dashboard: Empleados cargados:', employees.length)
      
      // Contar empleados con email (cada uno representa una carpeta)
      const employeeEmails = employees
        .filter(emp => emp.email)
        .map(emp => emp.email)
      
      const totalFolders = employeeEmails.length
      
      // Para contar documentos reales, necesitamos verificar las carpetas de empleados
      let totalFiles = 0
      try {
        // Importar el servicio de carpetas de empleados
        const employeeFolderService = await import('../../services/employeeFolderService.js')
        const folderService = employeeFolderService.default
        
        // Contar documentos en una muestra de carpetas para evitar sobrecarga
        const sampleSize = Math.min(50, employeeEmails.length) // Muestrear máximo 50 carpetas
        const sampleEmails = employeeEmails.slice(0, sampleSize)
        
        let sampleFileCount = 0
        for (const email of sampleEmails) {
          try {
            const folder = await folderService.getEmployeeFolder(email)
            if (folder?.knowledgeBase) {
              const kb = folder.knowledgeBase
              sampleFileCount += (kb.faqs?.length || 0) +
                             (kb.documents?.length || 0) +
                             (kb.policies?.length || 0) +
                             (kb.procedures?.length || 0)
            }
          } catch (error) {
            // Ignorar errores individuales
          }
        }
        
        // Calcular el total basado en el promedio de la muestra
        if (sampleSize > 0) {
          const avgFilesPerFolder = sampleFileCount / sampleSize
          totalFiles = Math.round(avgFilesPerFolder * totalFolders)
        }
        
        console.log('📊 Dashboard: Muestreo de', sampleSize, 'carpetas')
        console.log('📊 Dashboard: Archivos en muestra:', sampleFileCount)
        console.log('📊 Dashboard: Promedio por carpeta:', sampleFileCount / sampleSize)
        
      } catch (error) {
        console.log('📊 Dashboard: Error contando documentos, usando 0:', error.message)
        totalFiles = 0
      }
      
      console.log('📊 Dashboard: Total carpetas:', totalFolders)
      console.log('📊 Dashboard: Total archivos calculados:', totalFiles)
      
      // Actualizar estados
      setStats({
        totalFolders,
        totalFiles,
        storageUsed: totalFiles * 1024, // 1KB por archivo
        tokensUsed: 0,
        tokenLimit: 1000
      })
      
      setPercentages({
        folders: 100, // Siempre 100% ya que mostramos todos los empleados
        files: 0
      })
      
      console.log('✅ Dashboard: Carga completada correctamente')
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      // Establecer valores por defecto en caso de error
      setStats({
        totalFolders: 0,
        totalFiles: 0,
        storageUsed: 0,
        tokensUsed: 0,
        tokenLimit: 1000
      })
      setPercentages({
        folders: 0,
        files: 0
      })
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con diseño azul y amarillo */}
      <div className="bg-white shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  {getGreeting()}, <span className="font-medium text-blue-600">
                    {userProfile?.full_name || userProfile?.email || 'Usuario'}
                  </span>
                </h1>
                <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Estado del sistema</p>
                <p className="text-xs text-green-600">Operativo</p>
              </div>
              <div className="relative">
                <BellIcon className="w-5 h-5 text-gray-400" />
                {activeNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas principales - Diseño profesional para fondo blanco */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FolderIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalFolders}</span>
            </div>
            <p className="text-sm text-gray-600">Carpetas</p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: `${percentages.folders}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <DocumentIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalFiles}</span>
            </div>
            <p className="text-sm text-gray-600">Documentos</p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{width: `${percentages.files}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.tokensUsed.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600">Tokens IA</p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{width: `${Math.min((stats.tokensUsed / stats.tokenLimit) * 100, 100)}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <CloudIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{formatBytes(stats.storageUsed)}</span>
            </div>
            <p className="text-sm text-gray-600">Almacenamiento</p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-1000 ${
                getStoragePercentage() >= 90 ? 'bg-red-500' :
                getStoragePercentage() >= 70 ? 'bg-orange-500' : 'bg-green-500'
              }`} style={{width: `${Math.min(getStoragePercentage(), 100)}%`}}></div>
            </div>
          </div>
        </div>

        {/* Resumen Empresarial - Diseño azul y amarillo */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
          <DatabaseCompanySummary />
        </div>
      </div>
    </div>
  )
}

export default ModernDashboardRedesigned