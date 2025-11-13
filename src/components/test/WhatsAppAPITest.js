import React, { useState, useEffect } from 'react'
import communicationService from '../../services/communicationService.js'
import whatsappOfficialService from '../../services/whatsappOfficialService.js'
import whatsappWahaService from '../../services/whatsappWahaService.js'
import toast from 'react-hot-toast'

const WhatsAppAPITest = () => {
  const [apiStatus, setApiStatus] = useState({
    official: { configured: false, connected: false },
    waha: { configured: false, connected: false },
    legacy: { configured: false, connected: false },
    preferred: 'legacy'
  })
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('Este es un mensaje de prueba desde el sistema de integración de WhatsApp APIs')
  const [testPhone, setTestPhone] = useState('+56912345678')
  const [selectedAPI, setSelectedAPI] = useState('')

  useEffect(() => {
    checkAPIsStatus()
  }, [])

  const checkAPIsStatus = () => {
    try {
      const status = communicationService.getWhatsAppAPIsStatus()
      setApiStatus(status)
      
      // Set selected API to preferred
      setSelectedAPI(status.preferred)
    } catch (error) {
      console.error('Error checking APIs status:', error)
      toast.error('Error al verificar estado de las APIs')
    }
  }

  const testAPIs = async () => {
    setLoading(true)
    try {
      const results = await communicationService.testWhatsAppAPIs()
      setTestResults(results.results)
      
      if (results.success) {
        toast.success('Prueba de APIs completada')
      } else {
        toast.error('Error en la prueba de APIs')
      }
    } catch (error) {
      console.error('Error testing APIs:', error)
      toast.error('Error al probar las APIs')
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const result = await communicationService.sendWhatsAppMessageWithAPI(
        ['test-employee'],
        testMessage,
        {
          apiType: selectedAPI,
          testMode: true
        }
      )

      if (result.success) {
        toast.success(`Mensaje enviado exitosamente via ${selectedAPI}`)
      } else {
        toast.error('Error al enviar mensaje')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      toast.error('Error al enviar mensaje de prueba')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (api) => {
    const status = apiStatus[api]
    
    if (!status.configured) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">No configurado</span>
    }
    
    if (testResults[api]?.success) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Conectado</span>
    }
    
    if (testResults[api]?.success === false) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Error</span>
    }
    
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Sin probar</span>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test de Integración WhatsApp APIs</h1>
        
        {/* API Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado de las APIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Official API */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">WhatsApp Official API</h3>
                {getStatusBadge('official')}
              </div>
              <p className="text-sm text-gray-600 mb-2">API oficial de Meta</p>
              <div className="text-xs text-gray-500">
                {apiStatus.official.phoneNumberId && (
                  <p>Phone ID: {apiStatus.official.phoneNumberId}</p>
                )}
                {apiStatus.official.testMode && (
                  <p>Modo prueba: Activo</p>
                )}
              </div>
            </div>

            {/* WAHA API */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">WhatsApp WAHA API</h3>
                {getStatusBadge('waha')}
              </div>
              <p className="text-sm text-gray-600 mb-2">API waha.devike.pro</p>
              <div className="text-xs text-gray-500">
                {apiStatus.waha.sessionId && (
                  <p>Session: {apiStatus.waha.sessionId}</p>
                )}
                {apiStatus.waha.serverUrl && (
                  <p>Server: {apiStatus.waha.serverUrl}</p>
                )}
                {apiStatus.waha.testMode && (
                  <p>Modo prueba: Activo</p>
                )}
              </div>
            </div>

            {/* Legacy API */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">WhatsApp Legacy API</h3>
                {getStatusBadge('legacy')}
              </div>
              <p className="text-sm text-gray-600 mb-2">API existente</p>
              <div className="text-xs text-gray-500">
                {apiStatus.legacy.phoneNumberId && (
                  <p>Phone ID: {apiStatus.legacy.phoneNumberId}</p>
                )}
                {apiStatus.legacy.testMode && (
                  <p>Modo prueba: Activo</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>API preferida:</strong> {apiStatus.preferred}
            </p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Controles de Prueba</h2>
          <div className="space-y-4">
            <button
              onClick={testAPIs}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Conexión de Todas las APIs'}
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={checkAPIsStatus}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Actualizar Estado
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres limpiar todas las configuraciones de WhatsApp?')) {
                    whatsappOfficialService.clearConfiguration()
                    whatsappWahaService.clearConfiguration()
                    localStorage.removeItem('whatsapp_access_token')
                    localStorage.removeItem('whatsapp_phone_number_id')
                    localStorage.removeItem('whatsapp_webhook_verify_token')
                    localStorage.removeItem('whatsapp_test_mode')
                    checkAPIsStatus()
                    toast.success('Configuraciones limpiadas')
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Limpiar Configuraciones
              </button>
            </div>
          </div>
        </div>

        {/* Send Test Message */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Enviar Mensaje de Prueba</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API a utilizar:
              </label>
              <select
                value={selectedAPI}
                onChange={(e) => setSelectedAPI(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="official">WhatsApp Official API</option>
                <option value="waha">WhatsApp WAHA API</option>
                <option value="legacy">WhatsApp Legacy API</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de prueba:
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+56912345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de prueba:
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={sendTestMessage}
              disabled={loading || !selectedAPI}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : `Enviar via ${selectedAPI}`}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resultados de Prueba</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([api, result]) => (
                <div key={api} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">{api} API</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Éxito' : 'Error'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WhatsAppAPITest