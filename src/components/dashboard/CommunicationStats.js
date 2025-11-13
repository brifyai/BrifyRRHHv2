import React, { useState, useEffect } from 'react'
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import communicationService from '../../services/communicationService.js'

const CommunicationStats = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Verificar si estamos en modo desarrollo local
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0'
        
        if (isLocal) {
          // Usar datos mock para desarrollo local
          console.log('CommunicationStats: Using mock data for local development')
          setStats({
            totalSent: Math.floor(Math.random() * 5000),
            totalDelivered: Math.floor(Math.random() * 4500),
            totalRead: Math.floor(Math.random() * 4000)
          })
          setLoading(false)
          return
        }
        
        // Cargar estadísticas reales
        console.log('CommunicationStats: Loading real stats...')
        const statsData = await communicationService.getCommunicationStats()
        console.log('CommunicationStats: Stats loaded:', statsData)
        
        // Procesar las estadísticas para obtener totales por estado
        let totalSent = 0
        let totalDelivered = 0
        let totalRead = 0
        
        if (statsData && Array.isArray(statsData)) {
          statsData.forEach(stat => {
            if (stat.status === 'sent') totalSent += stat.count || 0
            if (stat.status === 'delivered') totalDelivered += stat.count || 0
            if (stat.status === 'read') totalRead += stat.count || 0
          })
        }
        
        setStats({
          totalSent,
          totalDelivered,
          totalRead
        })
      } catch (err) {
        console.error('CommunicationStats: Error loading stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-blue-600" />
          Estadísticas de Comunicación
        </h2>
        <p className="text-gray-500 text-center py-4">Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-blue-600" />
          Estadísticas de Comunicación
        </h2>
        <div className="text-red-500 text-center py-4">
          <p>Error al cargar estadísticas: {error}</p>
        </div>
      </div>
    )
  }

  const deliveryRate = stats.totalSent > 0 ? Math.round((stats.totalDelivered / stats.totalSent) * 100) : 0
  const readRate = stats.totalSent > 0 ? Math.round((stats.totalRead / stats.totalSent) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-blue-600" />
        Estadísticas de Comunicación
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <PaperAirplaneIcon className="h-8 w-8 text-blue-600 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSent}</p>
          <p className="text-sm text-gray-600 mt-1">Enviados</p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalDelivered}</p>
          <p className="text-sm text-gray-600 mt-1">Entregados</p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <EyeIcon className="h-8 w-8 text-purple-600 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRead}</p>
          <p className="text-sm text-gray-600 mt-1">Leídos</p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
          <span>Tasa de entrega</span>
          <span>{deliveryRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min((stats.totalDelivered / (stats.totalSent || 1)) * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm font-medium text-gray-900 mb-1 mt-4">
          <span>Tasa de lectura</span>
          <span>{readRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-purple-500 transition-all duration-500"
            style={{ width: `${Math.min((stats.totalRead / (stats.totalSent || 1)) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default CommunicationStats