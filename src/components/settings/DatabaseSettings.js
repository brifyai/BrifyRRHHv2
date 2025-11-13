import React, { useState, useEffect } from 'react';
import { CircleStackIcon, CloudIcon, ServerIcon, ArrowPathIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import organizedDatabaseService from '../../services/organizedDatabaseService.js';
import { supabase } from '../../lib/supabase.js';

const DatabaseSettings = () => {
  const [currentMode, setCurrentMode] = useState('supabase');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Usar el servicio organizado para obtener estadísticas reales
      const statsData = await organizedDatabaseService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSwitchToLocal = () => {
    // Siempre usar Supabase como modo principal
    alert('El sistema está configurado para usar Supabase como base de datos principal.');
  };

  const handleSwitchToSupabase = () => {
    setSwitchTarget('supabase');
    setShowConfirmSwitch(true);
  };

  const confirmSwitch = () => {
    if (switchTarget === 'supabase') {
      setCurrentMode('supabase');
      loadStats(); // Recargar estadísticas
    }
    setShowConfirmSwitch(false);
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // Exportar datos reales desde Supabase
      const [companies, employees, folders, documents, communicationLogs] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('folders').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('communication_logs').select('*')
      ]);

      const exportData = {
        companies: companies.data || [],
        employees: employees.data || [],
        folders: folders.data || [],
        documents: documents.data || [],
        communication_logs: communicationLogs.data || [],
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brify_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('Error al exportar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el caché del servicio?')) {
      setLoading(true);
      try {
        organizedDatabaseService.clearCache();
        await loadStats();
        alert('Caché limpiado correctamente');
      } catch (error) {
        console.error('Error limpiando caché:', error);
        alert('Error al limpiar caché: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const refreshStats = async () => {
    setLoading(true);
    try {
      organizedDatabaseService.clearCache();
      await loadStats();
      alert('Estadísticas actualizadas correctamente');
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      alert('Error al actualizar estadísticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Configuración de Base de Datos</h2>
        <p className="text-lg text-gray-600">
          Gestiona el almacenamiento de datos del sistema
        </p>
      </div>

      {/* Modo Actual */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <CircleStackIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h3 className="text-2xl font-bold text-gray-900">Modo Actual</h3>
        </div>

        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center">
            {currentMode === 'supabase' ? (
              <CloudIcon className="h-8 w-8 text-blue-600 mr-4" />
            ) : (
              <ServerIcon className="h-8 w-8 text-green-600 mr-4" />
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {currentMode === 'supabase' ? 'Supabase (Nube)' : 'Base de Datos Local'}
              </p>
              <p className="text-sm text-gray-600">
                {currentMode === 'supabase'
                  ? 'Datos almacenados en la nube con Supabase'
                  : 'Datos almacenados localmente en el navegador'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSwitchToSupabase}
              disabled={currentMode === 'supabase'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentMode === 'supabase'
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Usar Supabase
            </button>
            <button
              onClick={handleSwitchToLocal}
              disabled={currentMode === 'local'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentMode === 'local'
                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Usar Local
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <ArrowPathIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Estadísticas de Base de Datos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-600">Empresas</p>
              <p className="text-xl font-bold text-blue-700">{stats.companies}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-green-600">Empleados</p>
              <p className="text-xl font-bold text-green-700">{stats.employees}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-purple-600">Carpetas</p>
              <p className="text-xl font-bold text-purple-700">{stats.folders}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
              <p className="text-sm font-medium text-yellow-600">Documentos</p>
              <p className="text-xl font-bold text-yellow-700">{stats.documents}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
              <p className="text-sm font-medium text-red-600">Comunicaciones</p>
              <p className="text-xl font-bold text-red-700">{stats.communication_logs}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-600">Proveedor</p>
              <p className="text-xl font-bold text-gray-700">Supabase</p>
            </div>
          </div>
        </div>
      )}

      {/* Herramientas */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <ArrowDownTrayIcon className="h-8 w-8 text-green-600 mr-3" />
          <h3 className="text-2xl font-bold text-gray-900">Herramientas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <button
              onClick={exportData}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-3" />
              {loading ? 'Exportando...' : 'Exportar Datos'}
            </button>

            <button
              onClick={refreshStats}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-5 w-5 mr-3" />
              {loading ? 'Actualizando...' : 'Actualizar Estadísticas'}
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={clearCache}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CircleStackIcon className="h-5 w-5 mr-3" />
              {loading ? 'Limpiando...' : 'Limpiar Caché'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Información:</strong> El sistema utiliza Supabase como base de datos principal. Todas las operaciones se realizan en tiempo real con la base de datos en la nube.
          </p>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmSwitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Configuración</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres configurar el sistema para usar Supabase como base de datos principal?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmSwitch(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSettings;