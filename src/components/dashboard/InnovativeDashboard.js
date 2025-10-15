import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { db, supabase } from '../../lib/supabase'
import googleDriveService from '../../lib/googleDrive'
import {
  UserIcon,
  CreditCardIcon,
  FolderIcon,
  DocumentIcon,
  CloudIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'
import TemplateDownload from '../templates/TemplateDownload'
import DashboardResumen from './DashboardResumen'
import CommunicationStats from './CommunicationStats'
import toast from 'react-hot-toast'

const InnovativeDashboard = () => {
  const { user, userProfile, hasActivePlan, getDaysRemaining } = useAuth()
  const [payments, setPayments] = useState([])
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalFiles: 0,
    storageUsed: 0,
    tokensUsed: 0
  })
  const [userExtensions, setUserExtensions] = useState([])
  const [plans, setPlans] = useState([])

  const loadDashboardData = useCallback(async () => {
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
      
      // Cargar planes disponibles
      console.log('Dashboard: Loading plans')
      try {
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
        if (!plansError && plansData) {
          console.log('Dashboard: Plans loaded successfully:', plansData.length)
          setPlans(plansData)
        }
      } catch (planError) {
        console.error('Network error loading plans:', planError)
      }
      
      // Cargar extensiones del usuario
      console.log('Dashboard: Loading user extensions')
      try {
        const { data: extensionsData, error: extensionsError } = await supabase
          .from('plan_extensiones')
          .select(`
            *,
            extensiones (
              id,
              name,
              name_es,
              description,
              description_es,
              price
            )
          `)
          .eq('user_id', user.id)
        
        if (!extensionsError && extensionsData) {
          setUserExtensions(extensionsData)
        }
      } catch (extensionError) {
        console.error('Network error loading user extensions:', extensionError)
      }
      
      // Cargar historial de pagos con manejo de errores mejorado
      console.log('Dashboard: Loading payment history')
      try {
        const { data: paymentsData, error: paymentsError } = await db.payments.getByUserId(user.id)
        if (!paymentsError && paymentsData) {
          console.log('Dashboard: Payments loaded successfully:', paymentsData.length)
          setPayments(paymentsData)
        } else if (paymentsError) {
          console.error('Error loading payments:', paymentsError)
          setPayments([]) // Establecer array vacío en caso de error
        }
      } catch (paymentError) {
        console.error('Network error loading payments:', paymentError)
        setPayments([]) // Establecer array vacío en caso de error de red
      }
      
      console.log('Dashboard: Data loading completed successfully')
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // No mostrar toast de error para evitar spam al usuario
      console.log('Dashboard cargado con datos básicos debido a errores de conectividad')
    } finally {
      console.log('Dashboard: Setting loading to false')
      setLoading(false)
    }
  }, [user, userProfile])

  const checkGoogleDriveConnection = useCallback(() => {
    // Usar la información ya disponible en userProfile desde AuthContext
    // que incluye las credenciales de Google Drive
    const isConnected = !!(userProfile?.google_refresh_token && userProfile.google_refresh_token.trim() !== '')
    setIsGoogleDriveConnected(isConnected)
    console.log('Dashboard: Google Drive connection status:', isConnected)
  }, [userProfile])

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
  }, [user, userProfile, loadDashboardData])

  // Efecto separado para verificar Google Drive cuando userProfile cambie
  useEffect(() => {
    if (userProfile) {
      checkGoogleDriveConnection()
    }
  }, [userProfile, checkGoogleDriveConnection])

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanName = () => {
    if (!userProfile?.current_plan_id) return 'Sin plan'
    const plan = plans.find(p => p.id === userProfile.current_plan_id)
    return plan?.name || 'Plan desconocido'
  }

  const getStoragePercentage = () => {
    if (!userProfile?.current_plan_id) return 0
    const plan = plans.find(p => p.id === userProfile.current_plan_id)
    const limit = plan?.storage_limit_bytes || 1024 * 1024 * 1024 // 1GB por defecto
    return Math.min((stats.storageUsed / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando" inline={true} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado con información del usuario */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de {userProfile?.name || user?.email}
            </h1>
            <p className="text-blue-600 font-medium">
              Panel de control personalizado
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://t.me/brifybeta_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.788-1.48-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Chat Telegram
            </a>
            <a
              href="https://wa.me/56987654321"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat WhatsApp
            </a>
          </div>
        </div>

        {/* Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {!hasActivePlan() && (
            <div className="bg-gradient-to-r from-yellow-100 to-blue-100 border border-yellow-300 rounded-xl p-5 shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Plan Inactivo
                  </h3>
                  <p className="text-gray-700 mt-1">
                    Adquiere un plan para acceder a todas las funcionalidades.
                  </p>
                  <Link
                    to="/plans"
                    className="mt-3 inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors duration-200"
                  >
                    Ver Planes
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!isGoogleDriveConnected && (
            <div className="bg-gradient-to-r from-blue-100 to-gray-100 border border-blue-300 rounded-xl p-5 shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CloudIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-blue-600">
                    Google Drive
                  </h3>
                  <p className="text-blue-600 mt-1">
                    No conectado
                  </p>
                  <button
                    onClick={handleConnectGoogleDrive}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200"
                  >
                    Conectar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas principales en cards innovadoras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Carpetas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFolders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DocumentIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Archivos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CpuChipIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tokens Usados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tokensUsed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Almacenamiento</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.storageUsed)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen por Empresa con métricas de comunicación */}
        <div className="mb-8">
          <DashboardResumen />
        </div>

        {/* Estadísticas de comunicación y progreso de almacenamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Estadísticas de comunicación */}
          <CommunicationStats />
          
          {/* Progreso de almacenamiento */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-3 text-blue-600" />
              Uso de Almacenamiento
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                  <span>Almacenamiento</span>
                  <span>{getStoragePercentage().toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      getStoragePercentage() >= 90 ? 'bg-red-500' : 
                      getStoragePercentage() >= 70 ? 'bg-yellow-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatBytes(stats.storageUsed)}</span>
                  <span>{formatBytes(1024 * 1024 * 1024)}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                  <span>Tokens Usados</span>
                  <span>
                    {stats.tokenLimit > 0 ? `${((stats.tokensUsed / stats.tokenLimit) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (stats.tokensUsed / (stats.tokenLimit || 1000)) * 100 >= 90 ? 'bg-red-500' : 
                      (stats.tokensUsed / (stats.tokenLimit || 1000)) * 100 >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((stats.tokensUsed / (stats.tokenLimit || 1000)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{stats.tokensUsed.toLocaleString()} tokens</span>
                  <span>{stats.tokenLimit.toLocaleString()} tokens</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Plan Actual</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{getPlanName()}</span>
                {hasActivePlan() ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo ({getDaysRemaining()} días)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Historial de Compras y Acciones Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Historial de Compras */}
          {payments.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-600" />
                Historial de Compras
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.slice(0, 3).map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.plans?.name || 'Plan desconocido'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ${payment.amount_usd}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : payment.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.payment_status === 'paid' ? 'Completado' : 
                             payment.payment_status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {payments.length > 3 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/profile"
                    className="text-sm font-bold text-blue-600 hover:text-green-600"
                  >
                    Ver historial completo
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Acciones Rápidas */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/folders"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-300 group"
                >
                  <PlusIcon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm font-bold text-blue-600 text-center">Crear Carpeta</span>
                </Link>
                
                <Link
                  to="/folders"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-300 group"
                >
                  <FolderIcon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm font-bold text-blue-600 text-center">Ver Carpetas</span>
                </Link>
                
                <Link
                  to="/files"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-300 group"
                >
                  <DocumentIcon className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm font-bold text-green-600 text-center">Subir Archivos</span>
                </Link>
                
                {!hasActivePlan() && (
