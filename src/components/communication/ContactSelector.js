import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  IdentificationIcon, 
  BriefcaseIcon, 
  HomeModernIcon,
  DocumentTextIcon,
  FunnelIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import communicationService from '../../services/communicationService';
import employeeDataService from '../../services/employeeDataService';

const ContactSelector = ({ selectedEmployees, onEmployeeSelectionChange, onSendMessages }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filters, setFilters] = useState({
    company: [],
    region: [],
    department: [],
    level: [],
    workMode: [],
    contractType: [],
    position: []
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    regions: [],
    departments: [],
    levels: [],
    workModes: [],
    contractTypes: [],
    positions: []
  });

  // Obtener datos de empleados y opciones de filtro
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener empleados reales de la base de datos
        const employeesData = await communicationService.getEmployees();
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
        
        // Extraer valores únicos para los filtros
        const companies = [...new Set(employeesData.map(emp => emp.company?.name).filter(Boolean))];
        const regions = [...new Set(employeesData.map(emp => emp.region).filter(Boolean))];
        const departments = [...new Set(employeesData.map(emp => emp.department).filter(Boolean))];
        const levels = [...new Set(employeesData.map(emp => emp.level).filter(Boolean))];
        const workModes = [...new Set(employeesData.map(emp => emp.work_mode).filter(Boolean))];
        const contractTypes = [...new Set(employeesData.map(emp => emp.contract_type).filter(Boolean))];
        const positions = [...new Set(employeesData.map(emp => emp.position).filter(Boolean))];
        
        setFilterOptions({
          companies,
          regions,
          departments,
          levels,
          workModes,
          contractTypes,
          positions
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...employees];
    
    // Aplicar filtros de selección múltiple
    if (filters.company.length > 0) {
      result = result.filter(emp => {
        const companyName = emp.company?.name || emp.company;
        return filters.company.includes(companyName);
      });
    }
    
    if (filters.region.length > 0) {
      result = result.filter(emp => filters.region.includes(emp.region));
    }
    
    if (filters.department.length > 0) {
      result = result.filter(emp => filters.department.includes(emp.department));
    }
    
    if (filters.level.length > 0) {
      result = result.filter(emp => filters.level.includes(emp.level));
    }
    
    if (filters.workMode.length > 0) {
      result = result.filter(emp => filters.workMode.includes(emp.work_mode));
    }
    
    if (filters.contractType.length > 0) {
      result = result.filter(emp => filters.contractType.includes(emp.contract_type));
    }
    
    if (filters.position.length > 0) {
      result = result.filter(emp => filters.position.includes(emp.position));
    }
    
    setFilteredEmployees(result);
  }, [filters, employees]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName] || [];
      let newValues;
      
      if (currentValues.includes(value)) {
        // Si el valor ya está seleccionado, lo eliminamos
        newValues = currentValues.filter(item => item !== value);
      } else {
        // Si el valor no está seleccionado, lo agregamos
        newValues = [...currentValues, value];
      }
      
      return {
        ...prev,
        [filterName]: newValues
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      company: [],
      region: [],
      department: [],
      level: [],
      workMode: [],
      contractType: [],
      position: []
    });
  };

  const toggleEmployeeSelection = (employeeId) => {
    const newSelection = selectedEmployees.includes(employeeId)
      ? selectedEmployees.filter(id => id !== employeeId)
      : [...selectedEmployees, employeeId];
    
    onEmployeeSelectionChange(newSelection);
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      onEmployeeSelectionChange([]);
    } else {
      onEmployeeSelectionChange(filteredEmployees.map(emp => emp.id));
    }
  };

  // Sincronizar datos con el dashboard
  const syncWithDashboard = async () => {
    try {
      setSyncing(true);
      await employeeDataService.syncEmployeesWithDashboard();
      
      // Recargar los datos después de la sincronización
      const employeesData = await communicationService.getEmployees();
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      
      // Actualizar las opciones de filtro
      const companies = [...new Set(employeesData.map(emp => emp.company?.name || emp.company))];
      const regions = [...new Set(employeesData.map(emp => emp.region).filter(Boolean))];
      const departments = [...new Set(employeesData.map(emp => emp.department).filter(Boolean))];
      const levels = [...new Set(employeesData.map(emp => emp.level).filter(Boolean))];
      const workModes = [...new Set(employeesData.map(emp => emp.work_mode).filter(Boolean))];
      const contractTypes = [...new Set(employeesData.map(emp => emp.contract_type).filter(Boolean))];
      const positions = [...new Set(employeesData.map(emp => emp.position).filter(Boolean))];
      
      setFilterOptions({
        companies,
        regions,
        departments,
        levels,
        workModes,
        contractTypes,
        positions
      });
    } catch (error) {
      console.error('Error syncing with dashboard:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Orden alfabético para empresas, departamentos, niveles, posiciones, modalidades y tipos de contrato
  const getSortedValues = (values) => {
    return values.sort((a, b) => a.localeCompare(b));
  };

  // Orden de regiones de norte a sur según el mapa de Chile
  const getSortedRegions = (regions) => {
    const regionOrder = [
      'Región de Tarapacá',
      'Región de Antofagasta',
      'Región de Atacama',
      'Región de Coquimbo',
      'Región de Valparaíso',
      'Región del Libertador General Bernardo O\'Higgins',
      'Región del Maule',
      'Región de Ñuble',
      'Región del Biobío',
      'Región de La Araucanía',
      'Región de Los Ríos',
      'Región de Los Lagos',
      'Región Aysén del General Carlos Ibáñez del Campo',
      'Región de Magallanes y de la Antártica Chilena',
      'Región Metropolitana'
    ];
    
    return regions.sort((a, b) => {
      const indexA = regionOrder.indexOf(a);
      const indexB = regionOrder.indexOf(b);
      
      // Si ambas regiones están en la lista, ordenar por índice
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si solo una región está en la lista, esa va primero
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Si ninguna está en la lista, ordenar alfabéticamente
      return a.localeCompare(b);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-engage-blue mx-auto"></div>
          <p className="mt-4 text-engage-black font-medium">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-engage-black flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-engage-blue" />
              Filtros
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={syncWithDashboard}
                disabled={syncing}
                className={`text-sm ${syncing ? 'text-gray-400' : 'text-engage-blue hover:text-engage-yellow'}`}
              >
                {syncing ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  'Sincronizar'
                )}
              </button>
              <button
                onClick={clearFilters}
                className="text-sm text-engage-blue hover:text-engage-yellow"
              >
                Limpiar
              </button>
            </div>
          </div>
          
          <div className="space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            <div className="bg-engage-blue/5 rounded-lg p-4 border border-engage-blue/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2 text-engage-blue" />
                  Empresa
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-engage-blue/10 text-engage-blue">
                  {filters.company.length > 0 ? `${filters.company.length} seleccionadas` : 'Todas'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedValues(filterOptions.companies).map(company => (
                  <div key={company} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`company-${company}`}
                      checked={filters.company.includes(company)}
                      onChange={() => handleFilterChange('company', company)}
                      className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue focus:ring-offset-0"
                    />
                    <label htmlFor={`company-${company}`} className="ml-2 text-sm text-engage-black group-hover:text-engage-blue cursor-pointer">
                      {company}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-engage-yellow/5 rounded-lg p-4 border border-engage-yellow/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2 text-engage-yellow" />
                  Región
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-engage-yellow/10 text-engage-yellow">
                  {filters.region.length > 0 ? `${filters.region.length} seleccionadas` : 'Todas'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedRegions(filterOptions.regions).map(region => (
                  <div key={region} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`region-${region}`}
                      checked={filters.region.includes(region)}
                      onChange={() => handleFilterChange('region', region)}
                      className="h-4 w-4 text-engage-yellow border-gray-300 rounded focus:ring-engage-yellow focus:ring-offset-0"
                    />
                    <label htmlFor={`region-${region}`} className="ml-2 text-sm text-engage-black group-hover:text-engage-yellow cursor-pointer">
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Departamento
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  {filters.department.length > 0 ? `${filters.department.length} seleccionados` : 'Todos'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedValues(filterOptions.departments).map(department => (
                  <div key={department} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`department-${department}`}
                      checked={filters.department.includes(department)}
                      onChange={() => handleFilterChange('department', department)}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600 focus:ring-offset-0"
                    />
                    <label htmlFor={`department-${department}`} className="ml-2 text-sm text-engage-black group-hover:text-gray-600 cursor-pointer">
                      {department}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <IdentificationIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Nivel Jerárquico
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  {filters.level.length > 0 ? `${filters.level.length} seleccionados` : 'Todos'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedValues(filterOptions.levels).map(level => (
                  <div key={level} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`level-${level}`}
                      checked={filters.level.includes(level)}
                      onChange={() => handleFilterChange('level', level)}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600 focus:ring-offset-0"
                    />
                    <label htmlFor={`level-${level}`} className="ml-2 text-sm text-engage-black group-hover:text-gray-600 cursor-pointer">
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-engage-yellow/5 rounded-lg p-4 border border-engage-yellow/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <HomeModernIcon className="h-4 w-4 mr-2 text-engage-yellow" />
                  Modalidad de Trabajo
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-engage-yellow/10 text-engage-yellow">
                  {filters.workMode.length > 0 ? `${filters.workMode.length} seleccionadas` : 'Todas'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedValues(filterOptions.workModes).map(workMode => (
                  <div key={workMode} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`workMode-${workMode}`}
                      checked={filters.workMode.includes(workMode)}
                      onChange={() => handleFilterChange('workMode', workMode)}
                      className="h-4 w-4 text-engage-yellow border-gray-300 rounded focus:ring-engage-yellow focus:ring-offset-0"
                    />
                    <label htmlFor={`workMode-${workMode}`} className="ml-2 text-sm text-engage-black group-hover:text-engage-yellow cursor-pointer">
                      {workMode}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-engage-black flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Tipo de Contrato
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  {filters.contractType.length > 0 ? `${filters.contractType.length} seleccionados` : 'Todos'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {getSortedValues(filterOptions.contractTypes).map(contractType => (
                  <div key={contractType} className="flex items-center group">
                    <input
                      type="checkbox"
                      id={`contractType-${contractType}`}
                      checked={filters.contractType.includes(contractType)}
                      onChange={() => handleFilterChange('contractType', contractType)}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600 focus:ring-offset-0"
                    />
                    <label htmlFor={`contractType-${contractType}`} className="ml-2 text-sm text-engage-black group-hover:text-gray-600 cursor-pointer">
                      {contractType}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-engage-black">
                Resultados: {filteredEmployees.length}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-engage-blue/10 text-engage-blue">
                {selectedEmployees.length} seleccionados
              </span>
            </div>
            
            <button
              onClick={selectAllEmployees}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-engage-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue mb-3"
            >
              {selectedEmployees.length === filteredEmployees.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
            
            <button
              onClick={() => onSendMessages(selectedEmployees)}
              disabled={selectedEmployees.length === 0}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedEmployees.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-engage-blue hover:bg-engage-yellow focus:ring-engage-blue'
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Enviar Mensajes ({selectedEmployees.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Employee List */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="overflow-x-auto flex-grow" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel Jerárquico
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad de Trabajo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.company?.name || employee.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.level || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.work_mode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleEmployeeSelection(employee.id)}
                        className={`p-1 rounded-full ${
                          selectedEmployees.includes(employee.id) 
                            ? 'bg-engage-blue/10 text-engage-blue' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron empleados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Intente ajustar los filtros para encontrar empleados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSelector;