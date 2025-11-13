import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

const CompanySummary = () => {
  const [companies, setCompanies] = useState([])
  const [employeesByCompany, setEmployeesByCompany] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Datos mock para desarrollo local
  const mockCompanies = [
    { id: '1', name: 'Ariztia' },
    { id: '2', name: 'Inchcape' },
    { id: '3', name: 'Achs' },
    { id: '4', name: 'Arcoprime' },
    { id: '5', name: 'Grupo Saesa' },
    { id: '6', name: 'Colbun' },
    { id: '7', name: 'AFP Habitat' },
    { id: '8', name: 'Copec' },
    { id: '9', name: 'Antofagasta Minerals' },
    { id: '10', name: 'Vida Cámara' },
    { id: '11', name: 'Enaex' }
  ]

  const mockEmployeesByCompany = [
    { companyId: '1', companyName: 'Ariztia', employeeCount: 120 },
    { companyId: '2', companyName: 'Inchcape', employeeCount: 85 },
    { companyId: '3', companyName: 'Achs', employeeCount: 210 },
    { companyId: '4', companyName: 'Arcoprime', employeeCount: 95 },
    { companyId: '5', companyName: 'Grupo Saesa', employeeCount: 180 },
    { companyId: '6', companyName: 'Colbun', employeeCount: 145 },
    { companyId: '7', companyName: 'AFP Habitat', employeeCount: 90 },
    { companyId: '8', companyName: 'Copec', employeeCount: 320 },
    { companyId: '9', companyName: 'Antofagasta Minerals', employeeCount: 275 },
    { companyId: '10', companyName: 'Vida Cámara', employeeCount: 65 },
    { companyId: '11', companyName: 'Enaex', employeeCount: 130 }
  ]

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Verificar si estamos en modo desarrollo local
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0'
        
        if (isLocal) {
          // Usar datos mock para desarrollo local
          console.log('CompanySummary: Using mock data for local development')
          setCompanies(mockCompanies)
          setEmployeesByCompany(mockEmployeesByCompany)
          setLoading(false)
          return
        }
        
        // Obtener todas las empresas
        console.log('CompanySummary: Loading companies...')
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .order('name', { ascending: true })
        
        if (companiesError) {
          throw new Error(`Error loading companies: ${companiesError.message}`)
        }
        
        console.log('CompanySummary: Companies loaded:', companiesData)
        setCompanies(companiesData)
        
        if (!companiesData || companiesData.length === 0) {
          setEmployeesByCompany([])
          setLoading(false)
          return
        }
        
        // Para cada empresa, obtener el conteo de empleados
        console.log('CompanySummary: Loading employee counts...')
        const employeesCountPromises = companiesData.map(async (company) => {
          const { count, error: countError } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('is_active', true)
          
          console.log(`CompanySummary: Employee count for ${company.name}:`, { count, countError })
          
          return {
            companyId: company.id,
            companyName: company.name,
            employeeCount: countError ? 0 : count || 0
          }
        })
        
        const employeesCountData = await Promise.all(employeesCountPromises)
        console.log('CompanySummary: Employee counts loaded:', employeesCountData)
        setEmployeesByCompany(employeesCountData)
      } catch (err) {
        console.error('CompanySummary: Error loading data:', err)
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
          <p className="text-sm mt-2">companies: {companies?.length || 0}, employeesByCompany: {employeesByCompany?.length || 0}</p>
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
      {employeesByCompany && employeesByCompany.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employeesByCompany.map((companyData) => (
            <div 
              key={companyData.companyId} 
              className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-gray-900 truncate">{companyData.companyName}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{companyData.employeeCount}</p>
              <p className="text-sm text-gray-600">empleados</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          <p>No se encontraron empresas</p>
          <p className="text-sm mt-2">companies: {companies?.length || 0}</p>
        </div>
      )}
    </div>
  )
}

export default CompanySummary