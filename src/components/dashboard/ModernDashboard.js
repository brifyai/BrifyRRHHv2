import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import DatabaseCompanySummary from './DatabaseCompanySummary'
import employeeFolderService from '../../services/employeeFolderService'
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'
import companySyncService from '../../services/companySyncService'
import {
  FolderIcon,
  DocumentIcon,
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'

const ModernDashboard = () => {
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

  const loadDashboardData = useCallback(async () => {
    console.log('Dashboard: loadDashboardData called')
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
      
      // Obtener carpetas de empleados y contar archivos dentro de ellas
      try {
        // Obtener todos los empleados
        const employees = await inMemoryEmployeeService.getEmployees();
        console.log('Dashboard: Employees loaded:', employees.length);

        let totalFolders = 0;
        let totalFiles = 0;

        // Para cada empleado, obtener su carpeta y contar los archivos
        for (const employee of employees) {
          if (employee.email) {
            try {
              const folder = await employeeFolderService.getEmployeeFolder(employee.email);
              if (folder) {
                totalFolders++; // Contar cada carpeta de empleado

                // Contar archivos en la base de conocimiento de la carpeta
                const knowledgeBase = folder.knowledgeBase || {};
                const faqsCount = knowledgeBase.faqs?.length || 0;
                const documentsCount = knowledgeBase.documents?.length || 0;
                const policiesCount = knowledgeBase.policies?.length || 0;
                const proceduresCount = knowledgeBase.procedures?.length || 0;

                totalFiles += faqsCount + documentsCount + policiesCount + proceduresCount;
              }
            } catch (folderError) {
              // Si no existe la carpeta, aún cuenta como carpeta potencial
              totalFolders++;
              console.log(`Dashboard: Folder not found for ${employee.email}, counting as empty folder`);
            }
          }
        }

        realStats.totalFolders = totalFolders;
        realStats.totalFiles = totalFiles;

        console.log('Dashboard: Employee folders loaded:', realStats.totalFolders);
        console.log('Dashboard: Files in employee folders loaded:', realStats.totalFiles);

      } catch (error) {
        console.error('Error loading employee folders and files:', error);
        // Fallback a estadísticas básicas si hay error
        realStats.totalFolders = 0;
        realStats.totalFiles = 0;
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

      // Calcular porcentajes después de tener las estadísticas
      try {
        // Calcular porcentaje de carpetas
        const employees = await inMemoryEmployeeService.getEmployees();
        const totalEmployees = employees.length;
        const foldersPercentage = totalEmployees > 0 ? Math.min((stats.totalFolders / totalEmployees) * 100, 100) : 0;

        setPercentages({
          folders: foldersPercentage,
          files: 0 // Se calculará después de cargar planes
        });
      } catch (percentageError) {
        console.error('Error calculating folders percentage:', percentageError);
        setPercentages({
          folders: 0,
          files: 0
        });
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
  }, [user, userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suscribirse a eventos de cambios en empresas
  useEffect(() => {
    if (!user) return

    let unsubscribeId = null
    try {
      if (companySyncService && typeof companySyncService.subscribe === 'function') {
        unsubscribeId = companySyncService.subscribe('companies-updated', (data) => {
          console.log('Dashboard: Empresas actualizadas, recargando datos...', data)
          // Recargar datos del dashboard cuando hay cambios en empresas
          loadDashboardData()
        })
      }
    } catch (error) {
      console.error('Error al suscribirse a eventos de empresas:', error)
    }

    return () => {
      if (unsubscribeId && companySyncService && typeof companySyncService.unsubscribe === 'function') {
        try {
          companySyncService.unsubscribe('companies-updated', unsubscribeId)
        } catch (error) {
          console.error('Error al cancelar suscripción:', error)
        }
      }
    }
  }, [user, loadDashboardData])


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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando" />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              ¡Bienvenido, <span className="text-yellow-300">{userProfile?.name || user?.email}</span>!
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Tu panel de control inteligente para gestionar planes, archivos y comunicaciones
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">


        {/* Estadísticas principales - Cards 3D modernas con altura uniforme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-50 min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Carpetas</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.totalFolders}</p>
                  <p className="text-sm text-gray-500">Total organizadas</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <FolderIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-blue-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: `${percentages.folders}%`}}></div>
                </div>
                <span className="ml-3 text-xs font-medium text-blue-600">{percentages.folders.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-emerald-50 min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">Archivos</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.totalFiles}</p>
                  <p className="text-sm text-gray-500">Documentos activos</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <DocumentIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-emerald-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000" style={{width: `${percentages.files}%`}}></div>
                </div>
                <span className="ml-3 text-xs font-medium text-emerald-600">{percentages.files.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-50 min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Tokens IA</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.tokensUsed.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">de {stats.tokenLimit.toLocaleString()} disponibles</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <CpuChipIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-purple-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" style={{width: `${Math.min((stats.tokensUsed / stats.tokenLimit) * 100, 100)}%`}}></div>
                </div>
                <span className="ml-3 text-xs font-medium text-purple-600">{((stats.tokensUsed / stats.tokenLimit) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-amber-50 min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">Almacenamiento</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{formatBytes(stats.storageUsed)}</p>
                  <p className="text-sm text-gray-500">{getStoragePercentage().toFixed(1)}% utilizado</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-amber-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${
                    getStoragePercentage() >= 90 ? 'bg-red-500' :
                    getStoragePercentage() >= 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-amber-500 to-orange-600'
                  }`} style={{width: `${Math.min(getStoragePercentage(), 100)}%`}}></div>
                </div>
                <span className="ml-3 text-xs font-medium text-amber-600">{getStoragePercentage().toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen por Empresa - Sección destacada */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Resumen Empresarial</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Métricas detalladas de tu organización y rendimiento de comunicaciones
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-violet-100">
              <DatabaseCompanySummary />
            </div>
          </div>
        </div>


        {/* Footer decorativo */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-600">Sistema operativo</span>
          </div>
        </div>
      </div>


    </div>
  )
}

export default ModernDashboard
