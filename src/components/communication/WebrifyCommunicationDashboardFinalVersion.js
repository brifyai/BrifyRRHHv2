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

  const companyMetrics = calculateCompanyMetrics();

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
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <PaperAirplaneIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Canales Activos</p>
                    <p className="text-2xl font-bold text-engage-black">2</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Company Metrics */}
            <div>
              <h2 className="text-xl font-bold text-engage-black mb-6">Métricas por Empresa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyMetrics.map((metric) => (
                  <div key={metric.company} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-engage-black">{metric.company}</h3>
                      <div className={`p-1 rounded-full ${metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {metric.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Empleados</span>
                        <span className="text-sm font-medium text-engage-black">{metric.totalEmployees}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Mensajes Enviados</span>
                        <span className="text-sm font-medium text-engage-black">{metric.messagesSent}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tasa de Entrega</span>
                        <span className="text-sm font-medium text-engage-black">{metric.deliveryRate}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tasa de Lectura</span>
                        <span className="text-sm font-medium text-engage-black">{metric.readRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-engage-black mb-4">Distribución por Canal</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">WhatsApp</span>
                      <span className="text-sm font-medium text-engage-black">{stats.whatsappMessages} mensajes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.whatsappMessages > 0 ? (stats.whatsappMessages / stats.totalMessages) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Telegram</span>
                      <span className="text-sm font-medium text-engage-black">{stats.telegramMessages} mensajes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${stats.telegramMessages > 0 ? (stats.telegramMessages / stats.totalMessages) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-engage-black mb-4">Distribución por Modalidad</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Presencial</span>
                      <span className="text-sm font-medium text-engage-black">
                        {employees.filter(emp => emp.workMode === 'Presencial').length} empleados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-engage-blue h-2 rounded-full" 
                        style={{ 
                          width: `${employees.length > 0 ? (employees.filter(emp => emp.workMode === 'Presencial').length / employees.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Híbrido</span>
                      <span className="text-sm font-medium text-engage-black">
                        {employees.filter(emp => emp.workMode === 'Híbrido').length} empleados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-engage-yellow h-2 rounded-full" 
                        style={{ 
                          width: `${employees.length > 0 ? (employees.filter(emp => emp.workMode === 'Híbrido').length / employees.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Remoto</span>
                      <span className="text-sm font-medium text-engage-black">
                        {employees.filter(emp => emp.workMode === 'Remoto').length} empleados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${employees.length > 0 ? (employees.filter(emp => emp.workMode === 'Remoto').length / employees.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'database' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-engage-black flex items-center">
                    <FunnelIcon className="h-5 w-5 mr-2 text-engage-blue" />
                    Filtros
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-engage-blue hover:text-engage-yellow"
                  >
                    Limpiar
                  </button>
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
                      {getSortedValues('company').map(company => (
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
                      {getSortedRegions().map(region => (
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
                  
                  <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-engage-black flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-2 text-green-500" />
                        Departamento
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        {filters.department.length > 0 ? `${filters.department.length} seleccionados` : 'Todos'}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {getSortedValues('department').map(department => (
                        <div key={department} className="flex items-center group">
                          <input
                            type="checkbox"
                            id={`department-${department}`}
                            checked={filters.department.includes(department)}
                            onChange={() => handleFilterChange('department', department)}
                            className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500 focus:ring-offset-0"
                          />
                          <label htmlFor={`department-${department}`} className="ml-2 text-sm text-engage-black group-hover:text-green-500 cursor-pointer">
                            {department}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-engage-black flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-purple-500" />
                        Nivel Jerárquico
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                        {filters.level.length > 0 ? `${filters.level.length} seleccionados` : 'Todos'}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {getSortedValues('level').map(level => (
                        <div key={level} className="flex items-center group">
                          <input
                            type="checkbox"
                            id={`level-${level}`}
                            checked={filters.level.includes(level)}
                            onChange={() => handleFilterChange('level', level)}
                            className="h-4 w-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500 focus:ring-offset-0"
                          />
                          <label htmlFor={`level-${level}`} className="ml-2 text-sm text-engage-black group-hover:text-purple-500 cursor-pointer">
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
                      {getSortedValues('workMode').map(workMode => (
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
                  
                  <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-engage-black flex items-center">
                        <IdentificationIcon className="h-4 w-4 mr-2 text-red-500" />
                        Tipo de Contrato
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                        {filters.contractType.length > 0 ? `${filters.contractType.length} seleccionados` : 'Todos'}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {getSortedValues('contractType').map(contractType => (
                        <div key={contractType} className="flex items-center group">
                          <input
                            type="checkbox"
                            id={`contractType-${contractType}`}
                            checked={filters.contractType.includes(contractType)}
                            onChange={() => handleFilterChange('contractType', contractType)}
                            className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-offset-0"
                          />
                          <label htmlFor={`contractType-${contractType}`} className="ml-2 text-sm text-engage-black group-hover:text-red-500 cursor-pointer">
                            {contractType}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-engage-black flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-2 text-blue-500" />
                        Posición
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                        {filters.position.length > 0 ? `${filters.position.length} seleccionadas` : 'Todas'}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {getSortedPositions().map(position => (
                        <div key={position} className="flex items-center group">
                          <input
                            type="checkbox"
                            id={`position-${position}`}
                            checked={filters.position.includes(position)}
                            onChange={() => handleFilterChange('position', position)}
                            className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <label htmlFor={`position-${position}`} className="ml-2 text-sm text-engage-black group-hover:text-blue-500 cursor-pointer">
                            {position}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Employee Table */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-engage-black">
                      Empleados ({filteredEmployees.length})
                    </h2>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={exportData}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Exportar
                      </button>
                      <button
                        onClick={importData}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-engage-blue"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                        Importar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={selectAllEmployees}
                            className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue focus:ring-offset-0"
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
                          Región
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modalidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr 
                          key={employee.id} 
                          className={`hover:bg-gray-50 ${selectedEmployees.includes(employee.id) ? 'bg-engage-blue/5' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => toggleEmployeeSelection(employee.id)}
                              className="h-4 w-4 text-engage-blue border-gray-300 rounded focus:ring-engage-blue focus:ring-offset-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-engage-blue/10 flex items-center justify-center">
                                  <span className="text-engage-blue font-medium">
                                    {employee.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.region}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-engage-blue/10 text-engage-blue">
                              {employee.workMode}
                            </span>
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
                      Intente ajustar los filtros para encontrar lo que está buscando.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-engage-black mb-6">Enviar Mensaje</h2>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="shadow-sm focus:ring-engage-blue focus:border-engage-blue block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                    placeholder="Escriba su mensaje aquí..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div>
                    {sendSuccess && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Mensaje enviado exitosamente
                      </div>
                    )}
                    {sendError && (
                      <div className="flex items-center text-sm text-red-600">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                        {sendError}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={sendTelegramMessage}
                      disabled={isSending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
