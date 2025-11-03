import React, { useState, useEffect } from 'react'
import { BuildingOfficeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import CompanyCard from './CompanyCard'
import organizedDatabaseService from '../../services/organizedDatabaseService'

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
    console.log('🚀 DatabaseCompanySummary: Cargando datos desde base de datos organizada')
    try {
      setLoading(true)
      setError(null)
      const startTime = performance.now()

      // Usar el servicio organizado para obtener empresas con estadísticas
      const companiesWithStats = await organizedDatabaseService.getCompaniesWithStats()
      
      console.log(`📊 DatabaseCompanySummary: ${companiesWithStats.length} empresas cargadas con estadísticas`)
      console.log('📊 Empresas encontradas:', companiesWithStats)

      if (companiesWithStats.length === 0) {
        console.log('⚠️ No se encontraron empresas, mostrando mensaje de depuración')
        setError('No se encontraron empresas en la base de datos. Por favor, crea algunas empresas desde la sección de Configuración.')
        setCompanies([])
        setLoading(false)
        return
      }

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
      // Limpiar caché y recargar datos
      organizedDatabaseService.clearCache()
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