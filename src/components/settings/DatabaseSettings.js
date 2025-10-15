import React, { useState, useEffect } from 'react';
import { CircleStackIcon, CloudIcon, ServerIcon, ArrowPathIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import databaseAdapter from '../../lib/databaseAdapter.js';
import localDatabase from '../../lib/localDatabase.js';

const DatabaseSettings = () => {
  const [currentMode, setCurrentMode] = useState('supabase');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null);

  useEffect(() => {
    loadStats();
    setCurrentMode(databaseAdapter.mode);
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await databaseAdapter.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSwitchToLocal = () => {
    setSwitchTarget('local');
    setShowConfirmSwitch(true);
  };

  const handleSwitchToSupabase = () => {
    setSwitchTarget('supabase');
    setShowConfirmSwitch(true);
  };

  const confirmSwitch = () => {
    if (switchTarget === 'local') {
      databaseAdapter.switchToLocal();
    } else {
      databaseAdapter.switchToSupabase();
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const data = await databaseAdapter.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
    } finally {
      setLoading(false);
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setLoading(true);
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await databaseAdapter.importData(data);
          await loadStats();
          alert('Datos importados correctamente');
        } catch (error) {
          console.error('Error importando datos:', error);
          alert('Error al importar datos: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const clearLocalData = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos locales? Esta acción no se puede deshacer.')) {
      setLoading(true);
      try {
        await databaseAdapter.clearData();
        await loadStats();
        alert('Datos locales eliminados');
      } catch (error) {
        console.error('Error eliminando datos:', error);
        alert('Error al eliminar datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const initializeSampleData = async () => {
    if (!window.confirm('¿Quieres cargar datos de ejemplo en la base de datos local?')) return;

    setLoading(true);
    try {
      // Datos de ejemplo
      const sampleCompanies = [
        { id: '1', name: 'Ariztia', is_active: true, created_at: new Date().toISOString() },
        { id: '2', name: 'Inchcape', is_active: true, created_at: new Date().toISOString() },
        { id: '3', name: 'Achs', is_active: true, created_at: new Date().toISOString() },
        { id: '4', name: 'Arcoprime', is_active: true, created_at: new Date().toISOString() },
        { id: '5', name: 'Grupo Saesa', is_active: true, created_at: new Date().toISOString() }
      ];

      const sampleEmployees = [];
      sampleCompanies.forEach(company => {
        for (let i = 1; i <= 10; i++) {
          sampleEmployees.push({
            id: `${company.id}_${i}`,
            name: `Empleado ${i} de ${company.name}`,
            email: `empleado${i}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            company_id: company.id,
            position: 'Empleado',
            department: 'General',
            workMode: 'Presencial',
            contractType: 'Indefinido',
            level: 'Staff'
          });
        }
      });

      // Insertar datos
      for (const company of sampleCompanies) {
        await localDatabase.create('companies', company);
      }

      for (const employee of sampleEmployees) {
        await localDatabase.create('employees', employee);
      }

      await loadStats();
      alert('Datos de ejemplo cargados correctamente');
    } catch (error) {
      console.error('Error cargando datos de ejemplo:', error);
      alert('Error al cargar datos de ejemplo: ' + error.message);
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
            <h3 className="text-2xl font-bold text-gray-900">Estadísticas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-purple-600">Proveedor</p>
              <p className="text-xl font-bold text-purple-700">{stats.provider}</p>
            </div>

            {stats.stores.map((store, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-600">{store.name}</p>
                <p className="text-xl font-bold text-blue-700">{store.count}</p>
              </div>
            ))}
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
              onClick={importData}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-3" />
              {loading ? 'Importando...' : 'Importar Datos'}
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={initializeSampleData}
              disabled={loading || currentMode === 'supabase'}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CircleStackIcon className="h-5 w-5 mr-3" />
              {loading ? 'Cargando...' : 'Cargar Datos de Ejemplo'}
            </button>

            <button
              onClick={clearLocalData}
              disabled={loading || currentMode === 'supabase'}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5 mr-3" />
              {loading ? 'Eliminando...' : 'Limpiar Datos Locales'}
            </button>
          </div>
        </div>

        {currentMode === 'supabase' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Las herramientas de importación, datos de ejemplo y limpieza solo están disponibles en modo base de datos local.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmSwitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Cambio</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres cambiar al modo {
                switchTarget === 'local' ? 'base de datos local' : 'Supabase'
              }? La página se recargará automáticamente.
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