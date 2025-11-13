import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.js'
import { db, supabase } from '../../lib/supabase.js'
import googleDriveService from '../../lib/googleDrive.js'
import embeddingsService from '../../lib/embeddings.js'
import {
  FolderIcon,
  DocumentIcon,
  CloudIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner.js'
import TokenUsage from '../embeddings/TokenUsage.js'
import TemplateDownload from '../templates/TemplateDownload.js'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, userProfile } = useAuth()
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalFiles: 0,
    storageUsed: 0,
    tokensUsed: 0
  })

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
    
    if (user && userProfile) {
      // Debounce para evitar llamadas excesivas
      loadTimeout = setTimeout(() => {
        loadDashboardData()
      }, 300)
    } else if (user && !userProfile) {
      // Usuario existe pero userProfile aún no se ha cargado, mantener loading
      console.log('Dashboard: User exists but userProfile not loaded yet')
    } else {
      // Si no hay usuario, asegurar que loading sea false
      setLoading(false)
    }
    
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
    }
  }, [user, userProfile])

  // Efecto separado para verificar Google Drive cuando userProfile cambie
  useEffect(() => {
    if (userProfile) {
      checkGoogleDriveConnection()
    }
  }, [userProfile])

  const loadDashboardData = async () => {
    if (!user) {
      console.log('Dashboard: No user found, skipping load')
      setLoading(false)
      return
    }
    
    if (!userProfile) {
      console.log('Dashboard: UserProfile not available yet, skipping load')
      return
    }
    
    console.log('Dashboard: Starting to load data for user:', user.id, 'with plan:', userProfile.current_plan_id)
    
    try {
      setLoading(true)
      
      // Cargar estadísticas reales desde las tablas correspondientes
      console.log('Dashboard: Loading real stats from database')
      
      let realStats = {
        totalFolders: 0,
        totalFiles: 0,
        storageUsed: 0,
        tokensUsed: 0,
        tokenLimit: 0
      }
      
      // Obtener carpetas desde carpetas_usuario usando columna administrador
      try {
        const { data: foldersData, error: foldersError } = await db.userFolders.getByAdministrador(user.email)
        if (!foldersError && foldersData) {
          realStats.totalFolders = foldersData.length
          console.log('Dashboard: Folders loaded:', realStats.totalFolders)
        }
      } catch (folderError) {
        console.error('Error loading folders:', folderError)
      }
      
      // Obtener archivos contando carpetas_usuario donde administrador = user.email
      try {
        const { data: userFoldersData, error: userFoldersError } = await supabase
          .from('carpetas_usuario')
          .select('*')
          .eq('administrador', user.email)
        
        if (!userFoldersError && userFoldersData) {
          realStats.totalFiles = userFoldersData.length
          console.log('Dashboard: Total files (carpetas_usuario) loaded:', realStats.totalFiles)
        }
      } catch (fileError) {
        console.error('Error loading files:', fileError)
      }
      
      // Calcular almacenamiento desde documentos_entrenador (sin cargar embeddings)
      try {
        const { data: chunksData, error: chunksError } = await supabase
          .from('documentos_entrenador')
          .select('id')
          .eq('entrenador', user.email)

        if (!chunksError && chunksData) {
          // Estimación simple basada en número de documentos
          realStats.storageUsed = chunksData.length * 1024 // 1KB por documento estimado
          console.log('Dashboard: Storage estimated:', realStats.storageUsed, 'bytes for', chunksData.length, 'documents')
        }
      } catch (storageError) {
        console.error('Error calculating storage:', storageError)
      }
      
      // Obtener límite de tokens del plan actual PRIMERO
      let planTokenLimit = 1000 // valor por defecto para plan gratuito
      console.log('Dashboard: UserProfile current_plan_id:', userProfile.current_plan_id)
      
      if (userProfile.current_plan_id) {
        try {
          console.log('Dashboard: Fetching plan data for plan ID:', userProfile.current_plan_id)
          const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('token_limit_usage')
            .eq('id', userProfile.current_plan_id)
            .maybeSingle()
          
          console.log('Dashboard: Plan query result:', { planData, planError })
          
          if (!planError && planData) {
            planTokenLimit = planData.token_limit_usage || 1000
            console.log('Dashboard: Plan token limit loaded:', planTokenLimit)
          } else {
            console.warn('Dashboard: No plan data found or error occurred, using default limit')
          }
        } catch (planError) {
          console.error('Error loading plan token limit:', planError)
        }
      } else {
        console.log('Dashboard: No current_plan_id found, using default token limit:', planTokenLimit)
      }
      
      // Obtener tokens usados y establecer el límite correcto
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from('user_tokens_usage')
          .select('tokens_used')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!tokenError && tokenData) {
          realStats.tokensUsed = tokenData.tokens_used || 0
          console.log('Dashboard: Tokens used loaded:', realStats.tokensUsed)
        }
        // Usar SIEMPRE el límite del plan, no el de user_tokens_usage
        realStats.tokenLimit = planTokenLimit
        console.log('Dashboard: Using plan token limit:', realStats.tokenLimit)
      } catch (tokenError) {
        console.error('Error loading tokens:', tokenError)
        realStats.tokenLimit = planTokenLimit
      }
      
      setStats(realStats)
      
      // La verificación de Google Drive se maneja automáticamente en useEffect
      
      
      console.log('Dashboard: Data loading completed successfully')
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // No mostrar toast de error para evitar spam al usuario
      console.log('Dashboard cargado con datos básicos debido a errores de conectividad')
    } finally {
      console.log('Dashboard: Setting loading to false')
      setLoading(false)
    }
  }

  const checkGoogleDriveConnection = () => {
    // Usar la información ya disponible en userProfile desde AuthContext
    // que incluye las credenciales de Google Drive
    const isConnected = !!(userProfile?.google_refresh_token && userProfile.google_refresh_token.trim() !== '')
    setIsGoogleDriveConnected(isConnected)
    console.log('Dashboard: Google Drive connection status:', isConnected)
  }

  const handleConnectGoogleDrive = () => {
    try {
      const authUrl = googleDriveService.generateAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error getting auth URL:', error)
      toast.error('Error al conectar con Google Drive')
    }
  }

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

  if (loading) {
    return <LoadingSpinner text="Cargando dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-engage-black mb-2">
              ¡Bienvenido, {userProfile?.name || user?.email}!
            </h1>
            <p className="text-gray-600">
              Gestiona tus planes, carpetas y archivos desde tu dashboard personal.
            </p>
          </div>
          <div className="ml-6">
            <a
              href="https://t.me/staffhubbeta_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-engage-blue hover:bg-engage-yellow text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Ir al Bot
            </a>
          </div>
        </div>
      </div>


      {!isGoogleDriveConnected && (
        <div className="bg-engage-blue/10 border border-engage-blue/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudIcon className="h-5 w-5 text-engage-blue mr-3" />
              <div>
                <h3 className="text-sm font-medium text-engage-blue">
                  Google Drive no conectado
                </h3>
                <p className="text-sm text-engage-blue mt-1">
                  Conecta tu cuenta de Google Drive para gestionar archivos.
                </p>
              </div>
            </div>
            <button
              onClick={handleConnectGoogleDrive}
              className="btn-primary text-sm"
            >
              Conectar Drive
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-engage-blue/10">
              <FolderIcon className="h-6 w-6 text-engage-blue" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Carpetas</p>
              <p className="text-2xl font-bold text-engage-black">{stats.totalFolders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-engage-yellow/10">
              <DocumentIcon className="h-6 w-6 text-engage-yellow" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archivos</p>
              <p className="text-2xl font-bold text-engage-black">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Almacenamiento</p>
              <p className="text-2xl font-bold text-engage-black">{formatBytes(stats.storageUsed)}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Usado: {formatBytes(stats.storageUsed)}</span>
                  <span>Límite: {formatBytes(1024 * 1024 * 1024)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      getStoragePercentage() >= 90 ? 'bg-red-500' :
                      getStoragePercentage() >= 70 ? 'bg-yellow-500' : 'bg-engage-blue'
                    }`}
                    style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{getStoragePercentage().toFixed(1)}% usado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-engage-yellow/10">
              <ChartBarIcon className="h-6 w-6 text-engage-yellow" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Tokens Usados</p>
              <p className="text-2xl font-bold text-engage-black">{stats.tokensUsed.toLocaleString()}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Usados: {stats.tokensUsed.toLocaleString()}</span>
                  <span>Límite: 1,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      (stats.tokensUsed / 1000) * 100 >= 90 ? 'bg-red-500' :
                      (stats.tokensUsed / 1000) * 100 >= 70 ? 'bg-yellow-500' : 'bg-engage-yellow'
                    }`}
                    style={{ width: `${Math.min((stats.tokensUsed / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.tokensUsed / 1000) * 100).toFixed(1)}% usado •
                  {Math.max(0, 1000 - stats.tokensUsed).toLocaleString()} disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Panel de Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-engage-black mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <Link
              to="/folders"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-engage-blue/5 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 text-engage-blue mr-3" />
              <span className="text-sm font-medium text-engage-black">Crear Carpeta</span>
            </Link>
            
            <Link
              to="/folders"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-engage-blue/5 transition-colors duration-200"
            >
              <FolderIcon className="h-5 w-5 text-engage-blue mr-3" />
              <span className="text-sm font-medium text-engage-black">Ver Carpetas</span>
            </Link>
            
            <Link
              to="/files"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-engage-blue/5 transition-colors duration-200"
            >
              <DocumentIcon className="h-5 w-5 text-engage-blue mr-3" />
              <span className="text-sm font-medium text-engage-black">Subir Archivos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Plantilla de Rutina */}
      <div className="mt-8">
        <TemplateDownload />
      </div>


      {/* Sección de Uso de Tokens */}
      <div className="mt-8">
        <TokenUsage />
      </div>
    </div>
  )
}

export default Dashboard