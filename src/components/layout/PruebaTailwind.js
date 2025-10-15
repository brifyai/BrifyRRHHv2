import React from 'react';

const PruebaTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-engage-black via-engage-blue/10 to-engage-yellow/10 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-engage-black mb-8 text-center">
          Prueba de Estilos <span className="text-engage-blue">Tailwind</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prueba de colores de texto */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-engage-black mb-4">Colores de Texto</h2>
            <div className="space-y-3">
              <p className="text-engage-black text-lg">Texto Negro (#000000)</p>
              <p className="text-engage-yellow text-lg">Texto Amarillo (#fcb900)</p>
              <p className="text-engage-blue text-lg">Texto Azul (#0693e3)</p>
            </div>
          </div>
          
          {/* Prueba de colores de fondo */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-engage-black mb-4">Colores de Fondo</h2>
            <div className="space-y-3">
              <div className="p-4 bg-engage-black text-white rounded-lg">Fondo Negro</div>
              <div className="p-4 bg-engage-yellow text-engage-black rounded-lg">Fondo Amarillo</div>
              <div className="p-4 bg-engage-blue text-white rounded-lg">Fondo Azul</div>
            </div>
          </div>
          
          {/* Prueba de botones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-engage-black mb-4">Botones Personalizados</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-primary">Primario</button>
              <button className="btn-secondary">Secundario</button>
              <button className="btn-yellow">Amarillo</button>
              <button className="btn-black">Negro</button>
            </div>
          </div>
          
          {/* Prueba de gradientes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-engage-black mb-4">Gradientes</h2>
            <div className="space-y-4">
              <div className="h-16 rounded-lg bg-gradient-to-r from-engage-black to-engage-blue"></div>
              <div className="h-16 rounded-lg bg-gradient-to-r from-engage-blue to-engage-yellow"></div>
              <div className="h-16 rounded-lg bg-gradient-to-r from-engage-yellow to-engage-black"></div>
            </div>
          </div>
        </div>
        
        {/* Prueba de hover */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-engage-black mb-4">Efectos Hover</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-engage-black text-white rounded-lg hover:bg-engage-blue transition-colors">
              Hover Negro → Azul
            </button>
            <button className="px-6 py-3 bg-engage-blue text-white rounded-lg hover:bg-engage-yellow transition-colors">
              Hover Azul → Amarillo
            </button>
            <button className="px-6 py-3 bg-engage-yellow text-engage-black rounded-lg hover:bg-engage-blue transition-colors">
              Hover Amarillo → Azul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PruebaTailwind;