import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.js'
import userGoogleDriveService from '../../services/userGoogleDriveService'
import userSpecificGoogleDriveService from '../../services/userSpecificGoogleDriveService'
import './GoogleDriveConnectionVerifier.css'

const GoogleDriveConnectionVerifier = () => {
  const { user } = useAuth()
  const [verificationResults, setVerificationResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const verificationSteps = [
    { id: 'env', name: 'Variables de Entorno', icon: '🔧' },
    { id: 'service', name: 'Servicio de Autenticación', icon: '🔐' },
    { id: 'connection', name: 'Conexión con Google Drive', icon: '🔗' },
    { id: 'operations', name: 'Operaciones de API', icon: '⚡' },
    { id: 'database', name: 'Base de Datos', icon: '💾' }
  ]

  useEffect(() => {
    if (user) {
      runCompleteVerification()
    }
  }, [user])

  const runCompleteVerification = async () => {
    setLoading(true)
    const results = {}

    for (let i = 0; i < verificationSteps.length; i++) {
      setCurrentStep(i)
      const step = verificationSteps[i]
      
      try {
        switch (step.id) {
          case 'env':
            results.env = await verifyEnvironment()
            break
          case 'service':
            results.service = await verifyService()
            break
          case 'connection':
            results.connection = await verifyConnection()
            break
          case 'operations':
            results.operations = await verifyOperations()
            break
          case 'database':
            results.database = await verifyDatabase()
            break
        }
      } catch (error) {
        results[step.id] = {
          success: false,
          error: error.message,
          details: null
        }
      }

      // Pequeña pausa para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setVerificationResults(results)
    setLoading(false)
    setCurrentStep(verificationSteps.length)
  }

  const verifyEnvironment = async () => {
    const envVars = {
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      environment: process.env.REACT_APP_ENVIRONMENT,
      netlifyUrl: process.env.REACT_APP_NETLIFY_URL
    }

    const checks = {
      clientId: !!envVars.clientId,
      clientSecret: !!envVars.clientSecret,
      apiKey: !!envVars.apiKey,
      environment: !!envVars.environment,
      netlifyUrl: !!envVars.netlifyUrl,
      correctRedirectUri: envVars.environment === 'production' 
        ? envVars.netlifyUrl === 'https://brifyrrhhv2.netlify.app'
        : true
    }

    const allPassed = Object.values(checks).every(Boolean)

    return {
      success: allPassed,
      details: {
        vars: {
          clientId: envVars.clientId ? `${envVars.clientId.substring(0, 20)}...` : '❌ No configurado',
          clientSecret: envVars.clientSecret ? '✅ Configurado' : '❌ No configurado',
          apiKey: envVars.apiKey ? '✅ Configurado' : '❌ No configurado',
          environment: envVars.environment || '❌ No configurado',
          netlifyUrl: envVars.netlifyUrl || '❌ No configurado'
        },
        checks,
        redirectUri: envVars.environment === 'production' 
          ? 'https://brifyrrhhv2.netlify.app/auth/google/callback'
          : 'http://localhost:3000/auth/google/callback'
      }
    }
  }

  const verifyService = async () => {
    try {
      // Verificar que el servicio esté inicializado correctamente
      const serviceInitialized = !!userGoogleDriveService.clientId
      
      // Verificar generación de URL de autenticación
      let authUrl = null
      if (serviceInitialized && user) {
        authUrl = userGoogleDriveService.generateAuthUrl(user.id, 'test_state')
      }

      return {
        success: serviceInitialized && !!authUrl,
        details: {
          serviceInitialized,
          authUrlGenerated: !!authUrl,
          authUrl: authUrl ? authUrl.substring(0, 100) + '...' : null,
          scopes: userGoogleDriveService.scopes,
          redirectUri: userGoogleDriveService.redirectUri
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      }
    }
  }

  const verifyConnection = async () => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Verificar estado de conexión
      const isConnected = await userGoogleDriveService.isUserConnected(user.id)
      const connectionInfo = await userGoogleDriveService.getConnectionInfo(user.id)

      return {
        success: true,
        details: {
          isConnected,
          connectionInfo,
          hasCredentials: !!connectionInfo.googleEmail,
          syncStatus: connectionInfo.syncStatus
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      }
    }
  }

  const verifyOperations = async () => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const operations = []

      // Solo probar operaciones si el usuario está conectado
      const isConnected = await userGoogleDriveService.isUserConnected(user.id)
      
      if (isConnected) {
        try {
          // Probar obtención de token válido
          const token = await userGoogleDriveService.getValidAccessToken(user.id)
          operations.push({
            name: 'Obtener Token Válido',
            success: !!token,
            details: token ? '✅ Token obtenido' : '❌ No se pudo obtener token'
          })

          // Probar servicio específico de Google Drive
          const driveService = await userSpecificGoogleDriveService.getUserDriveService(user.id)
          operations.push({
            name: 'Servicio Google Drive',
            success: !!driveService,
            details: driveService ? '✅ Servicio inicializado' : '❌ Error al inicializar'
          })

          // Probar listar archivos (operación segura)
          try {
            const filesResult = await userSpecificGoogleDriveService.listFiles(user.id, null, 5)
            operations.push({
              name: 'Listar Archivos',
              success: filesResult.success,
              details: filesResult.success 
                ? `✅ Se encontraron ${filesResult.files.length} archivos` 
                : `❌ Error: ${filesResult.error}`
            })
          } catch (fileError) {
            operations.push({
              name: 'Listar Archivos',
              success: false,
              details: `❌ Error: ${fileError.message}`
            })
          }

        } catch (opError) {
          operations.push({
            name: 'Operaciones API',
            success: false,
            details: `❌ Error general: ${opError.message}`
          })
        }
      } else {
        operations.push({
          name: 'Estado de Conexión',
          success: false,
          details: '⚠️ Usuario no conectado - Omitiendo pruebas de API'
        })
      }

      return {
        success: true,
        details: {
          operations,
          totalTests: operations.length,
          passedTests: operations.filter(op => op.success).length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      }
    }
  }

  const verifyDatabase = async () => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Verificar que podemos obtener información de la base de datos
      const connectionInfo = await userGoogleDriveService.getConnectionInfo(user.id)
      
      return {
        success: true,
        details: {
          canAccessDatabase: true,
          hasCredentials: !!connectionInfo.googleEmail,
          syncStatus: connectionInfo.syncStatus,
          lastSyncAt: connectionInfo.lastSyncAt,
          tableName: 'user_google_drive_credentials',
          recordExists: connectionInfo.isConnected
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      }
    }
  }

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌'
  }

  const getStatusColor = (success) => {
    return success ? '#10b981' : '#ef4444'
  }

  const runTestConnection = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = await userGoogleDriveService.getValidAccessToken(user.id)
      if (token) {
        alert('✅ Conexión verificada exitosamente')
      }
    } catch (error) {
      alert(`❌ Error de conexión: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading && currentStep < verificationSteps.length) {
    return (
      <div className="connection-verifier">
        <div className="loading-state">
          <div className="step-indicator">
            <div className="step-number">{currentStep + 1}</div>
            <div className="step-info">
              <h3>{verificationSteps[currentStep].icon} {verificationSteps[currentStep].name}</h3>
              <p>Verificando...</p>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / verificationSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="connection-verifier">
      <div className="verifier-header">
        <h1>🔍 Verificación Completa del Sistema</h1>
        <p>Análisis exhaustivo de todos los componentes del sistema de Google Drive</p>
      </div>

      {/* Resumen General */}
      <div className="summary-card">
        <h2>📊 Resumen de Verificación</h2>
        <div className="summary-grid">
          {verificationSteps.map((step, index) => {
            const result = verificationResults[step.id]
            return (
              <div key={step.id} className="summary-item">
                <div className="summary-icon">
                  {step.icon} {getStatusIcon(result?.success)}
                </div>
                <div className="summary-text">
                  <h4>{step.name}</h4>
                  <p>{result?.success ? '✅ Pasó' : result?.error ? '❌ Error' : '⏳ Pendiente'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalles de Verificación */}
      <div className="details-section">
        <h2>🔋 Detalles de Verificación</h2>
        
        {/* Variables de Entorno */}
        <div className="detail-card">
          <h3>🔧 Variables de Entorno</h3>
          {verificationResults.env ? (
            <div className="detail-content">
              <div className="env-vars">
                <div className="env-var">
                  <span>Client ID:</span>
                  <code>{verificationResults.env.details.vars.clientId}</code>
                </div>
                <div className="env-var">
                  <span>Client Secret:</span>
                  <span>{verificationResults.env.details.vars.clientSecret}</span>
                </div>
                <div className="env-var">
                  <span>API Key:</span>
                  <span>{verificationResults.env.details.vars.apiKey}</span>
                </div>
                <div className="env-var">
                  <span>Environment:</span>
                  <span>{verificationResults.env.details.vars.environment}</span>
                </div>
                <div className="env-var">
                  <span>Netlify URL:</span>
                  <span>{verificationResults.env.details.vars.netlifyUrl}</span>
                </div>
                <div className="env-var">
                  <span>Redirect URI:</span>
                  <code>{verificationResults.env.details.redirectUri}</code>
                </div>
              </div>
            </div>
          ) : (
            <p>⏳ Verificando...</p>
          )}
        </div>

        {/* Servicio de Autenticación */}
        <div className="detail-card">
          <h3>🔐 Servicio de Autenticación</h3>
          {verificationResults.service ? (
            <div className="detail-content">
              <div className="service-info">
                <div className="service-item">
                  <span>Servicio Inicializado:</span>
                  <span>{verificationResults.service.details.serviceInitialized ? '✅' : '❌'}</span>
                </div>
                <div className="service-item">
                  <span>URL de Autenticación:</span>
                  <span>{verificationResults.service.details.authUrlGenerated ? '✅' : '❌'}</span>
                </div>
                <div className="service-item">
                  <span>Redirect URI:</span>
                  <code>{verificationResults.service.details.redirectUri}</code>
                </div>
                <div className="service-item">
                  <span>Scopes:</span>
                  <div className="scopes">
                    {verificationResults.service.details.scopes.map((scope, index) => (
                      <code key={index} className="scope-tag">{scope}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>⏳ Verificando...</p>
          )}
        </div>

        {/* Conexión */}
        <div className="detail-card">
          <h3>🔗 Conexión con Google Drive</h3>
          {verificationResults.connection ? (
            <div className="detail-content">
              <div className="connection-info">
                <div className="connection-item">
                  <span>Estado de Conexión:</span>
                  <span>{verificationResults.connection.details.isConnected ? '✅ Conectado' : '❌ No conectado'}</span>
                </div>
                <div className="connection-item">
                  <span>Email de Google:</span>
                  <span>{verificationResults.connection.details.connectionInfo.googleEmail || 'No disponible'}</span>
                </div>
                <div className="connection-item">
                  <span>Nombre:</span>
                  <span>{verificationResults.connection.details.connectionInfo.googleName || 'No disponible'}</span>
                </div>
                <div className="connection-item">
                  <span>Estado de Sincronización:</span>
                  <span>{verificationResults.connection.details.connectionInfo.syncStatus}</span>
                </div>
                <div className="connection-item">
                  <span>Última Sincronización:</span>
                  <span>{verificationResults.connection.details.connectionInfo.lastSyncAt || 'Nunca'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p>⏳ Verificando...</p>
          )}
        </div>

        {/* Operaciones */}
        <div className="detail-card">
          <h3>⚡ Operaciones de API</h3>
          {verificationResults.operations ? (
            <div className="detail-content">
              <div className="operations-summary">
                <p>Total de pruebas: <strong>{verificationResults.operations.details.totalTests}</strong></p>
                <p>Pruebas pasadas: <strong>{verificationResults.operations.details.passedTests}</strong></p>
              </div>
              <div className="operations-list">
                {verificationResults.operations.details.operations.map((op, index) => (
                  <div key={index} className="operation-item">
                    <span className="operation-status">{op.success ? '✅' : '❌'}</span>
                    <span className="operation-name">{op.name}</span>
                    <span className="operation-details">{op.details}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>⏳ Verificando...</p>
          )}
        </div>

        {/* Base de Datos */}
        <div className="detail-card">
          <h3>💾 Base de Datos</h3>
          {verificationResults.database ? (
            <div className="detail-content">
              <div className="database-info">
                <div className="database-item">
                  <span>Acceso a Base de Datos:</span>
                  <span>{verificationResults.database.details.canAccessDatabase ? '✅' : '❌'}</span>
                </div>
                <div className="database-item">
                  <span>Tabla:</span>
                  <code>{verificationResults.database.details.tableName}</code>
                </div>
                <div className="database-item">
                  <span>Registro Existe:</span>
                  <span>{verificationResults.database.details.recordExists ? '✅' : '❌'}</span>
                </div>
                <div className="database-item">
                  <span>Credenciales Almacenadas:</span>
                  <span>{verificationResults.database.details.hasCredentials ? '✅' : '❌'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p>⏳ Verificando...</p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="actions-section">
        <h2>🎯 Acciones Rápidas</h2>
        <div className="action-buttons">
          <button onClick={runCompleteVerification} className="btn btn-primary" disabled={loading}>
            🔄 Re-ejecutar Verificación
          </button>
          <button onClick={runTestConnection} className="btn btn-secondary" disabled={loading}>
            🔗 Probar Conexión
          </button>
          <button onClick={() => window.open('/integrations/my-google-drive', '_blank')} className="btn btn-secondary">
            📁 Ir a Conexión Google Drive
          </button>
          <button onClick={() => window.open('/google-drive-uri-checker', '_blank')} className="btn btn-secondary">
            🔍 Diagnóstico URI
          </button>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="recommendations-section">
        <h2>💡 Recomendaciones</h2>
        <div className="recommendations">
          {Object.entries(verificationResults).map(([key, result]) => {
            if (!result) return null
            
            if (result.success) {
              return (
                <div key={key} className="recommendation success">
                  <span className="rec-icon">✅</span>
                  <span className="rec-text">
                    {verificationSteps.find(s => s.id === key)?.name}: Todo funciona correctamente
                  </span>
                </div>
              )
            } else {
              return (
                <div key={key} className="recommendation error">
                  <span className="rec-icon">⚠️</span>
                  <span className="rec-text">
                    {verificationSteps.find(s => s.id === key)?.name}: {result.error || 'Requiere atención'}
                  </span>
                </div>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

export default GoogleDriveConnectionVerifier