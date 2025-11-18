import React from 'react';
import './LoadingSpinner.css';

/**
 * Componente de loading spinner reutilizable
 * Usado en lazy loading y Suspense boundaries
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Cargando...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const containerClass = fullScreen 
    ? 'loading-spinner-fullscreen' 
    : 'loading-spinner-container';

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;