import React from 'react';
import {
  DocumentIcon,
  UserIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

/**
 * Componente atómico para mostrar la tarjeta de un empleado
 * Extraído del componente EmployeeFolders monolítico
 */
const EmployeeCard = ({
  folder,
  isSelected,
  onSelect,
  onView,
  onDragOver,
  onDrop
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver?.(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(e, folder.email);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(folder.email);
  };

  const handleView = (e) => {
    e.stopPropagation();
    onView?.(folder.email);
  };

  return (
    <div
      className={`employee-card p-8 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
        isSelected ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-indigo-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={handleSelect}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-start">
        <div className="flex items-center h-6 mr-6">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-lg">
                  {(folder.employeeName || folder.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="employee-info">
                <h3 className="text-xl font-bold text-gray-900 truncate max-w-xs md:max-w-md">
                  {folder.employeeName || folder.email}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-xs md:max-w-md flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {folder.email}
                </p>
              </div>
            </div>

            <div className="employee-actions action-buttons">
              <button
                onClick={handleView}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <DocumentIcon className="h-5 w-5 mr-2" />
                Ver Carpeta
              </button>
            </div>
          </div>
          
          <EmployeeInfoGrid folder={folder} />
          <EmployeeBadges folder={folder} />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid de información del empleado
 */
const EmployeeInfoGrid = ({ folder }) => (
  <div className="mt-6 info-card-grid">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Empresa</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{folder.companyName}</p>
    </div>

    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Departamento</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{folder.employeeDepartment || 'No especificado'}</p>
    </div>

    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Cargo</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{folder.employeePosition || 'No especificado'}</p>
    </div>

    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Teléfono</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{folder.employeePhone || 'No especificado'}</p>
    </div>
  </div>
);

/**
 * Badges de conocimiento del empleado
 */
const EmployeeBadges = ({ folder }) => (
  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="badge-container">
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        FAQs: {folder.knowledgeBase?.faqs?.length || 0}
      </div>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Documentos: {folder.knowledgeBase?.documents?.length || 0}
      </div>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Políticas: {folder.knowledgeBase?.policies?.length || 0}
      </div>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Procedimientos: {folder.knowledgeBase?.procedures?.length || 0}
      </div>
    </div>

    <div className="bg-gray-100 px-3 py-2 rounded-lg">
      <div className="flex items-center text-xs text-gray-600">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Última actualización: {new Date(folder.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  </div>
);

export default EmployeeCard;