import React, { useState } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

/**
 * Componente atómico para panel de filtros y búsqueda
 * Extraído del componente EmployeeFolders monolítico
 */
const FilterPanel = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  companies,
  uniqueDepartments,
  uniqueLevels,
  uniqueWorkModes,
  uniqueContractTypes,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filterName, value) => {
    onFilterChange?.(filterName, value);
  };

  const handleSearchChange = (e) => {
    onSearchChange?.(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 relative overflow-hidden responsive-layout ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-4">
            <FunnelIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Filtros Avanzados</h2>
            <p className="text-sm text-gray-600">Encuentra rápidamente las carpetas que necesitas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <FunnelIcon className="h-5 w-5 mr-3" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            )}
          </button>

          <div className="search-container relative">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o departamento..."
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full transition-all duration-300 bg-gray-50 focus:bg-white"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-grid mt-4 pt-4 border-t border-gray-200">
          <FilterSelect
            label="Empresa"
            value={filters.companyId}
            onChange={(value) => handleFilterChange('companyId', value)}
            options={[
              { value: '', label: 'Todas las empresas' },
              ...companies.map(company => ({
                value: company.id,
                label: company.name
              }))
            ]}
          />
          
          <FilterSelect
            label="Departamento"
            value={filters.department}
            onChange={(value) => handleFilterChange('department', value)}
            options={[
              { value: '', label: 'Todos los departamentos' },
              ...uniqueDepartments.map(dept => ({
                value: dept,
                label: dept
              }))
            ]}
          />
          
          <FilterSelect
            label="Nivel"
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
            options={[
              { value: '', label: 'Todos los niveles' },
              ...uniqueLevels.map(level => ({
                value: level,
                label: level
              }))
            ]}
          />
          
          <FilterSelect
            label="Modalidad"
            value={filters.workMode}
            onChange={(value) => handleFilterChange('workMode', value)}
            options={[
              { value: '', label: 'Todas las modalidades' },
              ...uniqueWorkModes.map(mode => ({
                value: mode,
                label: mode
              }))
            ]}
          />
          
          <FilterSelect
            label="Tipo de Contrato"
            value={filters.contractType}
            onChange={(value) => handleFilterChange('contractType', value)}
            options={[
              { value: '', label: 'Todos los contratos' },
              ...uniqueContractTypes.map(type => ({
                value: type,
                label: type
              }))
            ]}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Componente atómico para select de filtros
 */
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="min-w-0">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engage-blue focus:border-engage-blue truncate"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(option => (
        <option key={option.value} value={option.value} className="truncate">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterPanel;