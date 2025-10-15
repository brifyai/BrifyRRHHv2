import React from 'react';

const PruebaColores = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Colores Personalizados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Texto */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Texto</h2>
          <p className="text-engage-black mb-2">Texto en negro (#000000)</p>
          <p className="text-engage-yellow mb-2">Texto en amarillo (#fcb900)</p>
          <p className="text-engage-blue mb-2">Texto en celeste (#0693e3)</p>
        </div>
        
        {/* Fondo */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Fondo</h2>
          <div className="mb-2 p-2 bg-engage-black text-white">Fondo negro</div>
          <div className="mb-2 p-2 bg-engage-yellow text-engage-black">Fondo amarillo</div>
          <div className="mb-2 p-2 bg-engage-blue text-white">Fondo celeste</div>
        </div>
        
        {/* Botones */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Botones</h2>
          <button className="btn-primary mb-2">Botón Primary</button>
          <button className="btn-secondary mb-2">Botón Secondary</button>
          <button className="btn-yellow mb-2">Botón Yellow</button>
          <button className="btn-black mb-2">Botón Black</button>
        </div>
      </div>
      
      <div className="mt-6 card p-4">
        <h2 className="text-lg font-semibold mb-3">Logo</h2>
        <div className="flex items-center">
          <div className="logo-container">
            <img 
              src="/images/Mesa-de-trabajo-105-1.png" 
              alt="Logo de prueba" 
              className="logo-image"
            />
          </div>
          <span className="ml-4 text-engage-black">Logo con fondo negro</span>
        </div>
      </div>
    </div>
  );
};

export default PruebaColores;