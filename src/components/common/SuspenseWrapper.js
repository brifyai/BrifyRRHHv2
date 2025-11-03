import React, { Suspense } from 'react';
import EnhancedLoadingSpinner from './EnhancedLoadingSpinner.js';

const SuspenseWrapper = ({ 
  children, 
  fallback = null,
  message = "Cargando componente...",
  fullScreen = false 
}) => {
  // Si no se proporciona un fallback personalizado, usar el EnhancedLoadingSpinner
  const defaultFallback = fallback || (
    <EnhancedLoadingSpinner 
      message={message}
      size="large"
      fullScreen={fullScreen}
      showProgress={true}
    />
  );

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;