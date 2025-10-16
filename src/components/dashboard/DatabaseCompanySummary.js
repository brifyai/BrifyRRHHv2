import React, { useState, useEffect } from 'react'
import { BuildingOfficeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
// Cambiar el servicio de comunicación por el nuevo servicio en memoria
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'
import { supabase } from '../../lib/supabase'
import CompanyCard from './CompanyCard'

const DatabaseCompanySummary = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [flippedCards, setFlippedCards] = useState(new Set())


  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    console.log('🚀 DatabaseCompanySummary: Iniciando carga optimizada')
    try {
      setLoading(true)
      setError(null)
      const startTime = performance.now()

      // 🚀 OPTIMIZACIÓN: Obtener empresas y datos de comunicación en paralelo
      const [companiesData] = await Promise.all([
        inMemoryEmployeeService.getCompanies()
      ])

      console.log(`📊 DatabaseCompanySummary: ${companiesData.length} empresas cargadas`)

      if (companiesData.length === 0) {
        setCompanies([])
        setLoading(false)
        return
      }

      // 🚀 OPTIMIZACIÓN: Obtener todas las estadísticas de comunicación en una sola consulta
      const companyIds = companiesData.map(company => company.id)
      
      // Consulta única para obtener todos los conteos de mensajes por empresa y estado
      const { data: communicationStats, error: commError } = await supabase
        .from('communication_logs')
        .select('company_id, status, scheduled_date')
        .in('company_id', companyIds)

      if (commError) {
        console.error('Error loading communication stats:', commError)
      }

      // 🚀 OPTIMIZACIÓN: Procesar datos en memoria en lugar de múltiples consultas
      const statsByCompany = {}
      const nextScheduledByCompany = {}

      if (communicationStats) {
        const now = new Date().toISOString()
        
        communicationStats.forEach(record => {
          const companyId = record.company_id
          
          // Inicializar si no existe
          if (!statsByCompany[companyId]) {
            statsByCompany[companyId] = {
              sent: 0,
              scheduled: 0,
              draft: 0
            }
          }
          
          // Contar por estado
          statsByCompany[companyId][record.status] = (statsByCompany[companyId][record.status] || 0) + 1
          
          // Guardar próxima fecha programada
          if (record.status === 'scheduled' && record.scheduled_date >= now) {
            if (!nextScheduledByCompany[companyId] || record.scheduled_date < nextScheduledByCompany[companyId]) {
              nextScheduledByCompany[companyId] = record.scheduled_date
            }
          }
        })
      }

      // 🚀 OPTIMIZACIÓN: Obtener datos de sentimiento una sola vez desde localStorage
      let sentimentData = {}
      try {
        const storedSentimentData = localStorage.getItem('reportsSentimentData')
        if (storedSentimentData) {
          const parsed = JSON.parse(storedSentimentData)
          sentimentData = parsed?.sentimentByCompany || {}
        }
      } catch (error) {
        console.log('No sentiment data available in localStorage')
      }

      // 🚀 OPTIMIZACIÓN: Procesar empresas en paralelo usando los datos ya cargados
      const companiesWithStats = await Promise.all(
        companiesData.map(async (company) => {
          try {
            // Obtener conteo de empleados
            const employeeCount = await inMemoryEmployeeService.getEmployeeCountByCompany(company.id)
            
            // Usar datos ya procesados de comunicación
            const commStats = statsByCompany[company.id] || { sent: 0, scheduled: 0, draft: 0 }
            const nextScheduledDate = nextScheduledByCompany[company.id] || null
            
            // Engagement del 100%: todos los enviados se consideran leídos
            const readMessages = commStats.sent
            
            // Obtener sentimiento desde datos cacheados
            const sentimentScore = sentimentData[company.name]?.average || 0

            return {
              ...company,
              employeeCount,
              sentMessages: commStats.sent,
              readMessages,
              sentimentScore,
              scheduledMessages: commStats.scheduled,
              draftMessages: commStats.draft,
              nextScheduledDate
            }
          } catch (error) {
            console.error(`Error processing company ${company.id}:`, error)
            return {
              ...company,
              employeeCount: 0,
              sentMessages: 0,
              readMessages: 0,
              sentimentScore: 0,
              scheduledMessages: 0,
              draftMessages: 0,
              nextScheduledDate: null
            }
          }
        })
      )

      // Ordenar alfabéticamente
      const sortedCompanies = companiesWithStats.sort((a, b) => a.name.localeCompare(b.name))
      setCompanies(sortedCompanies)

      const loadTime = performance.now() - startTime
      console.log(`✅ DatabaseCompanySummary: Carga completada en ${loadTime.toFixed(2)}ms`)
      
    } catch (error) {
      console.error('❌ Error loading company data:', error)
      setError('Error al cargar los datos de las empresas')
    } finally {
      setLoading(false)
    }
  }

  const syncWithDashboard = async () => {
    try {
      setSyncing(true)
      setError(null)
      // Usar el servicio en memoria para sincronizar
      await inMemoryEmployeeService.ensure50EmployeesPerCompany()
      await loadCompanyData()
    } catch (error) {
      console.error('Error syncing with dashboard:', error)
      setError('Error al sincronizar con el dashboard')
    } finally {
      setSyncing(false)
    }
  }

  // Función para voltear tarjetas
  const toggleFlip = (companyId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 font-medium">Cargando datos empresariales...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4 text-lg font-medium">{error}</div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={loadCompanyData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Reintentar
          </button>
          <button
            onClick={syncWithDashboard}
            disabled={syncing}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar con Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-8">
      {/* Header con botón de sincronización */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Empresas Activas
            </h3>
            <p className="text-gray-600">
              Resumen detallado por organización
            </p>
          </div>
        </div>
        <button
          onClick={syncWithDashboard}
          disabled={syncing}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {/* Footer con estadísticas globales - movido aquí */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {companies.reduce((sum, company) => sum + company.employeeCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Empleados Totales</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {companies.reduce((sum, company) => sum + company.sentMessages, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Mensajes Enviados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {(() => {
                const totalSent = companies.reduce((sum, company) => sum + company.sentMessages, 0);
                const totalRead = companies.reduce((sum, company) => sum + company.readMessages, 0);
                return totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;
              })()}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Lectura Global</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {(() => {
                // Calcular sentimiento promedio global desde localStorage
                try {
                  const storedSentimentData = localStorage.getItem('reportsSentimentData');
                  if (storedSentimentData) {
                    const sentimentData = JSON.parse(storedSentimentData);
                    if (sentimentData && sentimentData.sentimentByCompany) {
                      const sentiments = Object.values(sentimentData.sentimentByCompany)
                        .map(company => company.average || 0)
                        .filter(sentiment => sentiment !== 0);

                      if (sentiments.length > 0) {
                        const avgSentiment = sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
                        return avgSentiment.toFixed(2);
                      }
                    }
                  }
                } catch (error) {
                  console.log('Error calculating global sentiment:', error);
                }
                return '0.00';
              })()}
            </div>
            <div className="text-sm text-gray-600">Sentimiento Global</div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          Todas las empresas • Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </div>
      </div>

      {/* Grid de empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company, index) => {
          const isFlipped = flippedCards.has(company.id);
          return <CompanyCard key={company.id} company={company} isFlipped={isFlipped} onToggleFlip={toggleFlip} />;
        })}
      </div>
    </div>
   </div>
  );
};

export default DatabaseCompanySummary;