import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import userGoogleDriveService from '../../services/userGoogleDriveService'
import './UserGoogleDriveConnector.css'

const UserGoogleDriveConnector = () => {
  const { user } = useAuth()
  
  const [connectionInfo, setConnectionInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadConnectionInfo = useCallback(async () => {
    try {
      setLoading(true)
      const info = await userGoogleDriveService.getConnectionInfo(user.id)
      setConnectionInfo(info)
    } catch (err) {
      console.error('Error al cargar información de conexión:', err)
      setError('Error al cargar información de conexión')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  const handleOAuthCallback = useCallback(async (code, state) => {
    try {
      setConnecting(true)
      setError(null)

      const result = await userGoogleDriveService.handleOAuthCallback(code, state, user.id)
      
      if (result.success) {
        setSuccess('¡Cuenta de Google Drive conectada exitosamente!')
        await loadConnectionInfo()
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        setError(result.error || 'Error al conectar la cuenta')
      }
    } catch (err) {
      console.error('Error en callback de OAuth:', err)
      setError('Error al procesar la autenticación')
    } finally {
      setConnecting(false)
    }
  }, [user.id, loadConnectionInfo])

  // Cargar información de conexión al montar el componente
  useEffect(() => {
    if (user) {
      loadConnectionInfo()
    }
  }, [user, loadConnectionInfo])

  // Verificar si viene de un callback de Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (code && state && user) {
      handleOAuthCallback(code, state)
    } else if (error) {
      setError(`Error de autenticación: ${error}`)
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [user, handleOAuthCallback])

  const handleConnectGoogleDrive = async () => {
    try {
      setConnecting(true)
      setError(null)
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Generar URL de autenticación
      const authUrl = userGoogleDriveService.generateAuthUrl(user.id)
      
      // Redirigir a Google OAuth
      window.location.href = authUrl
    } catch (err) {
      console.error('Error al conectar Google Drive:', err)
      setError(err.message)
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás seguro de que quieres desconectar tu cuenta de Google Drive?')) {
      return
    }

    try {
      setConnecting(true)
      setError(null)
      
      const success = await userGoogleDriveService.disconnectUserAccount(user.id)
      
      if (success) {
        setSuccess('Cuenta de Google Drive desconectada exitosamente')
        await loadConnectionInfo()
      } else {
        setError('Error al desconectar la cuenta')
      }
    } catch (err) {
      console.error('Error al desconectar Google Drive:', err)
      setError('Error al desconectar la cuenta')
    } finally {
      setConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setConnecting(true)
      setError(null)
      
      // Intentar obtener un token válido para probar la conexión
      const token = await userGoogleDriveService.getValidAccessToken(user.id)
      
      if (token) {
        setSuccess('Conexión con Google Drive verificada exitosamente')
        await loadConnectionInfo()
      }
    } catch (err) {
      console.error('Error al probar conexión:', err)
      setError('Error al verificar la conexión: ' + err.message)
    } finally {
      setConnecting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'connected':
        return '#10b981' // green
      case 'pending':
      case 'syncing':
        return '#f59e0b' // yellow
      case 'error':
      case 'disconnected':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Conectado y sincronizado'
      case 'pending':
        return 'Pendiente de sincronización'
      case 'syncing':
        return 'Sincronizando...'
      case 'error':
        return 'Error de sincronización'
      case 'disconnected':
        return 'Desconectado'
      case 'not_connected':
        return 'No conectado'
      default:
        return 'Desconocido'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="user-google-drive-connector">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información de conexión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-google-drive-connector">
      <div className="connector-header">
        <h2>
          <span className="google-drive-icon">📁</span>
          Mi Cuenta de Google Drive
        </h2>
        <p>Conecta tu cuenta personal de Google Drive para gestionar tus archivos</p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Estado de Conexión */}
      <div className="connection-status-card">
        <div className="status-header">
          <h3>Estado de Conexión</h3>
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(connectionInfo?.syncStatus) }}
          ></div>
        </div>

        {connectionInfo?.isConnected ? (
          <div className="connection-info">
            <div className="user-info">
              {connectionInfo.googleAvatarUrl && (
                <img 
                  src={connectionInfo.googleAvatarUrl} 
                  alt="Avatar" 
                  className="google-avatar"
                />
              )}
              <div className="user-details">
                <p className="google-name">{connectionInfo.googleName}</p>
                <p className="google-email">{connectionInfo.googleEmail}</p>
              </div>
            </div>

            <div className="connection-details">
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span 
                  className="detail-value"
                  style={{ color: getStatusColor(connectionInfo.syncStatus) }}
                >
                  {getStatusText(connectionInfo.syncStatus)}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Última sincronización:</span>
                <span className="detail-value">
                  {formatDate(connectionInfo.lastSyncAt)}
                </span>
              </div>

              {connectionInfo.defaultFolderId && (
                <div className="detail-item">
                  <span className="detail-label">Carpeta predeterminada:</span>
                  <span className="detail-value">Configurada</span>
                </div>
              )}
            </div>

            <div className="connection-actions">
              <button
                onClick={handleTestConnection}
                disabled={connecting}
                className="btn btn-secondary"
              >
                {connecting ? 'Verificando...' : '🔄 Verificar Conexión'}
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={connecting}
                className="btn btn-danger"
              >
                {connecting ? 'Desconectando...' : '🔌 Desconectar Cuenta'}
              </button>
            </div>
          </div>
        ) : (
          <div className="no-connection">
            <div className="no-connection-icon">🔌</div>
            <h3>No hay cuenta conectada</h3>
            <p>Conecta tu cuenta de Google Drive para empezar a gestionar tus archivos</p>
            
            <button
              onClick={handleConnectGoogleDrive}
              disabled={connecting}
              className="btn btn-primary btn-large"
            >
              {connecting ? (
                <>
                  <div className="btn-spinner"></div>
                  Conectando con Google Drive...
                </>
              ) : (
                <>
                  <span className="google-logo">G</span>
                  Conectar mi Cuenta de Google Drive
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="info-section">
        <h3>📋 Información Importante</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🔒 Privacidad y Seguridad</h4>
            <p>Tu cuenta de Google Drive es completamente privada. Solo tú tienes acceso a tus archivos y credenciales.</p>
          </div>
          
          <div className="info-item">
            <h4>🔄 Sincronización Automática</h4>
            <p>Los tokens se renuevan automáticamente para mantener tu conexión activa sin interrupciones.</p>
          </div>
          
          <div className="info-item">
            <h4>📁 Acceso Completo</h4>
            <p>Podrás crear, leer, actualizar y eliminar archivos en tu cuenta de Google Drive.</p>
          </div>
          
          <div className="info-item">
            <h4>🚀 Rendimiento</h4>
            <p>La conexión directa con Google Drive garantiza operaciones rápidas y eficientes.</p>
          </div>
        </div>
      </div>

      {/* Configuración Adicional (si está conectado) */}
      {connectionInfo?.isConnected && (
        <div className="advanced-settings">
          <h3>⚙️ Configuración Avanzada</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked={true} />
                Habilitar sincronización automática
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                Intervalo de sincronización:
                <select defaultValue="30">
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="240">4 horas</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserGoogleDriveConnector