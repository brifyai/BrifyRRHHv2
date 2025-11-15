import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const SimpleDashboardFix = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeesCount, setEmployeesCount] = useState(0);

  // Load data with timeout and error handling
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading simple data...');
        
        // Load companies with timeout
        const companiesPromise = supabase
          .from('companies')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name', { ascending: true });

        // Load employees count with timeout  
        const employeesPromise = supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });

        // Race against timeout
        const companiesResult = await Promise.race([
          companiesPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Companies timeout')), 10000)
          )
        ]);

        const employeesResult = await Promise.race([
          employeesPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Employees timeout')), 10000)
          )
        ]);

        if (!isMounted) return;

        if (companiesResult.error) {
          throw new Error(`Companies error: ${companiesResult.error.message}`);
        }

        if (employeesResult.error) {
          console.warn('Employees count error:', employeesResult.error.message);
        }

        setCompanies(companiesResult.data || []);
        setEmployeesCount(employeesResult.count || 0);
        setError(null);
        
        console.log('✅ Simple data loaded:', {
          companies: companiesResult.data?.length || 0,
          employees: employeesResult.count || 0
        });

      } catch (err) {
        console.error('❌ Simple data load error:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 font-bold mb-4">Error de Carga</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🏢 Dashboard Simplificado - Base de Datos
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Empresas</h3>
              <p className="text-2xl font-bold text-blue-600">{companies.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Empleados</h3>
              <p className="text-2xl font-bold text-green-600">{employeesCount}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Estado</h3>
              <p className="text-sm text-purple-600">✅ Funcionando</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">📋 Lista de Empresas</h2>
            {companies.length > 0 ? (
              <div className="space-y-2">
                {companies.map((company, index) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{index + 1}. {company.name}</span>
                    <span className="text-sm text-gray-500">ID: {company.id.substring(0, 8)}...</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay empresas disponibles</p>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎉 ¡Éxito!</h3>
            <p className="text-green-700">
              El dashboard simplificado está funcionando correctamente. 
              Se cargaron {companies.length} empresas y {employeesCount} empleados.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-4"
          >
            Volver al Inicio
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Recargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboardFix;