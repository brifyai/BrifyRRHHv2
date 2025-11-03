/**
 * Enhanced Notification Center
 * Centro de notificaciones unificado con agrupación, acciones rápidas y gestión inteligente
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  StarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

const EnhancedNotificationCenter = ({ 
  maxNotifications = 50,
  enableSounds = true,
  enableDesktop = true,
  autoMarkAsRead = false,
  groupSimilar = true,
  persistToStorage = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())
  const [settings, setSettings] = useState({
    enableSounds,
    enableDesktop,
    autoMarkAsRead,
    groupSimilar
  })
  
  const notificationRef = useRef(null)
  const soundRef = useRef(null)

  // Tipos de notificaciones
  const notificationTypes = useMemo(() => ({
    info: { icon: InformationCircleIcon, color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-400' },
    success: { icon: CheckCircleIcon, color: 'green', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-400' },
    warning: { icon: ExclamationTriangleIcon, color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-700 dark:text-yellow-400' },
    error: { icon: ExclamationTriangleIcon, color: 'red', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-400' },
    message: { icon: ChatBubbleLeftRightIcon, color: 'purple', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-400' },
    document: { icon: DocumentTextIcon, color: 'indigo', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', textColor: 'text-indigo-700 dark:text-indigo-400' },
    user: { icon: UserIcon, color: 'gray', bgColor: 'bg-gray-50 dark:bg-gray-900/20', textColor: 'text-gray-700 dark:text-gray-400' }
  }), [])

  // Cargar notificaciones desde localStorage
  useEffect(() => {
    if (persistToStorage) {
      const savedNotifications = localStorage.getItem('notifications')
      const savedSettings = localStorage.getItem('notificationSettings')
      
      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications))
        } catch (error) {
          console.error('Error loading notifications:', error)
        }
      }
      
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      }
    }
    
    // Solicitar permisos para notificaciones de escritorio
    if (settings.enableDesktop && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [persistToStorage, settings.enableDesktop])

  // Guardar notificaciones en localStorage
  useEffect(() => {
    if (persistToStorage && notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications.slice(-maxNotifications)))
    }
  }, [notifications, persistToStorage, maxNotifications])

  // Guardar configuración en localStorage
  useEffect(() => {
    if (persistToStorage) {
      localStorage.setItem('notificationSettings', JSON.stringify(settings))
    }
  }, [settings, persistToStorage])

  // Generar notificaciones de ejemplo
  const generateSampleNotifications = useCallback(() => {
    const samples = [
      {
        id: `notif-${Date.now()}-1`,
        type: 'info',
        title: 'Bienvenido al Centro de Notificaciones',
        message: 'Aquí encontrarás todas tus notificaciones organizadas',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        source: 'system',
        actions: [
          { label: 'Ver Tutorial', action: 'tutorial' },
          { label: 'Configurar', action: 'settings' }
        ]
      },
      {
        id: `notif-${Date.now()}-2`,
        type: 'success',
        title: 'Empleado Actualizado',
        message: 'Juan Pérez ha sido actualizado exitosamente',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        priority: 'normal',
        source: 'employees',
        actions: [
          { label: 'Ver Perfil', action: 'view' },
          { label: 'Editar', action: 'edit' }
        ]
      },
      {
        id: `notif-${Date.now()}-3`,
        type: 'warning',
        title: 'Licencia por Vencer',
        message: 'La licencia de María González vence en 3 días',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: false,
        priority: 'high',
        source: 'hr',
        actions: [
          { label: 'Renovar', action: 'renew' },
          { label: 'Ver Detalles', action: 'details' }
        ]
      },
      {
        id: `notif-${Date.now()}-4`,
        type: 'message',
        title: 'Nuevo Mensaje',
        message: 'Tienes un nuevo mensaje de soporte',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: true,
        priority: 'normal',
        source: 'chat',
        actions: [
          { label: 'Responder', action: 'reply' },
          { label: 'Archivar', action: 'archive' }
        ]
      },
      {
        id: `notif-${Date.now()}-5`,
        type: 'document',
        title: 'Documento Compartido',
        message: 'Carlos Rodríguez compartió "Reporte Mensual.pdf"',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        read: true,
        priority: 'low',
        source: 'documents',
        actions: [
          { label: 'Descargar', action: 'download' },
          { label: 'Ver', action: 'view' }
        ]
      }
    ]
    
    setNotifications(prev => [...samples, ...prev].slice(0, maxNotifications))
  }, [maxNotifications])

  // Agregar nueva notificación
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications))
    
    // Reproducir sonido
    if (settings.enableSounds && soundRef.current) {
      soundRef.current.play().catch(() => {})
    }
    
    // Notificación de escritorio
    if (settings.enableDesktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }
  }, [maxNotifications, settings.enableSounds, settings.enableDesktop])

  // Marcar como leído
  const markAsRead = useCallback((notificationIds) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    setNotifications(prev => prev.map(notif => 
      ids.includes(notif.id) ? { ...notif, read: true } : notif
    ))
  }, [])

  // Marcar todo como leído
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }, [])

  // Eliminar notificación
  const deleteNotification = useCallback((notificationIds) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    setNotifications(prev => prev.filter(notif => !ids.includes(notif.id)))
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      ids.forEach(id => newSet.delete(id))
      return newSet
    })
  }, [])

  // Archivar notificación
  const archiveNotification = useCallback((notificationIds) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    setNotifications(prev => prev.map(notif => 
      ids.includes(notif.id) ? { ...notif, archived: true } : notif
    ))
    markAsRead(ids)
  }, [markAsRead])

  // Agrupar notificaciones similares
  const groupedNotifications = useMemo(() => {
    if (!settings.groupSimilar) return notifications
    
    const groups = {}
    
    notifications.forEach(notif => {
      const key = `${notif.type}-${notif.source}-${notif.title}`
      if (!groups[key]) {
        groups[key] = {
          ...notif,
          count: 0,
          notifications: []
        }
      }
      groups[key].count++
      groups[key].notifications.push(notif)
      groups[key].timestamp = notif.timestamp // Mantener la más reciente
    })
    
    return Object.values(groups)
  }, [notifications, settings.groupSimilar])

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    let filtered = groupedNotifications
    
    // Aplicar filtro de tipo
    if (filter !== 'all') {
      filtered = filtered.filter(notif => notif.type === filter)
    }
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Aplicar filtro de no leídos
    if (showUnreadOnly) {
      filtered = filtered.filter(notif => !notif.read)
    }
    
    return filtered
  }, [groupedNotifications, filter, searchTerm, showUnreadOnly])

  // Estadísticas
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const byType = Object.keys(notificationTypes).reduce((acc, type) => {
      acc[type] = notifications.filter(n => n.type === type).length
      return acc
    }, {})
    
    return { total, unread, byType }
  }, [notifications, notificationTypes])

  // Manejar acción de notificación
  const handleNotificationAction = useCallback((notification, action) => {
    console.log(`Action ${action} for notification ${notification.id}`)
    // Aquí se implementarían las acciones específicas
    markAsRead(notification.id)
  }, [markAsRead])

  // Toggle selección
  const toggleSelection = useCallback((notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }, [])

  // Seleccionar todo
  const selectAll = useCallback(() => {
    const allIds = filteredNotifications.map(n => n.id)
    setSelectedNotifications(new Set(allIds))
  }, [filteredNotifications])

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedNotifications(new Set())
  }, [])

  // Renderizar notificación individual
  const renderNotification = useCallback((notification) => {
    const typeConfig = notificationTypes[notification.type] || notificationTypes.info
    const Icon = typeConfig.icon
    const isGrouped = notification.count > 1
    const isSelected = selectedNotifications.has(notification.id)
    
    return (
      <div
        key={notification.id}
        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox de selección */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(notification.id)}
            className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          
          {/* Icono */}
          <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
            <Icon className={`w-5 h-5 ${typeConfig.textColor}`} />
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium text-gray-900 dark:text-gray-100 truncate ${
                !notification.read ? 'font-semibold' : ''
              }`}>
                {notification.title}
                {isGrouped && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                    {notification.count}
                  </span>
                )}
              </h3>
              
              <div className="flex items-center gap-2">
                {/* Prioridad */}
                {notification.priority === 'high' && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                
                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
                
                {/* Estado de lectura */}
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title={notification.read ? 'Marcar como no leído' : 'Marcar como leído'}
                >
                  {notification.read ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
            
            {/* Acciones */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleNotificationAction(notification, action.action)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Metadatos */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {notification.source}
              </span>
              {isGrouped && (
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  {notification.count} notificaciones
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }, [notificationTypes, selectedNotifications, toggleSelection, markAsRead, handleNotificationAction])

  // Renderizar lista vacía
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
      <BellIcon className="w-12 h-12 mb-4" />
      <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
      <p className="text-sm text-center">
        {showUnreadOnly ? 'No tienes notificaciones no leídas' : 'Tu bandeja de notificaciones está vacía'}
      </p>
      <button
        onClick={generateSampleNotifications}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Generar Notificaciones de Ejemplo
      </button>
    </div>
  )

  return (
    <div className="relative" ref={notificationRef}>
      {/* Audio para notificaciones */}
      <audio ref={soundRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        
        {/* Indicador de notificaciones no leídas */}
        {stats.unread > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>
      
      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notificaciones
            </h2>
            
            <div className="flex items-center gap-2">
              {/* Configuración */}
              <button
                onClick={() => setSettings(prev => ({ ...prev, enableSounds: !prev.enableSounds }))}
                className={`p-1 rounded ${settings.enableSounds ? 'text-blue-600' : 'text-gray-400'}`}
                title="Sonido"
              >
                📢
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Controles */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notificaciones..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            {/* Filtros y acciones */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Filtro por tipo */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">Todos</option>
                  {Object.keys(notificationTypes).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                
                {/* Solo no leídos */}
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`px-2 py-1 border rounded text-sm transition-colors ${
                    showUnreadOnly 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Solo no leídos
                </button>
              </div>
              
              {/* Acciones rápidas */}
              <div className="flex items-center gap-1">
                {stats.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Marcar todo como leído"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                )}
                
                {selectedNotifications.size > 0 && (
                  <>
                    <button
                      onClick={() => markAsRead(Array.from(selectedNotifications))}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Marcar seleccionados como leídos"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => archiveNotification(Array.from(selectedNotifications))}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Archivar seleccionados"
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteNotification(Array.from(selectedNotifications))}
                      className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      title="Eliminar seleccionados"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Selección masiva */}
            {selectedNotifications.size > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedNotifications.size} seleccionados
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Seleccionar todo
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                  >
                    Limpiar selección
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Lista de notificaciones */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredNotifications.map(renderNotification)
            )}
          </div>
          
          {/* Footer con estadísticas */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {stats.unread} de {stats.total} no leídas
              </span>
              <button
                onClick={generateSampleNotifications}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Generar ejemplo
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default EnhancedNotificationCenter