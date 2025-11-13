import React, { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import whatsappService from '../../services/whatsappService.js'

const WhatsAppConfig = () => {
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    webhookVerifyToken: '',
    testMode: true
  })
  
  const [isConfigured, setIsConfigured] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [accountInfo, setAccountInfo] = useState(null)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Este es un mensaje de prueba desde StaffHub')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  useEffect(() => {
    // Cargar configuración existente
    const savedConfig = whatsappService.loadConfiguration()
    if (savedConfig.accessToken) {
      setConfig(savedConfig)
      setIsConfigured(true)
      setConnectionStatus('connected')
      loadAccountInfo()
      loadTemplates()
    }
  }, [])

  const loadAccountInfo = async () => {
    try {
      const result = await whatsappService.getAccountInfo()
      if (result.success) {
        setAccountInfo(result.account)
      }
    } catch (error) {
      console.error('Error loading account info:', error)
    }
  }

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const result = await whatsappService.getTemplates()
      if (result.success) {
        setTemplates(result.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConnect = async () => {
    // Validar campos obligatorios
    if (!config.accessToken || !config.phoneNumberId) {
      toast.error('Access Token y Phone Number ID son obligatorios')
      return
    }

    // Validar formato del Access Token
    if (!config.accessToken.startsWith('EA') && !config.accessToken.startsWith('EAA')) {
      toast.error('El Access Token debe comenzar con EA o EAA')
      return
    }

    // Validar formato del Phone Number ID
    if (!/^\d+$/.test(config.phoneNumberId)) {
      toast.error('El Phone Number ID debe contener solo números')
      return
    }

    setIsConnecting(true)
    setConnectionStatus('connecting')

    try {
      // Configurar el servicio
      whatsappService.configure(config)
      
      // Probar conexión
      const testResult = await whatsappService.testConnection()
      
      if (testResult.success) {
        setIsConfigured(true)
        setConnectionStatus('connected')
        
        // Cargar información de la cuenta
        await loadAccountInfo()
        await loadTemplates()
        
        // Mostrar éxito
        await Swal.fire({
          title: '🎉 WhatsApp Configurado Exitosamente',
          html: `
            <div style="text-align: left;">
              <div style="background-color: #d4edda; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #155724;">✅ Conexión exitosa</h4>
                <p style="margin: 0; font-size: 14px;">La API de WhatsApp está funcionando correctamente.</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">Información del número:</h4>
                <p style="margin: 4px 0; font-size: 14px;">
                  <strong>Número:</strong> ${testResult.phoneInfo.name}<br>
                  <strong>Nombre verificado:</strong> ${testResult.phoneInfo.verifiedName}<br>
                  <strong>Calidad:</strong> ${testResult.phoneInfo.qualityRating || 'N/A'}
                </p>
              </div>
              <div style="background-color: #e8f4fd; padding: 12px; border-radius: 4px; margin-top: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #0066ff;">📋 Funcionalidades activadas:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>✅ Envío de mensajes individuales</li>
                  <li>✅ Envío masivo de mensajes</li>
                  <li>✅ Plantillas de mensaje pre-aprobadas</li>
                  <li>✅ Webhooks para estado de entrega</li>
                  <li>✅ Estadísticas en tiempo real</li>
                  <li>✅ Modo ${config.testMode ? 'prueba 🧪' : 'producción 🚀'}</li>
                </ul>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '¡Perfecto!',
          confirmButtonColor: '#25d366',
          width: '500px'
        })

        toast.success('WhatsApp configurado exitosamente')
      } else {
        throw new Error(testResult.error || 'Error al conectar con WhatsApp')
      }
    } catch (error) {
      console.error('Error configuring WhatsApp:', error)
      
      // Restaurar estado
      setIsConfigured(false)
      setConnectionStatus('disconnected')
      
      // Mostrar error
      await Swal.fire({
        title: '❌ Error de Conexión',
        html: `
          <div style="text-align: left;">
            <div style="background-color: #f8d7da; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
              <h4 style="margin: 0 0 8px 0; color: #721c24;">No se pudo conectar con WhatsApp</h4>
              <p style="margin: 0; font-size: 14px;"><strong>Error:</strong> ${error.message}</p>
            </div>
            <div style="background-color: #fff3cd; padding: 12px; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #856404;">🔍 Posibles soluciones:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                <li>• Verifica que el Access Token sea correcto</li>
                <li>• Asegúrate de que el Phone Number ID sea válido</li>
                <li>• Revisa que tu número de WhatsApp esté verificado</li>
                <li>• Verifica los permisos del token</li>
                <li>• Revisa tu conexión a internet</li>
              </ul>
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545',
        width: '500px'
      })

      toast.error('Error al configurar WhatsApp')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      title: 'Desconectar WhatsApp',
      text: '¿Estás seguro de desconectar WhatsApp? Perderás toda la configuración.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desconectar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      whatsappService.clearConfiguration()
      setConfig({
        accessToken: '',
        phoneNumberId: '',
        webhookVerifyToken: '',
        testMode: true
      })
      setIsConfigured(false)
      setConnectionStatus('disconnected')
      setAccountInfo(null)
      setTemplates([])
      
      toast.success('WhatsApp desconectado')
    }
  }

  const handleTestMessage = async () => {
    if (!testPhone) {
      toast.error('Por favor ingresa un número de teléfono para probar')
      return
    }

    if (!whatsappService.validatePhoneNumber(testPhone)) {
      toast.error('El número de teléfono no es válido')
      return
    }

    setIsTesting(true)

    try {
      const result = await whatsappService.sendTestMessage(testPhone, testMessage)
      
      if (result.success) {
        await Swal.fire({
          title: '✅ Mensaje Enviado',
          html: `
            <div style="text-align: left;">
              <div style="background-color: #d4edda; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #155724;">Mensaje de prueba enviado</h4>
                <p style="margin: 0; font-size: 14px;">
                  <strong>ID del mensaje:</strong> ${result.messageId}<br>
                  <strong>Destinatario:</strong> ${testPhone}<br>
                  <strong>Modo:</strong> ${result.testMode ? 'Prueba 🧪' : 'Producción 🚀'}
                </p>
              </div>
              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;">
                  El mensaje debería llegar en pocos segundos. Si no lo recibes, verifica el número y la configuración.
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#25d366',
          width: '450px'
        })

        toast.success('Mensaje de prueba enviado')
      } else {
        throw new Error(result.error || 'Error al enviar mensaje de prueba')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      
      await Swal.fire({
        title: '❌ Error al Enviar',
        html: `
          <div style="text-align: left;">
            <div style="background-color: #f8d7da; padding: 12px; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #721c24;">No se pudo enviar el mensaje</h4>
              <p style="margin: 0; font-size: 14px;"><strong>Error:</strong> ${error.message}</p>
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545'
      })

      toast.error('Error al enviar mensaje de prueba')
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Conectando...</span>
      case 'connected':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Conectado</span>
      default:
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Desconectado</span>
    }
  }

  const refreshTemplates = async () => {
    await loadTemplates()
    toast.success('Plantillas actualizadas')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mr-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">WhatsApp Business API</h3>
              <p className="text-sm text-gray-600">Configuración de WhatsApp con API oficial de Meta</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Información de conexión */}
        {isConfigured && accountInfo && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800">WhatsApp conectado</span>
            </div>
            <div className="text-sm text-green-600">
              <p><strong>Cuenta:</strong> {accountInfo.name}</p>
              <p><strong>ID:</strong> {accountInfo.id}</p>
            </div>
          </div>
        )}

        {/* Formulario de configuración */}
        {!isConfigured ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token de Meta *
              </label>
              <input
                type="password"
                value={config.accessToken}
                onChange={(e) => handleInputChange('accessToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="EA..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtén tu token en{' '}
                <a 
                  href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Meta for Developers
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                value={config.phoneNumberId}
                onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="123456789..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ID numérico de tu número de WhatsApp Business
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Verify Token
              </label>
              <input
                type="text"
                value={config.webhookVerifyToken}
                onChange={(e) => handleInputChange('webhookVerifyToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Token opcional para verificación de webhooks"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional: Token para verificar webhooks entrantes
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="test-mode"
                checked={config.testMode}
                onChange={(e) => handleInputChange('testMode', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="test-mode" className="ml-2 block text-sm text-gray-900">
                Modo de prueba
              </label>
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Conectar WhatsApp
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configuración
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Desconectar
              </button>
            </div>

            {/* Configuración avanzada */}
            {showAdvanced && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Configuración Actual</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Phone Number ID:</strong> {config.phoneNumberId}</p>
                  <p><strong>Modo:</strong> {config.testMode ? 'Prueba 🧪' : 'Producción 🚀'}</p>
                  <p><strong>Webhook Token:</strong> {config.webhookVerifyToken || 'No configurado'}</p>
                </div>
              </div>
            )}

            {/* Prueba de mensaje */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Enviar Mensaje de Prueba</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    rows="2"
                    placeholder="Escribe tu mensaje de prueba..."
                  />
                </div>
                <button
                  onClick={handleTestMessage}
                  disabled={isTesting}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Enviar Mensaje de Prueba
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plantillas de mensaje */}
      {isConfigured && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mr-4">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Plantillas de Mensaje</h3>
                <p className="text-sm text-gray-600">Plantillas pre-aprobadas para comunicación</p>
              </div>
            </div>
            <button
              onClick={refreshTemplates}
              disabled={loadingTemplates}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
            >
              {loadingTemplates ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {loadingTemplates ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : templates.length > 0 ? (
            <div className="space-y-2">
              {templates.map((template, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        Categoría: {template.category} | Estado: {template.status}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      template.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : template.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Crea plantillas en Meta Business Suite para enviar mensajes a usuarios que no han iniciado conversación.
              </p>
              <a
                href="https://business.facebook.com/wa/manage/message-templates/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Gestionar Plantillas
              </a>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 border border-green-100">
        <div className="flex items-start">
          <div className="p-2 rounded-lg bg-green-100 mr-4">
            <InformationCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Información Importante</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Costos:</strong> WhatsApp Business API tiene un costo aproximado de $0.0525 USD por mensaje.
              </p>
              <p>
                <strong>Plantillas:</strong> Se requieren plantillas pre-aprobadas para enviar mensajes a usuarios que no han iniciado conversación.
              </p>
              <p>
                <strong>Límites:</strong> No hay límites diarios de mensajes, pero se recomienda no superar 1000 mensajes por hora.
              </p>
              <p>
                <strong>Soporte:</strong> Para ayuda con la configuración, consulta la{' '}
                <a 
                  href="https://developers.facebook.com/docs/whatsapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  documentación oficial
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppConfig