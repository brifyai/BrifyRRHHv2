import React from 'react'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

const SimulatedCompanySummary = () => {
  // Datos simulados de empresas con sus métricas
  const simulatedCompanies = [
    { id: '1', name: 'Ariztia', employees: 120, sent: 850, read: 720 },
    { id: '2', name: 'Inchcape', employees: 85, sent: 620, read: 510 },
    { id: '3', name: 'Achs', employees: 210, sent: 1450, read: 1280 },
    { id: '4', name: 'Arcoprime', employees: 95, sent: 720, read: 610 },
    { id: '5', name: 'Grupo Saesa', employees: 180, sent: 1100, read: 950 },
    { id: '6', name: 'Colbun', employees: 145, sent: 980, read: 820 },
    { id: '7', name: 'AFP Habitat', employees: 90, sent: 650, read: 540 },
    { id: '8', name: 'Copec', employees: 320, sent: 2100, read: 1850 },
    { id: '9', name: 'Antofagasta Minerals', employees: 275, sent: 1750, read: 1520 },
    { id: '10', name: 'Vida Cámara', employees: 65, sent: 480, read: 390 },
    { id: '11', name: 'Enaex', employees: 130, sent: 890, read: 760 }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <BuildingOfficeIcon className="h-6 w-6 mr-3 text-engage-blue" />
        Resumen por Empresa (Datos Simulados)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {simulatedCompanies.map((company) => (
          <div 
            key={company.id} 
            className="bg-gradient-to-r from-engage-blue/5 to-gray-50 rounded-xl p-4 border border-engage-blue/20 hover:shadow-md transition-all duration-300 hover:scale-[102%]"
          >
            <h3 className="font-bold text-gray-900 truncate text-lg">{company.name}</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Empleados</span>
                <span className="font-bold text-engage-blue">{company.employees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mensajes enviados</span>
                <span className="font-bold text-green-600">{company.sent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mensajes leídos</span>
                <span className="font-bold text-purple-600">{company.read}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Mostrando datos simulados para demostración</p>
      </div>
    </div>
  )
}

export default SimulatedCompanySummary