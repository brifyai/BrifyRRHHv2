import React, { useState } from 'react';
import googleDriveService from '../../lib/googleDriveService.js';
import { toast } from 'react-hot-toast';

const GoogleDriveSimplePage = () => {
  const [loading, setLoading] = useState(false);
  const [hasTokens, setHasTokens] = useState(googleDriveService.hasValidTokens());

  const handleAuthorize = () => {
    try {
      setLoading(true);
      console.log('🔗 Iniciando autorización de Google Drive...');
      const authUrl = googleDriveService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ Error en autorización:', error);
      toast.error('Error al iniciar autorización de Google Drive');
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      console.log('🔄 Revocando tokens de Google Drive...');
      await googleDriveService.revokeTokens();
      setHasTokens(false);
      toast.success('Tokens revocados correctamente');
    } catch (error) {
      console.error('❌ Error revocando tokens:', error);
      toast.error('Error al revocar tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Configuración de Google Drive
      </h1>
      
      {/* Estado de Conexión */}
      <div className={`rounded-lg p-6 mb-6 border ${hasTokens ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold mb-2 ${hasTokens ? 'text-green-900' : 'text-yellow-900'}`}>
              {hasTokens ? '✅ Conectado a Google Drive' : '⚠️ No conectado a Google Drive'}
            </h2>
            <p className={hasTokens ? 'text-green-800' : 'text-yellow-800'}>
              {hasTokens
                ? 'Tu cuenta está autorizada para acceder a Google Drive'
                : 'Necesitas autorizar el acceso a tu Google Drive'}
            </p>
          </div>
          <button
            onClick={hasTokens ? handleRevoke : handleAuthorize}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              hasTokens
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? '⏳ Procesando...' : (hasTokens ? '🔓 Desconectar' : '🔗 Conectar')}
          </button>
        </div>
      </div>
      
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🚀 Configuración de Google Drive
        </h2>
        <p className="text-blue-800 mb-4">
          Para configurar Google Drive con BrifyRRHH v2, sigue estos pasos:
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">1.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Crea un proyecto en Google Cloud</h3>
              <p className="text-blue-800">Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> y crea un nuevo proyecto</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">2.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Habilita Google Drive API</h3>
              <p className="text-blue-800">Busca "Google Drive API" y haz clic en "Habilitar"</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">3.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Configura OAuth 2.0</h3>
              <p className="text-blue-800">Crea credenciales de OAuth 2.0 con el URI de redireccionamiento correcto para tu ambiente</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">4.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Copia las credenciales</h3>
              <p className="text-blue-800">Guarda el ID de cliente y el cliente secreto en las variables de entorno</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">5.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Autoriza la aplicación</h3>
              <p className="text-blue-800">Haz clic en el botón "Conectar" arriba para autorizar el acceso a tu Google Drive</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          ✅ ¿Necesitas ayuda adicional?
        </h3>
        <div className="space-y-2">
          <a
            href="/configuracion/integraciones"
            className="block text-green-800 hover:text-green-900 underline"
          >
            → Ir a Configuración de Integraciones
          </a>
          <a
            href="/panel-principal"
            className="block text-green-800 hover:text-green-900 underline"
          >
            → Volver al Panel Principal
          </a>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default GoogleDriveSimplePage;