import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapPinIcon,
  UserGroupIcon,
  IdentificationIcon,
  BriefcaseIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';
import employeeData from './employeeData';
import enhancedCommunicationService from '../../services/enhancedCommunicationService';
import ReportsDashboard from './ReportsDashboard';

const WebrifyCommunicationDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('database');
  const [message, setMessage] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [filters, setFilters] = useState({
    region: [],
    department: [],
    level: [],
    workMode: [],
    contractType: [],
    company: [],
    position: []
  });
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });
  const [stats, setStats] = useState({
    totalMessages: 0,
    deliveryRate: 0,
    readRate: 0,
    whatsappMessages: 0,
    telegramMessages: 0
  });

  // Calcular métricas por empresa
  const calculateCompanyMetrics = () => {
    // Verificar que employees esté definido y no esté vacío
    if (!employees || employees.length === 0) {
      return [];
    }
    
    const companies = Array.from(new Set(employees.map(emp => emp.company)));
    return companies.map(company => {
      const companyEmployees = employees.filter(emp => emp.company === company);
      
      // Calcular estadísticas reales basadas en los datos
      const totalEmployees = companyEmployees.length;
      const presencialCount = companyEmployees.filter(emp => emp.workMode === 'Presencial').length;
      const hibridoCount = companyEmployees.filter(emp => emp.workMode === 'Híbrido').length;
      const remotoCount = companyEmployees.filter(emp => emp.workMode === 'Remoto').length;
      
      const indefinidoCount = companyEmployees.filter(emp => emp.contractType === 'Indefinido').length;
      const plazoFijoCount = companyEmployees.filter(emp => emp.contractType === 'Plazo Fijo').length;
      const honorariosCount = companyEmployees.filter(emp => emp.contractType === 'Honorarios').length;
      
      // Simular métricas para cada empresa
      const messagesSent = Math.floor(Math.random() * 100) + 50;
      const deliveryRate = Math.floor(Math.random() * 20) + 80;
      const readRate = Math.floor(Math.random() * 15) + 75;
      const whatsappMessages = Math.floor(Math.random() * 60) + 30;
      const telegramMessages = messagesSent - whatsappMessages;
      
      return {
        company,
        totalEmployees,
        presencialCount,
        hibridoCount,
        remotoCount,
        indefinidoCount,
        plazoFijoCount,
        honorariosCount,
        messagesSent,
        deliveryRate,
        readRate,
        whatsappMessages,
        telegramMessages,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    });
  };

  // Obtener color para cada empresa
  const getCompanyColor = (company) => {
    const colors = {
      'Ariztia': 'from-engage-yellow to-yellow-500',
      'Inchcape': 'from-green-500 to-green-700',
      'Achs': 'from-purple-500 to-purple-700',
      'Arcoprime': 'from-pink-500 to-pink-700',
      'Grupo Saesa': 'from-red-500 to-red-700',
      'Colbun': 'from-orange-500 to-orange-700',
      'AFP Habitat': 'from-teal-500 to-teal-700',
      'Copec': 'from-blue-500 to-blue-700',
      'Antofagasta Minerals': 'from-amber-500 to-amber-700',
      'Vida Cámara': 'from-emerald-500 to-emerald-700',
      'Enaex': 'from-rose-500 to-rose-700',
      'SQM': 'from-cyan-500 to-cyan-700',
      'CMPC': 'from-lime-500 to-lime-700',
      'Corporación Chilena - Alemana': 'from-indigo-500 to-indigo-700',
      'Hogar Alemán': 'from-violet-500 to-violet-700',
      'Empresas SB': 'from-fuchsia-500 to-fuchsia-700'
    };
    return colors[company] || 'from-gray-500 to-gray-700';
  };

  // Obtener valores únicos para los filtros
  const getUniqueValues = (field) => {
    if (!employees || employees.length === 0) return [];
    return Array.from(new Set(employees.map(emp => emp[field]))).filter(Boolean);
  };

  // Obtener todas las posiciones únicas
  const getAllPositions = () => {
    const positions = employees.map(emp => emp.position);
    return Array.from(new Set(positions));
  };

  // Orden alfabético para empresas, departamentos, niveles, posiciones, modalidades y tipos de contrato
  const getSortedValues = (field) => {
    return getUniqueValues(field).sort((a, b) => a.localeCompare(b));
  };

  // Orden alfabético para posiciones
  const getSortedPositions = () => {
    return getAllPositions().sort((a, b) => a.localeCompare(b));
  };

  // Orden de regiones de norte a sur según el mapa de Chile
  const getSortedRegions = () => {
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
    
    const regions = getUniqueValues('region');
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

  // Simulate employee data loading with multiple companies
  useEffect(() => {
    const simulateEmployeeData = async () => {
      try {
        // Use the imported employee data
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
        
        // Load templates
        const loadedTemplates = await enhancedCommunicationService.getMessageTemplates();
        setTemplates(loadedTemplates);
        
        // Load stats
        const loadedStats = await enhancedCommunicationService.getCommunicationStats();
        setStats(loadedStats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    simulateEmployeeData();
  }, []);

  // Apply filters
  useEffect(() => {
    if (employees.length === 0) return;
    
    let result = [...employees];
    
    // Aplicar filtros de selección múltiple
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
      result = result.filter(emp => filters.workMode.includes(emp.workMode));
    }
    
    if (filters.contractType.length > 0) {
      result = result.filter(emp => filters.contractType.includes(emp.contractType));
    }
    
    if (filters.company.length > 0) {
      result = result.filter(emp => filters.company.includes(emp.company));
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
      region: [],
      department: [],
      level: [],
      workMode: [],
      contractType: [],
      company: [],
      position: []
    });
  };

  const toggleEmployeeSelection = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = async () => {
    if (!message.trim()) {
      setSendError('Por favor ingresa un mensaje');
      return;
    }

    if (selectedEmployees.length === 0) {
      setSendError('Por favor selecciona al menos un empleado');
      return;
    }

    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    try {
      // Send message via enhanced service
      const result = await enhancedCommunicationService.sendWhatsAppMessage(selectedEmployees, message);
      
      console.log('Sending WhatsApp message to:', selectedEmployees);
      console.log('Message:', message);
      
      setSendSuccess(true);
      setMessage('');
      
      // Update stats
      const updatedStats = await enhancedCommunicationService.getCommunicationStats();
      setStats(updatedStats);
    } catch (error) {
      setSendError('Error al enviar el mensaje. Por favor intenta nuevamente.');
      console.error('WhatsApp send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Send Telegram message
  const sendTelegramMessage = async () => {
    if (!message.trim()) {
      setSendError('Por favor ingresa un mensaje');
      return;
    }

    if (selectedEmployees.length === 0) {
      setSendError('Por favor selecciona al menos un empleado');
      return;
    }

    setIsSending(true);
    setSendError('');
    setSendSuccess(false);

    try {
      // Send message via enhanced service
      const result = await enhancedCommunicationService.sendTelegramMessage(selectedEmployees, message);
      
      console.log('Sending Telegram message to:', selectedEmployees);
      console.log('Message:', message);
      
      setSendSuccess(true);
      setMessage('');
      
      // Update stats
      const updatedStats = await enhancedCommunicationService.getCommunicationStats();
      setStats(updatedStats);
    } catch (error) {
      setSendError('Error al enviar el mensaje. Por favor intenta nuevamente.');
      console.error('Telegram send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const addTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      return;
    }
    
    try {
      const template = await enhancedCommunicationService.createMessageTemplate(newTemplate);
      setTemplates([...templates, template]);
      setNewTemplate({ name: '', content: '' });
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const updateTemplate = async (templateId, updatedTemplate) => {
    try {
      const template = await enhancedCommunicationService.updateMessageTemplate(templateId, updatedTemplate);
      setTemplates(templates.map(t => t.id === templateId ? template : t));
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      await enhancedCommunicationService.deleteMessageTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const exportData = () => {
    // Simulate data export
    console.log('Exporting employee data...');
  };

  const importData = () => {
    // Simulate data import
    console.log('Importing employee data...');
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'database', name: 'Base de Datos', icon: UsersIcon },
    { id: 'send', name: 'Enviar Mensajes', icon: ChatBubbleLeftRightIcon },
    { id: 'templates', name: 'Plantillas', icon: DocumentTextIcon },
    { id: 'reports', name: 'Informes', icon: ChartBarIcon }
  ];

  const companyMetrics = calculateCompanyMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-engage-blue animate-spin mx-auto" />
          <p className="mt-4 text-engage-black font-medium">Cargando sistema de comunicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-engage-black">Comunicación Interna</h1>
              <p className="text-gray-600 mt-2">
                Sistema avanzado de comunicación para múltiples empresas
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="bg-engage-blue/10 px-3 py-1 rounded-full">
                <span className="text-engage-blue text-sm font-medium">
                  {selectedEmployees.length} seleccionados
                </span>
              </div>
              <button
                onClick={selectAllEmployees}
                className="text-sm text-engage-blue hover:text-engage-yellow font-medium"
              >
                {selectedEmployees.length === filteredEmployees.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-engage-blue text-engage-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-engage-blue/10 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-engage-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Mensajes Totales</p>
                    <p className="text-2xl font-bold text-engage-black">{stats.totalMessages}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tasa de Entrega</p>
                    <p className="text-2xl font-bold text-engage-black">{stats.deliveryRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-engage-yellow/10 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-engage-yellow" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tasa de Lectura</p>
                    <p className="text-2xl font-bold text-engage-black">{stats.readRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Canales Activos</p>
                    <p className="text-2xl font-bold text-engage-black">2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-engage-black">Métricas por Empresa</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                  <span>En tendencia</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {companyMetrics.map((metric) => (
                  <div key={metric.company} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-engage-black">{metric.company}</h3>
                      {metric.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Empleados</span>
                        <span className="font-medium">{metric.totalEmployees}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mensajes</span>
                        <span className="font-medium">{metric.messagesSent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Entrega</span>
                        <span className="font-medium">{metric.deliveryRate}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">WhatsApp</span>
                        <span className="text-gray-500">Telegram</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(metric.whatsappMessages / metric.messagesSent) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Mode Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-engage-black mb-4">Distribución por Modalidad de Trabajo</h3>
                <div className="space-y-4">
                  {['Presencial', 'Híbrido', 'Remoto'].map(mode => {
                    const count = employees.filter(emp => emp.workMode === mode).length;
                    const percentage = employees.length > 0 ? (count / employees.length) * 100 : 0;
                    
                    return (
                      <div key={mode} className="flex items-center justify-between">
                        <span className="text-engage-black font-medium">{mode}</span>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-engage-black mr-3">{count}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-engage-blue h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-engage-black mb-4">Distribución por Tipo de Contrato</h3>
                <div className="space-y-4">
                  {['Indefinido', 'Plazo Fijo', 'Honorarios'].map(type => {
                    const count = employees.filter(emp => emp.contractType === type).length;
                    const percentage = employees.length > 0 ? (count / employees.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-engage-black font-medium">{type}</span>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-engage-black mr-3">{count}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-engage-yellow h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-engage-black">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-engage-blue hover:text-engage-yellow font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {getSortedValues('company').map(company => (
                      <div key={company} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`company-${company}`}
                          checked={filters.company.includes(company)}
                          onChange={() => handleFilterChange('company', company)}
                          className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                        />
                        <label htmlFor={`company-${company}`} className="ml-2 text-sm text-gray-700">
                          {company}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {getSortedRegions().map(region => (
                      <div key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`region-${region}`}
                          checked={filters.region.includes(region)}
                          onChange={() => handleFilterChange('region', region)}
                          className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                        />
                        <label htmlFor={`region-${region}`} className="ml-2 text-sm text-gray-700">
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {getSortedValues('department').map(department => (
                      <div key={department} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`department-${department}`}
                          checked={filters.department.includes(department)}
                          onChange={() => handleFilterChange('department', department)}
                          className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                        />
                        <label htmlFor={`department-${department}`} className="ml-2 text-sm text-gray-700">
                          {department}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Work Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {['Presencial', 'Híbrido', 'Remoto'].map(mode => (
                      <div key={mode} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`workMode-${mode}`}
                          checked={filters.workMode.includes(mode)}
                          onChange={() => handleFilterChange('workMode', mode)}
                          className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                        />
                        <label htmlFor={`workMode-${mode}`} className="ml-2 text-sm text-gray-700">
                          {mode}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-engage-black">
                  Base de Datos de Empleados ({filteredEmployees.length})
                </h2>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue">
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Exportar
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue">
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Importar
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                          onChange={selectAllEmployees}
                          className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posición
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modalidad
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-engage-blue/10 rounded-full flex items-center justify-center">
                              <span className="text-engage-blue font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-engage-black">{employee.name}</div>
                              <div className="text-sm text-gray-500">ID: {employee.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-engage-black">{employee.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-engage-black">{employee.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-engage-black">{employee.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {employee.workMode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{employee.email}</div>
                          <div>{employee.phone}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron empleados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Intenta ajustar los filtros para ver resultados.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-engage-black mb-4">Enviar Mensajes</h2>
              
              {sendSuccess && (
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Mensaje enviado exitosamente a {selectedEmployees.length} empleados
                      </p>
                    </div>
                    <div className="ml-auto pl-3">
                      <div className="-mx-1.5 -my-1.5">
                        <button
                          type="button"
                          onClick={() => setSendSuccess(false)}
                          className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                        >
                          <span className="sr-only">Dismiss</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
