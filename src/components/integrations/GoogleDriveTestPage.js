import React from 'react';

const GoogleDriveTestPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Página de Prueba de Google Drive
      </h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          ✅ Página de Prueba Funcionando
        </h2>
        <p className="text-green-800">
          Esta es una página de prueba simplificada para verificar que las rutas funcionan correctamente.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Información de Depuración:</h3>
          <ul className="text-blue-800 space-y-1">
            <li>✅ Componente cargado correctamente</li>
            <li>✅ Sin dependencias externas</li>
            <li>✅ Sin redirecciones automáticas</li>
            <li>✅ Ruta funcionando</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Enlaces de Prueba:</h3>
          <div className="space-y-2">
            <a 
              href="/integrations/google-drive" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Selector de Integración
            </a>
            <a 
              href="/integrations/google-drive/auto-setup" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Configuración Automática
            </a>
            <a 
              href="/integrations/google-drive/wizard" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Asistente Interactivo
            </a>
            <a 
              href="/google-drive-quick-setup" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Guía Rápida
            </a>
          </div>
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

export default GoogleDriveTestPage;