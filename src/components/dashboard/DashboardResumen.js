import React, { useState, useEffect } from 'react'
import { BuildingOfficeIcon, PaperAirplaneIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase.js'
import communicationService from '../../services/communicationService.js'

const DashboardResumen = () => {
  const [companies, setCompanies] = useState([])
  const [employeesByCompany, setEmployeesByCompany] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ELIMINADO: Datos mock - ahora siempre usamos datos reales de Supabase

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // SIEMPRE usar datos reales de Supabase - eliminado modo mock
        console.log('DashboardResumen: Loading companies from Supabase...')
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .order('name', { ascending: true })
        
        if (companiesError) {
          throw new Error(`Error loading companies: ${companiesError.message}`)
        }
        
        console.log('DashboardResumen: Companies loaded:', companiesData)
        setCompanies(companiesData)
        
        if (!companiesData || companiesData.length === 0) {
          setEmployeesByCompany([])
          setLoading(false)
          return
        }
        
        // Para cada empresa, obtener el conteo de empleados
        console.log('DashboardResumen: Loading employee counts...')
        const employeesCountPromises = companiesData.map(async (company) => {
          const { count, error: countError } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('is_active', true)
          
          console.log(`DashboardResumen: Employee count for ${company.name}:`, { count, countError })
          
          return {
            companyId: company.id,
            companyName: company.name,
            employeeCount: countError ? 0 : count || 0
          }
        })
        
        const employeesCountData = await Promise.all(employeesCountPromises)
        console.log('DashboardResumen: Employee counts loaded:', employeesCountData)
        setEmployeesByCompany(employeesCountData)
      } catch (err) {
        console.error('DashboardResumen: Error loading data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadCompanyData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
          Resumen por Empresa
        </h2>
        <p className="text-gray-500 text-center py-4">Cargando datos de empresas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
          Resumen por Empresa
        </h2>
        <div className="text-red-500 text-center py-4">
          <p>Error al cargar datos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
        Resumen por Empresa
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employeesByCompany && employeesByCompany.length > 0 ? (
          employeesByCompany.map((companyData) => (
            <div 
              key={companyData.companyId} 
              className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
            >
              <h3 className="font-bold text-gray-900 truncate text-lg">{companyData.companyName}</h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Empleados</span>
                  <span className="font-bold text-blue-600">{companyData.employeeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mensajes enviados</span>
                  <span className="font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mensajes leídos</span>
                  <span className="font-bold text-purple-600">0</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-4 col-span-full">
            <p>No se encontraron empresas</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardResumen