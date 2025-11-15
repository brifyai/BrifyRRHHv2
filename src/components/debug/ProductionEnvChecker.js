/**
 * Production Environment Variable Checker
 * This component checks if environment variables are properly loaded in production
 */

import React, { useState, useEffect } from 'react';

const ProductionEnvChecker = () => {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: null,
    supabaseKey: null,
    environment: null,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    checkEnvironmentVariables();
  }, []);

  const checkEnvironmentVariables = () => {
    const status = {
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'MISSING',
      supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      environment: process.env.NODE_ENV || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      origin: window.location.origin
    };

    // Log detailed environment info
    console.log('🌍 Production Environment Check:', status);
    console.log('🔍 All process.env keys:', Object.keys(process.env || {}));
    console.log('🔍 All window.env keys:', Object.keys(window.env || {}));
    
    setEnvStatus(status);
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...');
      
      // Dynamic import to avoid issues if Supabase client fails
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test query
      const { data, error } = await supabase
        .from('companies')
        .select('id, name', { count: 'exact' })
        .limit(1);
        
      console.log('🧪 Supabase test result:', { data, error });
      
      return { success: !error, data, error };
    } catch (err) {
      console.error('❌ Supabase test failed:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-red-100 border border-red-300 rounded-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-red-800">Production Environment</h3>
        <button 
          onClick={checkEnvironmentVariables}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Environment:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            envStatus.environment === 'production' 
              ? 'bg-green-200 text-green-800' 
              : 'bg-yellow-200 text-yellow-800'
          }`}>
            {envStatus.environment}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Supabase URL:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            envStatus.supabaseUrl !== 'MISSING' 
              ? 'bg-green-200 text-green-800' 
              : 'bg-red-200 text-red-800'
          }`}>
            {envStatus.supabaseUrl === 'MISSING' ? 'MISSING' : 'OK'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Supabase Key:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            envStatus.supabaseKey === 'PRESENT' 
              ? 'bg-green-200 text-green-800' 
              : 'bg-red-200 text-red-800'
          }`}>
            {envStatus.supabaseKey}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Domain:</span>
          <span className="text-xs text-gray-600">
            {envStatus.hostname}
          </span>
        </div>
        
        {envStatus.supabaseUrl === 'MISSING' && (
          <div className="mt-3 p-2 bg-red-200 rounded text-red-800 text-xs">
            ⚠️ Missing environment variables! Check Netlify deployment settings.
          </div>
        )}
        
        <div className="flex space-x-2 mt-3">
          <button 
            onClick={testSupabaseConnection}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionEnvChecker;