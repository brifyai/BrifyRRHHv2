import React from 'react';

const TestHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          🚀 Test Home Moderno - StaffHub
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">✅ Componente HomeModern Cargado</h2>
          <p className="text-gray-600 mb-4">
            Si estás viendo esta página, significa que el nuevo componente HomeModern está funcionando correctamente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-100 p-6 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-2">🎨 Diseño Moderno</h3>
              <p className="text-blue-600">Interfaz actualizada con gradientes y animaciones</p>
            </div>
            
            <div className="bg-purple-100 p-6 rounded-xl">
              <h3 className="font-bold text-purple-800 mb-2">📱 Responsive</h3>
              <p className="text-purple-600">Optimizado para todos los dispositivos</p>
            </div>
            
            <div className="bg-green-100 p-6 rounded-xl">
              <h3 className="font-bold text-green-800 mb-2">⚡ Rápido</h3>
              <p className="text-green-600">Carga optimizada y rendimiento mejorado</p>
            </div>
            
            <div className="bg-orange-100 p-6 rounded-xl">
              <h3 className="font-bold text-orange-800 mb-2">🔧 Funcional</h3>
              <p className="text-orange-600">Formulario de login integrado y navegación</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">🔍 Pasos para ver los cambios</h2>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>Refresca el navegador</strong> - Presiona F5 o Ctrl+R (Cmd+R en Mac)
            </li>
            <li>
              <strong>Limpia la caché</strong> - Presiona Ctrl+Shift+R (Cmd+Shift+R en Mac)
            </li>
            <li>
              <strong>Abre en incógnito</strong> - Abre una nueva ventana de incógnito para probar
            </li>
            <li>
              <strong>Revisa la consola</strong> - Abre las herramientas de desarrollador (F12)
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800">
              <strong>💡 Tip:</strong> Si no ves los cambios, es posible que el navegador esté guardando caché. 
              Intenta abrir la aplicación en una ventana de incógnito.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            Volver al Home Moderno
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestHome;