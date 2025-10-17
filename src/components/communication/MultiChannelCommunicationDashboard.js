import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  VideoCameraIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import multiChannelCommunicationService from '../../services/multiChannelCommunicationService'
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService'

const MultiChannelCommunicationDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedChannels, setSelectedChannels] = useState([])
  const [channelStats, setChannelStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [messageData, setMessageData] = useState({
    title: '',
    content: '',
    recipients: [],
    scheduleTime: '',
    priority: 'normal'
  })
  const [templates, setTemplates] = useState([])
  const [scheduledMessages, setScheduledMessages] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para integración con base de datos de empleados
  const [employees, setEmployees] = useState([])
  const [companies, setCompanies] = useState([])
  const [employeeFilters, setEmployeeFilters] = useState({
    company: '',
    department: '',
    region: '',
    level: '',
    workMode: '',
    contractType: ''
  })
  const [filteredRecipients, setFilteredRecipients] = useState([])
  const [showEmployeeFilters, setShowEmployeeFilters] = useState(false)

  // Canales disponibles
  const availableChannels = multiChannelCommunicationService.getAvailableChannels()

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Actualizar destinatarios filtrados cuando cambian los filtros
    updateFilteredRecipients()
  }, [employeeFilters, employees])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Cargar estadísticas de canales
      const stats = await multiChannelCommunicationService.getChannelStats()
      setChannelStats(stats)
      
      // Cargar datos de empleados y empresas
      const employeesData = multiChannelCommunicationService.getEmployees()
      const companiesData = inMemoryEmployeeService.companies || []
      
      setEmployees(employeesData)
      setCompanies(companiesData)
      
      // Inicializar destinatarios filtrados
      const recipients = multiChannelCommunicationService.getRecipientsForCommunication()
      setFilteredRecipients(recipients)
      
      // Cargar mensajes recientes (simulados)
      setRecentMessages([
        {
          id: 1,
          channel: 'email',
          title: 'Reporte Mensual de Ventas',
          status: 'delivered',
          sentAt: '2024-01-15T10:30:00Z',
          recipients: 45
        },
        {
          id: 2,
          channel: 'teams',
          title: 'Reunión de Equipo',
          status: 'sent',
          sentAt: '2024-01-15T09:15:00Z',
          recipients: 12
        },
        {
          id: 3,
          channel: 'video',
          title: 'Tutorial de Nuevo Sistema',
          status: 'processing',
          sentAt: '2024-01-15T08:00:00Z',
          recipients: 200
        },
        {
          id: 4,
          channel: 'podcast',
          title: 'Actualización Ejecutiva Q1',
          status: 'sent',
          sentAt: '2024-01-14T16:45:00Z',
          recipients: 150
        }
      ])
      
      // Cargar mensajes programados (simulados)
      setScheduledMessages([
        {
          id: 1,
          title: 'Recordatorio de Reunión',
          channels: ['email', 'sms'],
          scheduledTime: '2024-01-16T09:00:00Z',
          status: 'scheduled'
        },
        {
          id: 2,
          title: 'Newsletter Semanal',
          channels: ['email'],
          scheduledTime: '2024-01-17T08:00:00Z',
          status: 'scheduled'
        }
      ])
      
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manejar selección de canales
  const toggleChannel = (channelId) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  // Actualizar destinatarios filtrados
  const updateFilteredRecipients = () => {
    const recipients = multiChannelCommunicationService.getRecipientsForCommunication(employeeFilters)
    setFilteredRecipients(recipients)
  }

  // Manejar cambios en filtros de empleados
  const handleEmployeeFilterChange = (filterName, value) => {
    setEmployeeFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Limpiar filtros de empleados
  const clearEmployeeFilters = () => {
    setEmployeeFilters({
      company: '',
      department: '',
      region: '',
      level: '',
      workMode: '',
      contractType: ''
    })
  }

  // Obtener valores únicos para filtros
  const getUniqueFilterValues = (field) => {
    if (!employees.length) return []
    return [...new Set(employees.map(emp => emp[field]).filter(Boolean))]
  }

  // Enviar mensaje multicanal
  const handleSendMessage = async () => {
    if (!messageData.title || !messageData.content || selectedChannels.length === 0) {
      alert('Por favor completa todos los campos y selecciona al menos un canal')
      return
    }

    try {
      const result = await multiChannelCommunicationService.sendMultiChannelMessageToEmployees({
        channels: selectedChannels,
        content: {
          subject: messageData.title,
          body: messageData.content,
          ...(messageData.scheduleTime && { schedule: messageData.scheduleTime })
        },
        priority: messageData.priority
      }, employeeFilters)

      if (result.success) {
        alert(`Mensaje enviado exitosamente a ${result.recipientsCount} empleados a través de ${result.successfulChannels} canales`)
        setShowNewMessage(false)
        setMessageData({
          title: '',
          content: '',
          recipients: [],
          scheduleTime: '',
          priority: 'normal'
        })
        setSelectedChannels([])
        clearEmployeeFilters()
        loadInitialData() // Recargar datos
      } else {
        alert('Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    }
  }

  // Filtrar mensajes
  const filteredMessages = recentMessages.filter(msg => 
    msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.channel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Renderizar icono de canal
  const renderChannelIcon = (channelId, size = 'w-6 h-6') => {
    const channel = availableChannels.find(ch => ch.id === channelId)
    if (!channel) return null
    
    const iconClass = `${size} text-white`
    
    switch (channelId) {
      case 'email':
        return <EnvelopeIcon className={iconClass} />
      case 'teams':
        return <ChatBubbleLeftRightIcon className={iconClass} />
      case 'slack':
        return <ChatBubbleLeftRightIcon className={iconClass} />
      case 'sms':
        return <DevicePhoneMobileIcon className={iconClass} />
      case 'video':
        return <VideoCameraIcon className={iconClass} />
      case 'infographic':
        return <ChartBarIcon className={iconClass} />
      case 'podcast':
        return <SpeakerWaveIcon className={iconClass} />
      default:
        return <EnvelopeIcon className={iconClass} />
    }
  }

  // Renderizar estadísticas de canal
  const renderChannelStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {availableChannels.map(channel => {
          const stats = channelStats[channel.id] || {
            sent: 0,
            delivered: 0,
            failed: 0,
            pending: 0,
            total: 0
          }
          
          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: channel.color }}
                >
                  {renderChannelIcon(channel.id)}
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {channel.name}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enviados:</span>
                  <span className="font-medium text-green-600">{stats.sent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entregados:</span>
                  <span className="font-medium text-blue-600">{stats.delivered}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fallidos:</span>
                  <span className="font-medium text-red-600">{stats.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-medium text-yellow-600">{stats.pending}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Comunicación Multicanal
                </h1>
                <p className="text-sm text-gray-600">
                  Gestiona todos tus canales de comunicación desde un solo lugar
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/base-de-datos"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl"
              >
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Base de Datos
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewMessage(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                Nuevo Mensaje
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs de navegación */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: ChartPieIcon },
            { id: 'messages', name: 'Mensajes', icon: DocumentTextIcon },
            { id: 'scheduled', name: 'Programados', icon: ClockIcon },
            { id: 'templates', name: 'Plantillas', icon: DocumentTextIcon },
            { id: 'analytics', name: 'Análisis', icon: ArrowTrendingUpIcon }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Contenido principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Estadísticas de canales */}
              {renderChannelStats()}

              {/* Resumen de actividad */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="space-y-4">
                    {recentMessages.slice(0, 5).map(message => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: availableChannels.find(ch => ch.id === message.channel)?.color || '#gray' }}
                          >
                            {renderChannelIcon(message.channel, 'w-4 h-4')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{message.title}</p>
                            <p className="text-sm text-gray-600">
                              {message.recipients} destinatarios
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            message.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status === 'delivered' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {message.status === 'processing' && <ClockIcon className="w-3 h-3 mr-1" />}
                            {message.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Mensajes Programados
                  </h3>
                  <div className="space-y-4">
                    {scheduledMessages.map(message => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{message.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(message.scheduledTime).toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {message.channels.map(channelId => (
                              <div 
                                key={channelId}
                                className="p-1 rounded"
                                style={{ backgroundColor: availableChannels.find(ch => ch.id === channelId)?.color || '#gray' }}
                              >
                                {renderChannelIcon(channelId, 'w-3 h-3')}
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Programado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Todos los Mensajes
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map(message => (
                    <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: availableChannels.find(ch => ch.id === message.channel)?.color || '#gray' }}
                          >
                            {renderChannelIcon(message.channel)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{message.title}</h4>
                            <p className="text-sm text-gray-600">
                              Enviado el {new Date(message.sentAt).toLocaleDateString()} a {message.recipients} destinatarios
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            message.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status === 'delivered' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                            {message.status === 'processing' && <ClockIcon className="w-4 h-4 mr-1" />}
                            {message.status === 'failed' && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
                            {message.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scheduled' && (
            <motion.div
              key="scheduled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Mensajes Programados
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {scheduledMessages.map(message => (
                      <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-800">{message.title}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {message.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(message.scheduledTime).toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2">
                              {message.channels.map(channelId => (
                                <div 
                                  key={channelId}
                                  className="p-1 rounded"
                                  style={{ backgroundColor: availableChannels.find(ch => ch.id === channelId)?.color || '#gray' }}
                                  title={availableChannels.find(ch => ch.id === channelId)?.name}
                                >
                                  {renderChannelIcon(channelId, 'w-4 h-4')}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Editar
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableChannels.map(channel => (
                  <div key={channel.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: channel.color }}
                      >
                        {renderChannelIcon(channel.id)}
                      </div>
                      <h3 className="font-semibold text-gray-800">{channel.name}</h3>
                    </div>
                    <div className="space-y-2">
                      {channel.templates.map(template => (
                        <div key={template} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <p className="font-medium text-gray-800 capitalize">{template}</p>
                          <p className="text-sm text-gray-600">Plantilla para {channel.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Rendimiento por Canal
                  </h3>
                  <div className="space-y-4">
                    {availableChannels.map(channel => {
                      const stats = channelStats[channel.id] || { total: 0, delivered: 0 }
                      const deliveryRate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(1) : 0
                      
                      return (
                        <div key={channel.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {renderChannelIcon(channel.id, 'w-5 h-5')}
                              <span className="font-medium text-gray-800">{channel.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{deliveryRate}% entrega</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${deliveryRate}%`,
                                backgroundColor: channel.color 
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Estadísticas Generales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Object.values(channelStats).reduce((sum, stats) => sum + stats.total, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Mensajes</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Object.values(channelStats).reduce((sum, stats) => sum + stats.delivered, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Entregados</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {Object.values(channelStats).reduce((sum, stats) => sum + stats.pending, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Pendientes</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {Object.values(channelStats).reduce((sum, stats) => sum + stats.failed, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Fallidos</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de nuevo mensaje */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Nuevo Mensaje Multicanal
                </h2>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Mensaje
                  </label>
                  <input
                    type="text"
                    value={messageData.title}
                    onChange={(e) => setMessageData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Reporte Mensual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={messageData.content}
                    onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canales de Envío
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableChannels.map(channel => (
                      <label
                        key={channel.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{ 
                          borderColor: selectedChannels.includes(channel.id) ? channel.color : '#e5e7eb',
                          backgroundColor: selectedChannels.includes(channel.id) ? `${channel.color}10` : 'white'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(channel.id)}
                          onChange={() => toggleChannel(channel.id)}
                          className="rounded"
                        />
                        <div className="flex items-center space-x-2">
                          {renderChannelIcon(channel.id, 'w-4 h-4')}
                          <span className="text-sm font-medium">{channel.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtros de Empleados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Filtrar Empleados
                    </label>
                    <button
                      type="button"
                      onClick={clearEmployeeFilters}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
                      <select
                        value={employeeFilters.empresa}
                        onChange={(e) => handleEmployeeFilterChange('empresa', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todas</option>
                        {getUniqueFilterValues('empresa').map(empresa => (
                          <option key={empresa} value={empresa}>{empresa}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Región</label>
                      <select
                        value={employeeFilters.region}
                        onChange={(e) => handleEmployeeFilterChange('region', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todas</option>
                        {getUniqueFilterValues('region').map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Departamento</label>
                      <select
                        value={employeeFilters.departamento}
                        onChange={(e) => handleEmployeeFilterChange('departamento', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        {getUniqueFilterValues('departamento').map(departamento => (
                          <option key={departamento} value={departamento}>{departamento}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nivel</label>
                      <select
                        value={employeeFilters.nivel}
                        onChange={(e) => handleEmployeeFilterChange('nivel', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        {getUniqueFilterValues('nivel').map(nivel => (
                          <option key={nivel} value={nivel}>{nivel}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
                      <select
                        value={employeeFilters.modalidad_trabajo}
                        onChange={(e) => handleEmployeeFilterChange('modalidad_trabajo', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todas</option>
                        {getUniqueFilterValues('modalidad_trabajo').map(modalidad => (
                          <option key={modalidad} value={modalidad}>{modalidad}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo Contrato</label>
                      <select
                        value={employeeFilters.tipo_contrato}
                        onChange={(e) => handleEmployeeFilterChange('tipo_contrato', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        {getUniqueFilterValues('tipo_contrato').map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {filteredRecipients.length > 0
                      ? `${filteredRecipients.length} empleados seleccionados con los filtros actuales`
                      : 'Todos los empleados serán incluidos (sin filtros activos)'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={messageData.priority}
                    onChange={(e) => setMessageData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programar Envío (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={messageData.scheduleTime}
                    onChange={(e) => setMessageData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors"
                >
                  Enviar Mensaje
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MultiChannelCommunicationDashboard