import React from 'react';

const GoogleDriveSimplePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Configuración de Google Drive
      </h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🚀 Configuración Simplificada de Google Drive
        </h2>
        <p className="text-blue-800 mb-4">
          Para configurar Google Drive con BrifyRRHH v2, sigue estos pasos simples:
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
              <p className="text-blue-800">Crea credenciales de OAuth 2.0 con el URI de redireccionamiento: <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000/auth/google/callback</code></p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">4.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Copia las credenciales</h3>
              <p className="text-blue-800">Guarda el ID de cliente y el cliente secreto</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">5.</span>
            <div>
              <h3 className="font-semibold text-blue-900">Configura en la aplicación</h3>
              <p className="text-blue-800">Ve a Configuración → Integraciones → Google Drive y pega tus credenciales</p>
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