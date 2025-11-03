import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import googleDriveService from '../../lib/googleDrive'
import {
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const Integrations = () => {
  const { userProfile } = useAuth()
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const checkGoogleDriveConnection = useCallback(() => {
    // Usar la información ya disponible en userProfile desde AuthContext
    // que incluye las credenciales de Google Drive
    const isConnected = !!(userProfile?.google_refresh_token && userProfile.google_refresh_token.trim() !== '')
    setIsGoogleDriveConnected(isConnected)
    setLoading(false)
  }, [userProfile])

  useEffect(() => {
    checkGoogleDriveConnection()
  }, [checkGoogleDriveConnection])

  const handleConnectGoogleDrive = async () => {
    try {
      setConnecting(true)
      const authUrl = googleDriveService.generateAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error getting auth URL:', error)
      toast.error('Error al conectar con Google Drive')
      setConnecting(false)
    }
  }

  const handleDisconnectGoogleDrive = async () => {
    try {
      setConnecting(true)
      // Aquí podrías agregar la lógica para desconectar Google Drive
      // Por ahora, solo mostraremos un mensaje
      toast.success('Para desconectar Google Drive, contacta al administrador')
      setConnecting(false)
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error)
      toast.error('Error al desconectar Google Drive')
      setConnecting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Cargando integraciones..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integraciones</h1>
          <p className="text-gray-600">
            Conecta tus servicios favoritos para mejorar tu experiencia
          </p>
        </div>

        {/* Google Drive Integration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <CloudIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Google Drive</h3>
                <p className="text-sm text-gray-600">
                  Sincroniza tus archivos y carpetas con Google Drive
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {isGoogleDriveConnected ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 font-medium mr-4">Conectado</span>
                  <button
                    onClick={handleDisconnectGoogleDrive}
                    disabled={connecting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 disabled:opacity-50"
                  >
                    {connecting ? (
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    )}
                    Desconectar
                  </button>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-600 font-medium mr-4">No conectado</span>
                  <button
                    onClick={handleConnectGoogleDrive}
                    disabled={connecting}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm leading-4 font-medium rounded-md focus:outline-none transition-colors duration-200 disabled:opacity-50"
                  >
                    {connecting ? (
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CloudIcon className="h-4 w-4 mr-2" />
                    )}
                    Conectar
                  </button>
                </>
              )}
            </div>
          </div>

          {isGoogleDriveConnected && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Google Drive está conectado</p>
                  <p className="mt-1">
                    Tus archivos se sincronizarán automáticamente con tu cuenta de Google Drive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isGoogleDriveConnected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Google Drive no está conectado</p>
                  <p className="mt-1">
                    Conecta tu cuenta de Google Drive para sincronizar archivos automáticamente y acceder desde cualquier dispositivo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Próximas integraciones (placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Más integraciones próximamente</h3>
                <p className="text-sm text-gray-600">
                  Estamos trabajando para traerte más integraciones útiles
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-400 font-medium">Próximamente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Integrations