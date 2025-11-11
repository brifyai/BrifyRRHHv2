import React, { useState, useEffect } from 'react'

const GoogleDriveURIDebugger = () => {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const collectDebugInfo = () => {
      const currentHost = window.location.hostname
      const currentProtocol = window.location.protocol
      const currentPort = window.location.port
      const isDevelopment = currentHost === 'localhost' || currentHost === '127.0.0.1'
      
      // Lógica de detección del mismo código que googleDrive.js
      const redirectUri = isDevelopment ? 
        'http://localhost:3000/auth/google/callback' : 
        `${currentProtocol}//${currentHost}${currentPort ? `:${currentPort}` : ''}/auth/google/callback`
      
      // También probar la URL de Netlify específica
      const netlifyUri = 'https://brifyrrhhv2.netlify.app/auth/google/callback'
      
      const environmentVars = {
        REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'NO_CONFIGURED',
        REACT_APP_GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'NO_CONFIGURED'
      }

      const info = {
        timestamp: new Date().toISOString(),
        currentLocation: {
          hostname: currentHost,
          protocol: currentProtocol,
          port: currentPort,
          href: window.location.href,
          origin: window.location.origin
        },
        environment: {
          isDevelopment,
          detectedEnvironment: isDevelopment ? 'Desarrollo' : 'Producción',
          processEnv: {
            NODE_ENV: process.env.NODE_ENV,
            REACT_APP_GOOGLE_CLIENT_ID: environmentVars.REACT_APP_GOOGLE_CLIENT_ID !== 'NO_CONFIGURED' ? '[CONFIGURED]' : 'MISSING',
            REACT_APP_GOOGLE_REDIRECT_URI: environmentVars.REACT_APP_GOOGLE_REDIRECT_URI !== 'NO_CONFIGURED' ? '[CONFIGURED]' : 'MISSING'
          }
        },
        redirectUris: {
          currentUri: redirectUri,
          netlifyUri: netlifyUri,
          shouldUseCurrent: isDevelopment,
          shouldUseNetlify: !isDevelopment
        },
        googleCloudConsoleURIs: [
          'http://localhost:3000/auth/google/callback',
          'https://brifyrrhhv2.netlify.app/auth/google/callback'
        ],
        issues: []
      }

      // Verificar problemas
      if (environmentVars.REACT_APP_GOOGLE_CLIENT_ID === 'NO_CONFIGURED') {
        info.issues.push('❌ REACT_APP_GOOGLE_CLIENT_ID no está configurado')
      } else {
        info.issues.push('✅ REACT_APP_GOOGLE_CLIENT_ID está configurado')
      }

      if (!isDevelopment) {
        // Si estamos en producción, verificar si la URI de Netlify está en la lista
        if (currentHost !== 'brifyrrhhv2.netlify.app') {
          info.issues.push(`⚠️ Host actual (${currentHost}) no es la URL de Netlify esperada (brifyrrhhv2.netlify.app)`)
        }
      }

      if (!isDevelopment) {
        // Verificar si la URI generada coincide con la de Netlify
        if (redirectUri !== netlifyUri) {
          info.issues.push(`❌ URI generada (${redirectUri}) no coincide con URI de Netlify (${netlifyUri})`)
        } else {
          info.issues.push('✅ URI generada coincide con la de Netlify')
        }
      }

      setDebugInfo(info)
      setLoading(false)
    }

    collectDebugInfo()
  }, [])

  const testOAuth = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectUri = isDevelopment ? 
      'http://localhost:3000/auth/google/callback' : 
      `${window.location.origin}/auth/google/callback`
    
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    if (!clientId) {
      alert('❌ No hay client ID configurado')
      return
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    
    console.log('🧪 Probando OAuth con:', { redirectUri, clientId: clientId.substring(0, 20) + '...' })
    
    // Abrir en nueva ventana para testing
    window.open(authUrl, '_blank', 'width=500,height=600')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Recopilando información de diagnóstico...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold">🧪 Google Drive OAuth URI Debugger</h1>
            <p className="text-blue-100 mt-2">Herramienta de diagnóstico para el error 400 redirect_uri_mismatch</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Información Actual */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">🌍 Ubicación Actual</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Host:</span> {debugInfo.currentLocation.hostname}
                </div>
                <div>
                  <span className="font-medium">Protocolo:</span> {debugInfo.currentLocation.protocol}
                </div>
                <div>
                  <span className="font-medium">Puerto:</span> {debugInfo.currentLocation.port || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Environment:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    debugInfo.environment.isDevelopment 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {debugInfo.environment.detectedEnvironment}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">URL Completa:</span> 
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{debugInfo.currentLocation.href}</code>
              </div>
            </div>

            {/* Variables de Entorno */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">⚙️ Variables de Entorno</h2>
              <div className="space-y-2 text-sm">
                {Object.entries(debugInfo.environment.processEnv).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      value === 'MISSING' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* URIs de Redirect */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">🔗 URIs de Redirección</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-sm">URI Actual Generada:</span>
                  <code className="ml-2 bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm block mt-1">
                    {debugInfo.redirectUris.currentUri}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-sm">URI de Netlify Esperada:</span>
                  <code className="ml-2 bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm block mt-1">
                    {debugInfo.redirectUris.netlifyUri}
                  </code>
                </div>
              </div>
            </div>

            {/* URIs en Google Cloud Console */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-3">☁️ URIs en Google Cloud Console</h2>
              <div className="space-y-2">
                {debugInfo.googleCloudConsoleURIs.map((uri, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{uri}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas Detectados */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 mb-3">🚨 Problemas Detectados</h2>
              <div className="space-y-2">
                {debugInfo.issues.map((issue, index) => (
                  <div key={index} className="text-sm">
                    {issue}
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de Prueba */}
            <div className="flex justify-center">
              <button
                onClick={testOAuth}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🧪 Probar OAuth Ahora
              </button>
            </div>

            {/* Información Técnica */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">📊 Información Técnica</h2>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Timestamp: {debugInfo.timestamp}</div>
                <div>User Agent: {navigator.userAgent}</div>
                <div>Screen: {window.screen.width}x{window.screen.height}</div>
                <div>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleDriveURIDebugger