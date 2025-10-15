import React from 'react';

const PruebaBasica = () => {
  return (
    <div className="min-h-screen bg-engage-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-engage-yellow">Prueba Básica de Colores</h1>
        
        <div className="space-y-6">
          <div className="p-6 bg-engage-blue rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Este es un contenedor azul</h2>
            <p>Color de fondo: #0693e3 (azul)</p>
            <p className="mt-2 text-engage-yellow">Texto con color amarillo: #fcb900</p>
          </div>
          
          <div className="p-6 bg-engage-yellow text-engage-black rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Este es un contenedor amarillo</h2>
            <p>Color de fondo: #fcb900 (amarillo)</p>
            <p className="mt-2 text-engage-blue">Texto con color azul: #0693e3</p>
          </div>
          
          <div className="flex space-x-4">
            <button className="btn-primary px-6 py-3">Botón Primario</button>
            <button className="btn-yellow px-6 py-3">Botón Amarillo</button>
            <button className="btn-black px-6 py-3">Botón Negro</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PruebaBasica;