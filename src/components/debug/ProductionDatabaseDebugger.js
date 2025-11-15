/**
 * Production Database Debug Component
 * This component helps debug database issues in production
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ProductionDatabaseDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    connection: null,
    companies: null,
    employees: null,
    environment: {},
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugProductionDatabase();
  }, []);

  const debugProductionDatabase = async () => {
    const debug = {
      connection: null,
      companies: null,
      employees: null,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'EXISTS' : 'MISSING',
        REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
        // Don't log the actual key for security
        supabaseConfig: {
          url: supabase.supabaseUrl,
          hasAnonKey: !!supabase.supabaseKey
        }
      },
      errors: []
    };

    try {
      console.log('🔍 Starting Production Database Debug...');
      
      // Test connection
      console.log('📡 Testing connection...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      debug.connection = {
        success: !authError,
        error: authError?.message,
        hasSession: !!authData?.session
      };
      
      if (authError) {
        debug.errors.push(`Connection error: ${authError.message}`);
      }

      // Test companies query
      console.log('📊 Testing companies query...');
      const { data: companies, error: companiesError, count } = await supabase
        .from('companies')
        .select('id, name, status', { count: 'exact' })
        .eq('status', 'active')
        .order('name', { ascending: true });

      debug.companies = {
        success: !companiesError,
        error: companiesError?.message,
        count: count || companies?.length || 0,
        data: companies || []
      };

      if (companiesError) {
        debug.errors.push(`Companies query error: ${companiesError.message}`);
      }

      // Test employees query
      console.log('👥 Testing employees query...');
      const { data: employees, error: employeesError, count: employeesCount } = await supabase
        .from('employees')
        .select('id, first_name, last_name, company_id', { count: 'exact' })
        .limit(5); // Just get a few for testing

      debug.employees = {
        success: !employeesError,
        error: employeesError?.message,
        count: employeesCount || 0,
        sample: employees || []
      };

      if (employeesError) {
        debug.errors.push(`Employees query error: ${employeesError.message}`);
      }

      // Log all debug info to console
      console.log('🔍 Production Database Debug Results:', debug);
      
      setDebugInfo(debug);
    } catch (error) {
      console.error('❌ Critical debug error:', error);
      debug.errors.push(`Critical error: ${error.message}`);
      setDebugInfo(debug);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>Debugging production database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Production Database Debug</h3>
        <button 
          onClick={() => setDebugInfo(prev => ({ ...prev, show: !prev.show }))}
          className="text-gray-500 hover:text-gray-700"
        >
          {debugInfo.show ? '−' : '+'}
        </button>
      </div>
      
      {debugInfo.show && (
        <div className="space-y-3 text-sm">
          {/* Connection Status */}
          <div className="border rounded p-2">
            <div className="font-medium mb-1">Connection</div>
            <div className={`text-xs ${debugInfo.connection?.success ? 'text-green-600' : 'text-red-600'}`}>
              {debugInfo.connection?.success ? '✅ Connected' : '❌ Failed'}
            </div>
            {debugInfo.connection?.error && (
              <div className="text-red-500 text-xs">{debugInfo.connection.error}</div>
            )}
          </div>

          {/* Companies Status */}
          <div className="border rounded p-2">
            <div className="font-medium mb-1">Companies</div>
            <div className={`text-xs ${debugInfo.companies?.success ? 'text-green-600' : 'text-red-600'}`}>
              {debugInfo.companies?.success ? 
                `✅ ${debugInfo.companies.count} companies found` : 
                `❌ Error: ${debugInfo.companies?.error}`
              }
            </div>
            {debugInfo.companies?.data?.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Sample: {debugInfo.companies.data.slice(0, 3).map(c => c.name).join(', ')}
                {debugInfo.companies.data.length > 3 && '...'}
              </div>
            )}
          </div>

          {/* Employees Status */}
          <div className="border rounded p-2">
            <div className="font-medium mb-1">Employees</div>
            <div className={`text-xs ${debugInfo.employees?.success ? 'text-green-600' : 'text-red-600'}`}>
              {debugInfo.employees?.success ? 
                `✅ ${debugInfo.employees.count} employees` : 
                `❌ Error: ${debugInfo.employees?.error}`
              }
            </div>
          </div>

          {/* Environment Info */}
          <div className="border rounded p-2">
            <div className="font-medium mb-1">Environment</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>NODE_ENV: {debugInfo.environment.NODE_ENV}</div>
              <div>Supabase URL: {debugInfo.environment.REACT_APP_SUPABASE_URL}</div>
              <div>Supabase Key: {debugInfo.environment.REACT_APP_SUPABASE_ANON_KEY}</div>
            </div>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="font-medium mb-1 text-red-700">Errors</div>
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-600">{error}</div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button 
              onClick={debugProductionDatabase}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Refresh
            </button>
            <button 
              onClick={() => {
                console.log('Full debug info:', debugInfo);
                alert('Debug info logged to console');
              }}
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDatabaseDebugger;