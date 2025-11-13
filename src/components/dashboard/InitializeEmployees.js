import React, { useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import employeeDataService from '../../services/employeeDataService.js'

const InitializeEmployees = () => {
  const [initializing, setInitializing] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState([])

  const handleInitialize = async () => {
    try {
      setInitializing(true)
      setMessage('Inicializando empleados... esto puede tomar unos minutos')
      setSuccess(false)
      setDetails([])
      setShowDetails(true)
      
      // Agregar mensaje de inicio
      setDetails(prev => [...prev, 'Iniciando proceso de inicialización de empleados...'])
      
      // Usar el servicio existente para asegurar 50 empleados por empresa
      const result = await employeeDataService.ensure50EmployeesPerCompany((progress) => {
        // Actualizar detalles del progreso
        setDetails(prev => [...prev, progress])
      })
      
      if (result.success) {
        setMessage('¡Éxito! Todas las empresas ahora tienen exactamente 50 empleados.')
        setSuccess(true)
        setDetails(prev => [...prev, 'Proceso completado exitosamente'])
      } else {
        setMessage('Hubo un problema durante la inicialización.')
        setSuccess(false)
        setDetails(prev => [...prev, 'Error: ' + (result.error || 'Proceso incompleto')])
      }
    } catch (error) {
      console.error('Error inicializando empleados:', error)
      setMessage(`Error: ${error.message}`)
      setSuccess(false)
      setDetails(prev => [...prev, `Error: ${error.message}`])
    } finally {
      setInitializing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <ArrowPathIcon className="h-6 w-6 mr-2 text-engage-blue" />
        Inicializar Empleados
      </h2>
      <p className="text-gray-600 mb-4">
        Esta herramienta asegura que cada empresa tenga exactamente 50 empleados con datos realistas.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Instrucciones:</strong> Para ejecutar este proceso, primero debes crear las tablas en la base de datos. 
              Abre el SQL Editor de Supabase y ejecuta el script del archivo <code className="bg-blue-100 px-1 rounded">database/setup-complete.sql</code>.
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleInitialize}
        disabled={initializing}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
          initializing 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-engage-blue hover:bg-engage-yellow text-white hover:text-engage-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        <ArrowPathIcon className={`h-5 w-5 mr-2 ${initializing ? 'animate-spin' : ''}`} />
        {initializing ? 'Inicializando...' : 'Inicializar Empleados (50 por empresa)'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {success ? (
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
      
      {showDetails && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-engage-blue hover:text-engage-yellow mb-2"
          >
            {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          
          {showDetails && (
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <ul className="text-xs space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-gray-700">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium">⚠️ Esta acción:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Asegura que cada empresa tenga exactamente 50 empleados</li>
          <li>Agrega empleados si hay menos de 50</li>
          <li>Elimina empleados si hay más de 50</li>
          <li>Genera datos realistas para los nuevos empleados</li>
        </ul>
      </div>
    </div>
  )
}

export default InitializeEmployees