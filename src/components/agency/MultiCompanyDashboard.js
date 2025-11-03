import React, { useState, useEffect, useCallback } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  CreditCardIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import multiCompanyManagementService from '../../services/multiCompanyManagementService';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

/**
 * Dashboard Multi-Empresa para Agencias
 * 
 * Proporciona una vista completa para gestionar múltiples empresas/clientes
 * incluyendo estadísticas, límites de uso, facturación y configuración.
 */
const MultiCompanyDashboard = ({ agencyId }) => {
  // Estado principal
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modales y vistas
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // Estadísticas de la agencia
  const [agencyStats, setAgencyStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    suspendedCompanies: 0,
    totalRevenue: 0,
    totalMessages: 0,
    avgCostPerMessage: 0
  });

  // Cargar empresas de la agencia
  const loadCompanies = useCallback(async () => {
    if (!agencyId) return;
    
    try {
      setLoading(true);
      const options = {
        status: statusFilter === 'all' ? null : statusFilter,
        search: searchTerm || null
      };
      
      const companiesData = await multiCompanyManagementService.getAgencyCompanies(agencyId, options);
      setCompanies(companiesData);
      
      // Calcular estadísticas
      const stats = calculateAgencyStats(companiesData);
      setAgencyStats(stats);
      
    } catch (err) {
      console.error('Error cargando empresas:', err);
      setError('Error al cargar las empresas');
    } finally {
      setLoading(false);
    }
  }, [agencyId, statusFilter, searchTerm]);

  // Calcular estadísticas de la agencia
  const calculateAgencyStats = (companiesData) => {
    const stats = {
      totalCompanies: companiesData.length,
      activeCompanies: companiesData.filter(c => c.status === 'active').length,
      suspendedCompanies: companiesData.filter(c => c.status === 'suspended').length,
      totalRevenue: 0,
      totalMessages: 0,
      avgCostPerMessage: 0
    };

    let totalCost = 0;
    let totalMessages = 0;

    companiesData.forEach(company => {
      if (company.usage_stats) {
        totalCost += company.usage_stats.totalCost || 0;
        totalMessages += company.usage_stats.totalMessages || 0;
      }
    });

    stats.totalRevenue = totalCost;
    stats.totalMessages = totalMessages;
    stats.avgCostPerMessage = totalMessages > 0 ? totalCost / totalMessages : 0;

    return stats;
  };

  // Crear nueva empresa
  const handleCreateCompany = async (companyData) => {
    try {
      const result = await multiCompanyManagementService.createCompany(companyData, agencyId);
      
      if (result.success) {
        setShowCreateModal(false);
        loadCompanies();
        // Mostrar notificación de éxito
        showNotification('Empresa creada exitosamente', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      console.error('Error creando empresa:', err);
      showNotification('Error al crear la empresa', 'error');
    }
  };

  // Editar empresa
  const handleEditCompany = async (companyId, updateData) => {
    try {
      const result = await multiCompanyManagementService.updateCompany(companyId, updateData, agencyId);
      
      if (result.success) {
        setShowEditModal(false);
        loadCompanies();
        showNotification('Empresa actualizada exitosamente', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      console.error('Error editando empresa:', err);
      showNotification('Error al actualizar la empresa', 'error');
    }
  };

  // Suspender/Reactivar empresa
  const handleToggleCompanyStatus = async (company) => {
    const newStatus = company.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspender' : 'reactivar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${action} ${company.name}?`)) {
      return;
    }

    try {
      const result = await multiCompanyManagementService.setCompanyStatus(company.id, newStatus, agencyId);
      
      if (result.success) {
        loadCompanies();
        showNotification(`Empresa ${action}da exitosamente`, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      console.error(`Error ${action} empresa:`, err);
      showNotification(`Error al ${action} la empresa`, 'error');
    }
  };

  // Generar factura
  const handleGenerateInvoice = async (companyId) => {
    try {
      const result = await multiCompanyManagementService.generateInvoice(companyId);
      
      if (result.success) {
        showNotification('Factura generada exitosamente', 'success');
        // Descargar PDF si está disponible
        if (result.invoicePdf) {
          window.open(result.invoicePdf, '_blank');
        }
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      console.error('Error generando factura:', err);
      showNotification('Error al generar la factura', 'error');
    }
  };

  // Mostrar notificación
  const showNotification = (message, type = 'info') => {
    // Implementar sistema de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Ordenar empresas
  const sortCompanies = (companies) => {
    return [...companies].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Manejar valores anidados
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }
      
      // Manejar valores nulos
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      // Ordenamiento
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Obtener estado de uso
  const getUsageStatus = (company) => {
    if (!company.usage_stats) return { status: 'unknown', color: 'gray', text: 'Sin datos' };
    
    const dailyUsage = company.usage_stats.daily_count || 0;
    const dailyLimit = company.daily_limit || 0;
    const monthlyUsage = company.usage_stats.monthly_count || 0;
    const monthlyLimit = company.monthly_limit || 0;
    
    const dailyPercentage = dailyLimit > 0 ? (dailyUsage / dailyLimit) * 100 : 0;
    const monthlyPercentage = monthlyLimit > 0 ? (monthlyUsage / monthlyLimit) * 100 : 0;
    
    const maxPercentage = Math.max(dailyPercentage, monthlyPercentage);
    
    if (maxPercentage >= 90) {
      return { status: 'critical', color: 'red', text: 'Límite casi alcanzado' };
    } else if (maxPercentage >= 75) {
      return { status: 'warning', color: 'yellow', text: 'Acercándose al límite' };
    } else if (maxPercentage >= 50) {
      return { status: 'moderate', color: 'blue', text: 'Uso moderado' };
    } else {
      return { status: 'good', color: 'green', text: 'Uso normal' };
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Activa', icon: CheckCircleIcon },
      suspended: { color: 'red', text: 'Suspendida', icon: ExclamationTriangleIcon },
      trial: { color: 'blue', text: 'Prueba', icon: ClockIcon }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const sortedCompanies = sortCompanies(companies);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Multi-Empresa</h1>
          <p className="text-gray-600">Gestiona tus clientes y su configuración</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Empresa
        </button>
      </div>

      {/* Estadísticas de la Agencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{agencyStats.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{agencyStats.activeCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(agencyStats.totalMessages)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(agencyStats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="suspended">Suspendidas</option>
                <option value="trial">En prueba</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="usage_stats.totalMessages">Mensajes enviados</option>
                <option value="usage_stats.totalCost">Costo total</option>
                <option value="monthly_limit">Límite mensual</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensajes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCompanies.map((company) => {
                const usageStatus = getUsageStatus(company);
                const dailyPercentage = company.daily_limit > 0 
                  ? ((company.usage_stats?.daily_count || 0) / company.daily_limit) * 100 
                  : 0;
                const monthlyPercentage = company.monthly_limit > 0 
                  ? ((company.usage_stats?.monthly_count || 0) / company.monthly_limit) * 100 
                  : 0;

                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.rut}</div>
                        <div className="text-xs text-gray-400">{formatDate(company.created_at)}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(company.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">Diario:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-${usageStatus.color}-500`}
                              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-700 ml-2">
                            {company.usage_stats?.daily_count || 0}/{company.daily_limit}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">Mensual:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-${usageStatus.color}-500`}
                              style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-700 ml-2">
                            {company.usage_stats?.monthly_count || 0}/{company.monthly_limit}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(company.usage_stats?.totalMessages || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(company.usage_stats?.totalRecipients || 0)} destinatarios
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(company.usage_stats?.totalCost || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${company.message_cost || 0} por mensaje
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {company.email_enabled && <EnvelopeIcon className="h-4 w-4 text-green-500" title="Email" />}
                        {company.sms_enabled && <PhoneIcon className="h-4 w-4 text-blue-500" title="SMS" />}
                        {company.telegram_enabled && <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-400" title="Telegram" />}
                        {company.whatsapp_enabled && <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" title="WhatsApp" />}
                        {company.groq_enabled && <ChartBarIcon className="h-4 w-4 text-purple-500" title="Groq AI" />}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowDetailsModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowEditModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowBillingModal(true);
                          }}
                          className="text-green-400 hover:text-green-600"
                          title="Facturación"
                        >
                          <CreditCardIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleCompanyStatus(company)}
                          className={`${
                            company.status === 'active' ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'
                          }`}
                          title={company.status === 'active' ? 'Suspender' : 'Reactivar'}
                        >
                          {company.status === 'active' ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron empresas con los filtros seleccionados' 
                : 'Comienza creando tu primera empresa cliente'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Empresa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCompany}
        />
      )}

      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditCompany}
        />
      )}

      {showDetailsModal && selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showBillingModal && selectedCompany && (
        <BillingModal
          company={selectedCompany}
          onClose={() => setShowBillingModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}
    </div>
  );
};

