import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DebugRutas = () => {
  const location = useLocation();
  
  return (
    <div className="p-4 bg-engage-yellow text-engage-black">
      <h2 className="text-xl font-bold mb-4">Debug de Rutas</h2>
      <p>Ruta actual: {location.pathname}</p>
      <div className="mt-4">
        <Link to="/" className="btn-primary mr-2">Ir a Home</Link>
        <Link to="/login" className="btn-secondary mr-2">Ir a Login</Link>
        <Link to="/register" className="btn-yellow">Ir a Register</Link>
      </div>
    </div>
  );
};

export default DebugRutas;