import React from 'react';

const VerificarEstilos = () => {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-engage-black">Verificación de Estilos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prueba de colores de texto */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-engage-black">Colores de Texto</h2>
          <div className="space-y-2">
            <p className="text-engage-black">Texto negro (#000000)</p>
            <p className="text-engage-yellow">Texto amarillo (#fcb900)</p>
            <p className="text-engage-blue">Texto azul (#0693e3)</p>
          </div>
        </div>
        
        {/* Prueba de colores de fondo */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-engage-black">Colores de Fondo</h2>
          <div className="space-y-2">
            <div className="p-3 bg-engage-black text-white">Fondo negro</div>
            <div className="p-3 bg-engage-yellow text-engage-black">Fondo amarillo</div>
            <div className="p-3 bg-engage-blue text-white">Fondo azul</div>
          </div>
        </div>
        
        {/* Prueba de botones */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-engage-black">Botones Personalizados</h2>
          <div className="space-y-3">
            <button className="btn-primary w-full">Botón Primario</button>
            <button className="btn-secondary w-full">Botón Secundario</button>
            <button className="btn-yellow w-full">Botón Amarillo</button>
            <button className="btn-black w-full">Botón Negro</button>
          </div>
        </div>
      </div>
      
      {/* Prueba de gradientes */}
      <div className="mt-8 card p-6">
        <h2 className="text-xl font-semibold mb-4 text-engage-black">Gradientes Personalizados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 rounded-lg bg-gradient-to-r from-engage-black to-engage-blue"></div>
          <div className="h-32 rounded-lg bg-gradient-to-r from-engage-blue to-engage-yellow"></div>
        </div>
      </div>
    </div>
  );
};

export default VerificarEstilos;