// Componentes de modales (placeholders)
const CreateCompanyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    contact_email: '',
    contact_phone: '',
    monthlyLimit: 1000,
    dailyLimit: 50,
    messageCost: 0.0525,
    billingCycle: 'monthly',
    billingEmail: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Nueva Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">RUT</label>
            <input
              type="text"
              required
              value={formData.rut}
              onChange={(e) => setFormData({...formData, rut: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de contacto</label>
            <input
              type="email"
              required
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Límite mensual</label>
              <input
                type="number"
                required
                value={formData.monthlyLimit}
                onChange={(e) => setFormData({...formData, monthlyLimit: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Límite diario</label>
              <input
                type="number"
                required
                value={formData.dailyLimit}
                onChange={(e) => setFormData({...formData, dailyLimit: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Crear Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditCompanyModal = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: company.name,
    rut: company.rut,
    contact_email: company.contact_email,
    contact_phone: company.contact_phone,
    monthly_limit: company.monthly_limit,
    daily_limit: company.daily_limit,
    message_cost: company.message_cost,
    billing_cycle: company.billing_cycle,
    billing_email: company.billing_email
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(company.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editar Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de contacto</label>
            <input
              type="email"
              required
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Límite mensual</label>
              <input
                type="number"
                required
                value={formData.monthly_limit}
                onChange={(e) => setFormData({...formData, monthly_limit: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Límite diario</label>
              <input
                type="number"
                required
                value={formData.daily_limit}
                onChange={(e) => setFormData({...formData, daily_limit: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompanyDetailsModal = ({ company, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Detalles de {company.name}</h2>
        {/* Contenido del modal de detalles */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const BillingModal = ({ company, onClose, onGenerateInvoice }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Facturación - {company.name}</h2>
        {/* Contenido del modal de facturación */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => onGenerateInvoice(company.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generar Factura
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiCompanyDashboard;