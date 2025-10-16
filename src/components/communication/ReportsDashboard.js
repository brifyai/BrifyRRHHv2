import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  ClockIcon,
  EyeIcon,
  HandThumbUpIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import enhancedCommunicationService from '../../services/enhancedCommunicationService';
import inMemoryEmployeeService from '../../services/inMemoryEmployeeService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// MultiSelect Component
const MultiSelect = ({ label, options, selectedValues, onChange, placeholder = "Seleccionar..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(item => item !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange(options.map(option => option.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedValues.length;
  const displayText = selectedCount === 0
    ? placeholder
    : selectedCount === 1
      ? options.find(opt => opt.value === selectedValues[0])?.label || selectedValues[0]
      : `${selectedCount} seleccionados`;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-left flex items-center justify-between"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200">
              <button
                onClick={handleSelectAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 mr-4"
              >
                Seleccionar todos
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Limpiar
              </button>
            </div>
            <div className="py-1">
              {options.map((option) => (
                <label key={option.value} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleToggle(option.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allRegions, setAllRegions] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  const [allWorkModes, setAllWorkModes] = useState([]);
  const [allContractTypes, setAllContractTypes] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [automatedReportSettings, setAutomatedReportSettings] = useState({
    frequency: 'weekly',
    recipients: [],
    includeCharts: true
  });
  const [filters, setFilters] = useState({
    channel: [],
    company: [],
    department: [],
    region: [],
    level: [],
    workMode: [],
    contractType: [],
    position: [],
    normalidad: [],
    sentimentRange: [],
    messageStatus: [],
    engagementLevel: []
  });

  // Estados para modales de reportes
  const [showCompanyReportModal, setShowCompanyReportModal] = useState(false);
  const [showUserReportModal, setShowUserReportModal] = useState(false);


  // Estados para filtros de reportes
  const [companyReportFilters, setCompanyReportFilters] = useState({
    dateFrom: '',
    dateTo: '',
    companies: [],
    channels: []
  });

  const [userReportFilters, setUserReportFilters] = useState({
    dateFrom: '',
    dateTo: '',
    companies: [],
    departments: [],
    regions: [],
    channels: []
  });

  useEffect(() => {
    loadReports();
    loadEmployees();
    loadAutomatedReportSettings();
  }, [dateFrom, dateTo, filters]);

  // Cargar configuraciones de reportes automáticos desde localStorage
  const loadAutomatedReportSettings = () => {
    try {
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.reports) {
          // Asegurar que recipients sea siempre un array
          const reportsSettings = {
            ...settings.reports,
            recipients: Array.isArray(settings.reports.recipients)
              ? settings.reports.recipients
              : settings.reports.recipients
                ? [settings.reports.recipients] // Convertir string a array
                : [] // Valor por defecto si no existe
          };
          setAutomatedReportSettings(reportsSettings);
          console.log('Configuraciones de reportes automáticos cargadas:', reportsSettings);
        }
      }
    } catch (error) {
      console.error('Error loading automated report settings:', error);
    }
  };

  // Guardar configuraciones de reportes automáticos
  const saveAutomatedReportSettings = async (settings) => {
    try {
      const currentSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      currentSettings.reports = settings;
      localStorage.setItem('notificationSettings', JSON.stringify(currentSettings));
      setAutomatedReportSettings(settings);
      console.log('Configuraciones de reportes automáticos guardadas:', settings);
    } catch (error) {
      console.error('Error saving automated report settings:', error);
    }
  };

  // Actualizar configuración específica
  const updateReportSetting = (key, value) => {
    const newSettings = { ...automatedReportSettings, [key]: value };
    setAutomatedReportSettings(newSettings);
  };

  // Aplicar configuraciones
  const applyReportSettings = () => {
    saveAutomatedReportSettings(automatedReportSettings);
    // Aquí podrías aplicar filtros automáticos basados en las configuraciones
    console.log('Aplicando configuraciones de reportes:', automatedReportSettings);
  };

  // Función para abrir modal de reporte por empresa
  const openCompanyReportModal = () => {
    setShowCompanyReportModal(true);
  };

  // Función para abrir modal de reporte por usuario
  const openUserReportModal = () => {
    setShowUserReportModal(true);
  };

  // Función para descargar reporte detallado por empresa con filtros
  const downloadCompanyReport = async () => {
    try {
      // Aplicar filtros del modal
      const filters = {};
      if (companyReportFilters.dateFrom) filters.dateFrom = companyReportFilters.dateFrom;
      if (companyReportFilters.dateTo) filters.dateTo = companyReportFilters.dateTo;
      if (companyReportFilters.companies.length > 0) filters.company = companyReportFilters.companies;
      if (companyReportFilters.channels.length > 0) filters.channel = companyReportFilters.channels;

      // Obtener logs de comunicación con filtros aplicados
      const allReports = await enhancedCommunicationService.getCommunicationReports(
        filters.dateFrom || null,
        filters.dateTo || null,
        filters
      );

      if (!allReports.recentActivity || allReports.recentActivity.length === 0) {
        toast.error('No hay datos para generar el reporte con los filtros seleccionados');
        return;
      }

      // Preparar datos para Excel
      const excelData = allReports.recentActivity.map(log => {
        const recipientCount = log.recipient_ids.length;
        const firstRecipient = employees.find(emp => emp.id === log.recipient_ids[0]);
        const companyName = firstRecipient?.company?.name || firstRecipient?.company || 'Sin empresa';

        return {
          'Fecha': new Date(log.timestamp).toLocaleDateString('es-ES'),
          'Hora': new Date(log.timestamp).toLocaleTimeString('es-ES'),
          'Empresa': companyName,
          'Canal': log.channel === 'whatsapp' ? 'WhatsApp' : 'Telegram',
          'Destinatarios': recipientCount,
          'Mensaje': log.message,
          'Estado': log.status || 'Enviado',
          'ID Mensaje': log.id,
          'Usuario Remitente': log.sender_name || 'Sistema',
          'Tipo de Mensaje': log.message_type || 'Texto',
          'Plantilla Usada': log.template_name || 'Sin plantilla',
          'Tokens Usados': log.tokens_used || 0,
          'Costo Estimado': log.estimated_cost || 0,
          'Tiempo de Respuesta': log.response_time || 'N/A',
          'Sentimiento': log.sentiment_score ? log.sentiment_score.toFixed(2) : 'N/A'
        };
      });

      // Filtrar por empresas seleccionadas si se especificaron
      let filteredData = excelData;
      if (companyReportFilters.companies.length > 0) {
        filteredData = excelData.filter(item => companyReportFilters.companies.includes(item.Empresa));
      }

      // Filtrar por canales seleccionados si se especificaron
      if (companyReportFilters.channels.length > 0) {
        const channelMap = { 'whatsapp': 'WhatsApp', 'telegram': 'Telegram' };
        const selectedChannels = companyReportFilters.channels.map(c => channelMap[c]);
        filteredData = filteredData.filter(item => selectedChannels.includes(item.Canal));
      }

      if (filteredData.length === 0) {
        toast.error('No hay datos que coincidan con los filtros seleccionados');
        return;
      }

      // Agrupar por empresa
      const groupedByCompany = filteredData.reduce((acc, item) => {
        if (!acc[item.Empresa]) {
          acc[item.Empresa] = [];
        }
        acc[item.Empresa].push(item);
        return acc;
      }, {});

      // Crear workbook con múltiples hojas
      const wb = XLSX.utils.book_new();

      // Hoja resumen
      const summaryData = Object.keys(groupedByCompany).map(company => ({
        'Empresa': company,
        'Total Mensajes': groupedByCompany[company].length,
        'Mensajes WhatsApp': groupedByCompany[company].filter(m => m.Canal === 'WhatsApp').length,
        'Mensajes Telegram': groupedByCompany[company].filter(m => m.Canal === 'Telegram').length,
        'Total Destinatarios': groupedByCompany[company].reduce((sum, m) => sum + m.Destinatarios, 0),
        'Fecha Primer Mensaje': groupedByCompany[company].sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha))[0]?.Fecha,
        'Fecha Último Mensaje': groupedByCompany[company].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))[0]?.Fecha
      }));

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen por Empresa');

      // Hoja detallada por empresa
      Object.keys(groupedByCompany).forEach(company => {
        const ws = XLSX.utils.json_to_sheet(groupedByCompany[company]);
        XLSX.utils.book_append_sheet(wb, ws, company.substring(0, 31)); // Excel limita nombres de hoja a 31 caracteres
      });

      // Cerrar modal
      setShowCompanyReportModal(false);

      // Descargar archivo
      const fileName = `reporte_comunicacion_por_empresa_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Reporte descargado exitosamente');

    } catch (error) {
      console.error('Error generando reporte por empresa:', error);
      toast.error('Error al generar el reporte');
    }
  };

  // Función para descargar reporte detallado por usuario con filtros
  const downloadUserReport = async () => {
    try {
      // Aplicar filtros del modal
      const filters = {};
      if (userReportFilters.dateFrom) filters.dateFrom = userReportFilters.dateFrom;
      if (userReportFilters.dateTo) filters.dateTo = userReportFilters.dateTo;
      if (userReportFilters.companies.length > 0) filters.company = userReportFilters.companies;
      if (userReportFilters.departments.length > 0) filters.department = userReportFilters.departments;
      if (userReportFilters.regions.length > 0) filters.region = userReportFilters.regions;
      if (userReportFilters.channels.length > 0) filters.channel = userReportFilters.channels;

      // Obtener logs de comunicación con filtros aplicados
      const allReports = await enhancedCommunicationService.getCommunicationReports(
        filters.dateFrom || null,
        filters.dateTo || null,
        filters
      );

      if (!allReports.recentActivity || allReports.recentActivity.length === 0) {
        toast.error('No hay datos para generar el reporte con los filtros seleccionados');
        return;
      }

      // Preparar datos para Excel
      const excelData = allReports.recentActivity.map(log => {
        const firstRecipient = employees.find(emp => emp.id === log.recipient_ids[0]);

        return {
          'Fecha': new Date(log.timestamp).toLocaleDateString('es-ES'),
          'Hora': new Date(log.timestamp).toLocaleTimeString('es-ES'),
          'Usuario Destinatario': firstRecipient?.name || 'Desconocido',
          'Email Destinatario': firstRecipient?.email || 'N/A',
          'Empresa': firstRecipient?.company?.name || firstRecipient?.company || 'Sin empresa',
          'Departamento': firstRecipient?.department || 'N/A',
          'Región': firstRecipient?.region || 'N/A',
          'Nivel': firstRecipient?.level || 'N/A',
          'Modalidad': firstRecipient?.work_mode || 'N/A',
          'Tipo Contrato': firstRecipient?.contract_type || 'N/A',
          'Posición': firstRecipient?.position || 'N/A',
          'Canal': log.channel === 'whatsapp' ? 'WhatsApp' : 'Telegram',
          'Mensaje': log.message,
          'Estado': log.status || 'Enviado',
          'ID Mensaje': log.id,
          'Usuario Remitente': log.sender_name || 'Sistema',
          'Tipo de Mensaje': log.message_type || 'Texto',
          'Plantilla Usada': log.template_name || 'Sin plantilla',
          'Tokens Usados': log.tokens_used || 0,
          'Costo Estimado': log.estimated_cost || 0,
          'Tiempo de Respuesta': log.response_time || 'N/A',
          'Sentimiento': log.sentiment_score ? log.sentiment_score.toFixed(2) : 'N/A',
          'Teléfono': firstRecipient?.phone || 'N/A'
        };
      });

      // Aplicar filtros adicionales
      let filteredData = excelData;

      // Filtrar por empresas seleccionadas
      if (userReportFilters.companies.length > 0) {
        filteredData = filteredData.filter(item => userReportFilters.companies.includes(item.Empresa));
      }

      // Filtrar por departamentos seleccionados
      if (userReportFilters.departments.length > 0) {
        filteredData = filteredData.filter(item => userReportFilters.departments.includes(item.Departamento));
      }

      // Filtrar por regiones seleccionadas
      if (userReportFilters.regions.length > 0) {
        filteredData = filteredData.filter(item => userReportFilters.regions.includes(item.Región));
      }

      // Filtrar por canales seleccionados
      if (userReportFilters.channels.length > 0) {
        const channelMap = { 'whatsapp': 'WhatsApp', 'telegram': 'Telegram' };
        const selectedChannels = userReportFilters.channels.map(c => channelMap[c]);
        filteredData = filteredData.filter(item => selectedChannels.includes(item.Canal));
      }

      if (filteredData.length === 0) {
        toast.error('No hay datos que coincidan con los filtros seleccionados');
        return;
      }

      // Agrupar por usuario
      const groupedByUser = filteredData.reduce((acc, item) => {
        const userKey = `${item['Usuario Destinatario']} (${item['Email Destinatario']})`;
        if (!acc[userKey]) {
          acc[userKey] = [];
        }
        acc[userKey].push(item);
        return acc;
      }, {});

      // Crear workbook con múltiples hojas
      const wb = XLSX.utils.book_new();

      // Hoja resumen por usuario
      const summaryData = Object.keys(groupedByUser).map(user => {
        const userMessages = groupedByUser[user];
        const firstMessage = userMessages[0];
        return {
          'Usuario': user,
          'Empresa': firstMessage.Empresa,
          'Departamento': firstMessage.Departamento,
          'Región': firstMessage.Región,
          'Total Mensajes': userMessages.length,
          'Mensajes WhatsApp': userMessages.filter(m => m.Canal === 'WhatsApp').length,
          'Mensajes Telegram': userMessages.filter(m => m.Canal === 'Telegram').length,
          'Fecha Primer Mensaje': userMessages.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha))[0]?.Fecha,
          'Fecha Último Mensaje': userMessages.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))[0]?.Fecha,
          'Sentimiento Promedio': userMessages.filter(m => m.Sentimiento !== 'N/A').length > 0
            ? (userMessages.filter(m => m.Sentimiento !== 'N/A').reduce((sum, m) => sum + parseFloat(m.Sentimiento), 0) / userMessages.filter(m => m.Sentimiento !== 'N/A').length).toFixed(2)
            : 'N/A'
        };
      });

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen por Usuario');

      // Hoja detallada completa
      const wsAll = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(wb, wsAll, 'Detalle Completo');

      // Cerrar modal
      setShowUserReportModal(false);

      // Descargar archivo
      const fileName = `reporte_comunicacion_por_usuario_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Reporte descargado exitosamente');

    } catch (error) {
      console.error('Error generando reporte por usuario:', error);
      toast.error('Error al generar el reporte');
    }
  };

  // Guardar datos de sentimiento en localStorage para sincronización con dashboard
  const saveSentimentDataToLocalStorage = (sentimentData) => {
    try {
      localStorage.setItem('reportsSentimentData', JSON.stringify(sentimentData));
      console.log('Datos de sentimiento guardados en localStorage para sincronización con dashboard');
    } catch (error) {
      console.error('Error guardando datos de sentimiento en localStorage:', error);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportData = await enhancedCommunicationService.getCommunicationReports(
        dateFrom || null,
        dateTo || null,
        filters
      );
      setReports(reportData);

      // Guardar datos de sentimiento en localStorage para sincronización con dashboard
      if (reportData.sentimentMetrics) {
        saveSentimentDataToLocalStorage(reportData.sentimentMetrics);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeeData = await inMemoryEmployeeService.getEmployees();
      setEmployees(employeeData);

      // Extract unique values for filters
      const companies = [...new Set(employeeData.map(emp => emp.company?.name || emp.company).filter(Boolean))];
      const departments = [...new Set(employeeData.map(emp => emp.department).filter(Boolean))];
      const regions = [...new Set(employeeData.map(emp => emp.region).filter(Boolean))];
      const levels = [...new Set(employeeData.map(emp => emp.level).filter(Boolean))];
      const workModes = [...new Set(employeeData.map(emp => emp.work_mode).filter(Boolean))];
      const contractTypes = [...new Set(employeeData.map(emp => emp.contract_type).filter(Boolean))];
      const positions = [...new Set(employeeData.map(emp => emp.position).filter(Boolean))];

      setAllCompanies(companies);
      setAllDepartments(departments);
      setAllRegions(regions);
      setAllLevels(levels);
      setAllWorkModes(workModes);
      setAllContractTypes(contractTypes);
      setAllPositions(positions);

      console.log('Filter options loaded:', {
        companies, departments, regions, levels, workModes, contractTypes, positions
      });
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  // Funciones para manejar cambios en filtros
  const handleCompanyFilterChange = (field, value) => {
    setCompanyReportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserFilterChange = (field, value) => {
    setUserReportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para limpiar filtros
  const clearCompanyFilters = () => {
    setCompanyReportFilters({
      dateFrom: '',
      dateTo: '',
      companies: [],
      channels: []
    });
  };

  const clearUserFilters = () => {
    setUserReportFilters({
      dateFrom: '',
      dateTo: '',
      companies: [],
      departments: [],
      regions: [],
      channels: []
    });
  };

  // Get company color

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-engage-blue animate-spin mx-auto" />
          <p className="mt-4 text-engage-black font-medium">Cargando informes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">
                  Informes de Comunicación
                </h1>
                <div className="h-1 w-20 bg-white/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-indigo-100 text-lg font-medium">
              Análisis detallado y métricas de la comunicación interna
            </p>
            <div className="flex items-center mt-4 text-sm text-indigo-200">
              <div className="flex items-center mr-6">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Datos en tiempo real
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Análisis inteligente
              </div>
            </div>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>

        {/* All Metrics Cards - 8 cajas individuales arriba */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
             <div className="relative z-10">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-indigo-100 text-sm font-medium mb-1">Mensajes Totales</p>
                   <p className="text-3xl font-bold">{reports.totalMessages || 0}</p>
                   <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                   <p className="text-xs text-indigo-200 mt-1">En período seleccionado</p>
                 </div>
                 <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                   <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                 </div>
               </div>
             </div>
           </div>

          <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Tasa de Entrega</p>
                  <p className="text-3xl font-bold">{reports.deliveryRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-green-200 mt-1">Mensajes entregados</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Tasa de Lectura</p>
                  <p className="text-3xl font-bold">{reports.readRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-blue-200 mt-1">Mensajes leídos</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-violet-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Tiempo Respuesta</p>
                  <p className="text-3xl font-bold">{reports.avgResponseTime || 0}min</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-purple-200 mt-1">Promedio general</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Tasa de Apertura</p>
                  <p className="text-3xl font-bold">{reports.engagementMetrics?.avgOpenRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-orange-200 mt-1">Mensajes abiertos</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-cyan-100 text-sm font-medium mb-1">Tasa de Clic</p>
                  <p className="text-3xl font-bold">{reports.engagementMetrics?.avgClickRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-cyan-200 mt-1">Interacciones</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <HandThumbUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Tasa de Respuesta</p>
                  <p className="text-3xl font-bold">{reports.engagementMetrics?.avgResponseRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-emerald-200 mt-1">Respuestas recibidas</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <ArrowPathIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-rose-100 text-sm font-medium mb-1">Tasa de Rebote</p>
                  <p className="text-3xl font-bold">{reports.bounceRate || 0}%</p>
                  <div className="w-10 h-1 bg-white/30 rounded-full mt-2"></div>
                  <p className="text-xs text-rose-200 mt-1">Mensajes fallidos</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de fechas y filtros avanzados */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Selector de fechas */}
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-4">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Período de Análisis</h3>
                  <p className="text-sm text-gray-600">Selecciona el rango de fechas para filtrar los informes</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium transition-all duration-300 hover:border-indigo-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium transition-all duration-300 hover:border-indigo-300"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                      setFilters({
                        channel: [],
                        company: [],
                        department: [],
                        region: [],
                        level: [],
                        workMode: [],
                        contractType: [],
                        position: [],
                        sentimentRange: [],
                        messageStatus: [],
                        engagementLevel: []
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-300"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de filtros avanzados */}
            <div className="lg:border-l lg:border-gray-200 lg:pl-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full lg:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtros Avanzados
                <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Panel de filtros avanzados */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <MultiSelect
                  label="Canal"
                  options={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'telegram', label: 'Telegram' }
                  ]}
                  selectedValues={filters.channel}
                  onChange={(values) => setFilters(prev => ({ ...prev, channel: values }))}
                />

                <MultiSelect
                  label="Empresa"
                  options={allCompanies.map(company => ({
                    value: company,
                    label: company
                  }))}
                  selectedValues={filters.company}
                  onChange={(values) => setFilters(prev => ({ ...prev, company: values }))}
                />

                <MultiSelect
                  label="Departamento"
                  options={allDepartments.map(dept => ({
                    value: dept,
                    label: dept
                  }))}
                  selectedValues={filters.department}
                  onChange={(values) => setFilters(prev => ({ ...prev, department: values }))}
                />

                <MultiSelect
                  label="Región"
                  options={allRegions.map(region => ({
                    value: region,
                    label: region
                  }))}
                  selectedValues={filters.region}
                  onChange={(values) => setFilters(prev => ({ ...prev, region: values }))}
                />

                <MultiSelect
                  label="Nivel"
                  options={allLevels.map(level => ({
                    value: level,
                    label: level
                  }))}
                  selectedValues={filters.level}
                  onChange={(values) => setFilters(prev => ({ ...prev, level: values }))}
                />

                <MultiSelect
                  label="Modalidad"
                  options={allWorkModes.map(workMode => ({
                    value: workMode,
                    label: workMode
                  }))}
                  selectedValues={filters.workMode}
                  onChange={(values) => setFilters(prev => ({ ...prev, workMode: values }))}
                />

                <MultiSelect
                  label="Tipo de Contrato"
                  options={allContractTypes.map(contractType => ({
                    value: contractType,
                    label: contractType
                  }))}
                  selectedValues={filters.contractType}
                  onChange={(values) => setFilters(prev => ({ ...prev, contractType: values }))}
                />

                <MultiSelect
                  label="Posición"
                  options={allPositions.map(position => ({
                    value: position,
                    label: position
                  }))}
                  selectedValues={filters.position}
                  onChange={(values) => setFilters(prev => ({ ...prev, position: values }))}
                />

                <MultiSelect
                  label="Rango de Sentimiento"
                  options={[
                    { value: 'positive', label: 'Positivo (≥ 0.5)' },
                    { value: 'neutral', label: 'Neutral (-0.5 a 0.5)' },
                    { value: 'negative', label: 'Negativo (≤ -0.5)' }
                  ]}
                  selectedValues={filters.sentimentRange}
                  onChange={(values) => setFilters(prev => ({ ...prev, sentimentRange: values }))}
                />

                <MultiSelect
                  label="Estado del Mensaje"
                  options={[
                    { value: 'sent', label: 'Enviados' },
                    { value: 'delivered', label: 'Entregados' },
                    { value: 'read', label: 'Leídos' },
                    { value: 'failed', label: 'Fallidos' }
                  ]}
                  selectedValues={filters.messageStatus}
                  onChange={(values) => setFilters(prev => ({ ...prev, messageStatus: values }))}
                />

                <MultiSelect
                  label="Nivel de Engagement"
                  options={[
                    { value: 'high', label: 'Alto (Respondieron)' },
                    { value: 'medium', label: 'Medio (Clicaron)' },
                    { value: 'low', label: 'Bajo (Solo leyeron)' },
                    { value: 'none', label: 'Ninguno (No interactuaron)' }
                  ]}
                  selectedValues={filters.engagementLevel}
                  onChange={(values) => setFilters(prev => ({ ...prev, engagementLevel: values }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Configuración de Reportes Automáticos */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Reportes Automáticos</h3>
              <p className="text-sm text-gray-600">Configura el envío automático de informes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Envío</label>
              <select
                value={automatedReportSettings.frequency}
                onChange={(e) => updateReportSetting('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="never">Nunca</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>
              <div className="space-y-2">
                {automatedReportSettings.recipients.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={email}
                      onChange={(e) => {
                        const updatedRecipients = [...automatedReportSettings.recipients];
                        updatedRecipients[index] = e.target.value;
                        updateReportSetting('recipients', updatedRecipients);
                      }}
                      placeholder="email@empresa.com"
                    />
                    <button
                      onClick={() => {
                        const updatedRecipients = automatedReportSettings.recipients.filter((_, i) => i !== index);
                        updateReportSetting('recipients', updatedRecipients);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover email"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newEmail = prompt('Ingresa el email del destinatario:');
                    if (newEmail) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(newEmail)) {
                        alert('Por favor ingresa un email válido');
                        return;
                      }
                      if (automatedReportSettings.recipients.includes(newEmail)) {
                        alert('Este email ya está en la lista');
                        return;
                      }
                      updateReportSetting('recipients', [...automatedReportSettings.recipients, newEmail]);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Destinatario
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {automatedReportSettings.recipients.length} destinatario{automatedReportSettings.recipients.length !== 1 ? 's' : ''} configurado{automatedReportSettings.recipients.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opciones de Reporte</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={automatedReportSettings.includeCharts}
                    onChange={(e) => updateReportSetting('includeCharts', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeCharts" className="ml-2 block text-sm text-gray-900">
                    Incluir gráficos en reportes
                  </label>
                </div>
                <button
                  onClick={applyReportSettings}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  💾 Aplicar Configuración
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
             <div className="flex items-center">
               <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div>
                 <p className="text-sm font-medium text-green-800">Configuración sincronizada con Settings</p>
                 <p className="text-xs text-green-600">Los cambios aquí se reflejan automáticamente en la configuración general</p>
               </div>
             </div>
           </div>
         </div>

         {/* Descarga de Reportes Detallados */}
         <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
           <div className="flex items-center mb-6">
             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
               <ArrowDownTrayIcon className="h-6 w-6 text-white" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-900">Descarga de Reportes Detallados</h3>
               <p className="text-sm text-gray-600">Exporta reportes completos en formato Excel con toda la información disponible</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
               <div className="flex items-center mb-4">
                 <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                 <div>
                   <h4 className="text-lg font-bold text-gray-900">Reporte por Empresa</h4>
                   <p className="text-sm text-gray-600">Mensajes agrupados por empresa con estadísticas detalladas</p>
                 </div>
               </div>
               <div className="space-y-3 mb-4">
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                   Hoja resumen con estadísticas por empresa
                 </div>
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                   Hojas detalladas por cada empresa
                 </div>
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                   Incluye fecha, hora, canal, destinatarios y más
                 </div>
               </div>
               <button
                 onClick={openCompanyReportModal}
                 className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
               >
                 <FunnelIcon className="h-5 w-5 mr-2" />
                 Configurar y Descargar Reporte por Empresa
               </button>
             </div>

             <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
               <div className="flex items-center mb-4">
                 <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                 <div>
                   <h4 className="text-lg font-bold text-gray-900">Reporte por Usuario</h4>
                   <p className="text-sm text-gray-600">Mensajes agrupados por usuario con información completa</p>
                 </div>
               </div>
               <div className="space-y-3 mb-4">
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   Hoja resumen con estadísticas por usuario
                 </div>
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   Hoja completa con todos los detalles
                 </div>
                 <div className="flex items-center text-sm text-gray-700">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   Incluye empresa, departamento, región y más
                 </div>
               </div>
               <button
                 onClick={openUserReportModal}
                 className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
               >
                 <FunnelIcon className="h-5 w-5 mr-2" />
                 Configurar y Descargar Reporte por Usuario
               </button>
             </div>
           </div>

           <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
             <div className="flex items-start">
               <svg className="h-5 w-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div>
                 <p className="text-sm font-medium text-gray-800">Información de los reportes</p>
                 <ul className="text-xs text-gray-600 mt-1 space-y-1">
                   <li>• Los reportes incluyen TODOS los mensajes enviados (sin filtros de fecha)</li>
                   <li>• Formato Excel (.xlsx) con múltiples hojas organizadas</li>
                   <li>• Información detallada: empresa, usuario, fecha, hora, canal, mensaje, estado, etc.</li>
                   <li>• Estadísticas automáticas y resúmenes incluidos</li>
                 </ul>
               </div>
             </div>
           </div>
         </div>

        {/* Sentiment Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Sentiment Trends Over Time */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Tendencias de Sentimientos</h3>
                <p className="text-sm text-gray-600">Evolución del sentimiento a lo largo del tiempo</p>
              </div>
            </div>
            <div className="h-80">
              <Line
                data={{
                  labels: Object.keys(reports.sentimentMetrics?.sentimentTrends || {}).sort(),
                  datasets: [{
                    label: 'Sentimiento Promedio',
                    data: Object.keys(reports.sentimentMetrics?.sentimentTrends || {}).sort().map(date =>
                      reports.sentimentMetrics.sentimentTrends[date]?.average || 0
                    ),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Sentiment by Company */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500"></div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl mr-4">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sentimientos por Empresa</h3>
                <p className="text-sm text-gray-600">Distribución del sentimiento por organización</p>
              </div>
            </div>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(reports.sentimentMetrics?.sentimentByCompany || {}),
                  datasets: [{
                    label: 'Sentimiento Promedio',
                    data: Object.values(reports.sentimentMetrics?.sentimentByCompany || {}).map(company => company.average || 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Modal para Reporte por Empresa */}
      {showCompanyReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurar Reporte por Empresa</h2>
                    <p className="text-gray-600">Personaliza los filtros para tu reporte</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanyReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Filtros de Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                    <input
                      type="date"
                      value={companyReportFilters.dateFrom}
                      onChange={(e) => handleCompanyFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                    <input
                      type="date"
                      value={companyReportFilters.dateTo}
                      onChange={(e) => handleCompanyFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filtros de Empresa */}
                <MultiSelect
                  label="Empresas"
                  options={allCompanies.map(company => ({
                    value: company,
                    label: company
                  }))}
                  selectedValues={companyReportFilters.companies}
                  onChange={(values) => handleCompanyFilterChange('companies', values)}
                  placeholder="Seleccionar empresas..."
                />

                {/* Filtros de Canal */}
                <MultiSelect
                  label="Canales"
                  options={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'telegram', label: 'Telegram' }
                  ]}
                  selectedValues={companyReportFilters.channels}
                  onChange={(values) => handleCompanyFilterChange('channels', values)}
                  placeholder="Seleccionar canales..."
                />

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={clearCompanyFilters}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={() => setShowCompanyReportModal(false)}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={downloadCompanyReport}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
                      Descargar Reporte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Reporte por Usuario */}
      {showUserReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurar Reporte por Usuario</h2>
                    <p className="text-gray-600">Personaliza los filtros para tu reporte</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Filtros de Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                    <input
                      type="date"
                      value={userReportFilters.dateFrom}
                      onChange={(e) => handleUserFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                    <input
                      type="date"
                      value={userReportFilters.dateTo}
                      onChange={(e) => handleUserFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Filtros de Empresa */}
                <MultiSelect
                  label="Empresas"
                  options={allCompanies.map(company => ({
                    value: company,
                    label: company
                  }))}
                  selectedValues={userReportFilters.companies}
                  onChange={(values) => handleUserFilterChange('companies', values)}
                  placeholder="Seleccionar empresas..."
                />

                {/* Filtros de Departamento */}
                <MultiSelect
                  label="Departamentos"
                  options={allDepartments.map(dept => ({
                    value: dept,
                    label: dept
                  }))}
                  selectedValues={userReportFilters.departments}
                  onChange={(values) => handleUserFilterChange('departments', values)}
                  placeholder="Seleccionar departamentos..."
                />

                {/* Filtros de Región */}
                <MultiSelect
                  label="Regiones"
                  options={allRegions.map(region => ({
                    value: region,
                    label: region
                  }))}
                  selectedValues={userReportFilters.regions}
                  onChange={(values) => handleUserFilterChange('regions', values)}
                  placeholder="Seleccionar regiones..."
                />

                {/* Filtros de Canal */}
                <MultiSelect
                  label="Canales"
                  options={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'telegram', label: 'Telegram' }
                  ]}
                  selectedValues={userReportFilters.channels}
                  onChange={(values) => handleUserFilterChange('channels', values)}
                  placeholder="Seleccionar canales..."
                />

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={clearUserFilters}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={() => setShowUserReportModal(false)}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={downloadUserReport}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
                      Descargar Reporte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;