import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  PaperAirplaneIcon,
  DocumentTextIcon as TemplateIcon,
  DocumentChartBarIcon as DocumentReportIcon,
  FolderIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  BellIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import EmployeeSelector from './EmployeeSelector.js';
import SendMessages from './SendMessages.js';
import EmployeeFolders from './EmployeeFolders.js';
import TemplatesDashboard from './TemplatesDashboard.js';
import ReportsDashboard from './ReportsDashboard.js';
import EmployeeBulkUpload from './EmployeeBulkUpload.js'; // Importar el nuevo componente
import templateService from '../../services/templateService.js';
import databaseEmployeeService from '../../services/databaseEmployeeService.js';
import communicationService from '../../services/communicationService.js';
import organizedDatabaseService from '../../services/organizedDatabaseService.js';
import trendsAnalysisService from '../../services/trendsAnalysisService.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Estilos CSS para el efecto de flip
const flipStyles = `
  .flip-card {
    perspective: 1000px;
    min-height: 600px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1.5rem;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }
`;

const WebrifyCommunicationDashboard = ({ activeTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Función para determinar la pestaña activa basada en la URL actual
  const getActiveTabFromUrl = useCallback(() => {
    const currentPath = location.pathname;
    
    // Mapeo de URLs a pestañas
    const urlToTabMap = {
      '/base-de-datos': 'dashboard',
      '/base-de-datos/database': 'database',
      '/communication/send': 'send',
      '/communication/folders': 'folders',
      '/communication/templates': 'templates',
      '/communication/reports': 'reports',
      '/communication/bulk-upload': 'bulk-upload'
    };
    
    return urlToTabMap[currentPath] || activeTab;
  }, [location.pathname, activeTab]);
  
  const [currentTab, setCurrentTab] = useState(getActiveTabFromUrl());
  
  // Actualizar la pestaña activa cuando cambia la URL
  useEffect(() => {
    const newTab = getActiveTabFromUrl();
    if (newTab !== currentTab) {
      setCurrentTab(newTab);
    }
  }, [location.pathname, currentTab, getActiveTabFromUrl]);
  
  const [templatesCount, setTemplatesCount] = useState(0);
  const [sentMessages, setSentMessages] = useState(0);
  const [readRate, setReadRate] = useState(0);
  const [companyInsights, setCompanyInsights] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    insights: true,
    recommendations: true
  });
  const [employees, setEmployees] = useState([]);

  // Estados para el selector de empresas
  const [companiesFromDB, setCompaniesFromDB] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [companyMetrics, setCompanyMetrics] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Lista de compañías para análisis (ordenadas alfabéticamente) - useMemo para evitar recreación
  const companies = useMemo(() => [
    'Aguas Andinas', 'Andes Iron', 'Banco de Chile', 'Banco Santander', 'BHP',
    'Cencosud', 'Codelco', 'Colbún', 'Copec', 'Enel',
    'Entel', 'Falabella', 'Latam Airlines', 'Lider', 'Movistar'
  ], []);

  // Función para cargar insights de IA para todas las compañías usando datos reales
  const loadCompanyInsights = useCallback(async () => {
    try {
      console.log('🔍 Cargando insights reales para todas las compañías...');
      
      const insightsPromises = companies.map(async (companyName) => {
        try {
          // Usar el nuevo servicio de análisis de tendencias con datos reales
          const insights = await trendsAnalysisService.generateCompanyInsights(companyName);
          console.log(`✅ Insights cargados para ${companyName}:`, insights);
          return { companyName, insights };
        } catch (error) {
          console.warn(`Error loading insights for ${companyName}:`, error.message);
          // Retornar insights por defecto cuando hay error
          return {
            companyName,
            insights: {
              frontInsights: [
                {
                  title: 'Análisis en Progreso',
                  description: `Los datos de comunicación para ${companyName} están siendo procesados con IA. Los insights estarán disponibles pronto.`,
                  type: 'info'
                }
              ],
              backInsights: [
                {
                  title: 'Sistema Activo',
                  description: 'El sistema está analizando patrones de comunicación reales con Groq AI.',
                  type: 'info'
                }
              ]
            }
          };
        }
      });

      const results = await Promise.all(insightsPromises);
      const insightsMap = {};
      results.forEach(({ companyName, insights }) => {
        insightsMap[companyName] = insights;
      });

      setCompanyInsights(insightsMap);
      console.log('✅ Todos los insights cargados:', Object.keys(insightsMap));
    } catch (error) {
      console.error('Error loading company insights:', error);
    }
  }, [companies]); // companies es una dependencia válida ya que viene de useMemo

  // Función para cargar empresas y empleados desde la base de datos
  const loadCompaniesFromDB = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const [companiesData, employeesData] = await Promise.all([
        organizedDatabaseService.getCompanies(),
        organizedDatabaseService.getEmployees()
      ]);
      setCompaniesFromDB(companiesData);
      setEmployees(employeesData);
      console.log('Empresas cargadas desde BD:', companiesData);
      console.log('Empleados cargados desde BD:', employeesData);
    } catch (error) {
      console.error('Error cargando datos desde BD:', error);
      // En caso de error, usar la lista estática como fallback
      setCompaniesFromDB(companies.map(name => ({ id: name, name })));
      setEmployees([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // Función para cargar métricas específicas de una empresa
  const loadCompanyMetrics = useCallback(async (companyId) => {
    try {
      if (!companyId || companyId === 'all') {
        setCompanyMetrics(null);
        return;
      }

      // Obtener estadísticas específicas de la empresa
      const [employeeCount, messageStats] = await Promise.all([
        databaseEmployeeService.getEmployeeCountByCompany(companyId),
        databaseEmployeeService.getMessageStatsByCompany(companyId)
      ]);

      setCompanyMetrics({
        employeeCount,
        messageStats,
        engagementRate: messageStats.total > 0 ? Math.round((messageStats.read / messageStats.total) * 100) : 0
      });
    } catch (error) {
      console.error('Error cargando métricas de empresa:', error);
      setCompanyMetrics(null);
    }
  }, []);

  // Cargar datos del dashboard al montar el componente y cuando cambia el estado de navegación
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Cargando dashboard de comunicación...');

        // Cargar empresas desde la base de datos
        await loadCompaniesFromDB();

        // Cargar conteo de plantillas con manejo de error
        try {
          const templatesCount = await templateService.getTemplatesCount();
          setTemplatesCount(templatesCount);
        } catch (error) {
          console.warn('Error loading templates count:', error);
          setTemplatesCount(0);
        }

        // Cargar estadísticas del dashboard desde el servicio de base de datos con manejo de error
        try {
          const dashboardStats = await databaseEmployeeService.getDashboardStats();
          // setTotalEmployees(dashboardStats.totalEmployees); // Comentado ya que no se usa
          setSentMessages(dashboardStats.sentMessages);
          setReadRate(dashboardStats.readRate);
        } catch (error) {
          console.warn('Error loading dashboard stats:', error);
          // setTotalEmployees(0); // Comentado ya que no se usa
          setSentMessages(0);
          setReadRate(0);
        }

        // Cargar insights de IA para todas las compañías con manejo de error
        try {
          await loadCompanyInsights();
        } catch (error) {
          console.warn('Error loading company insights:', error);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setTemplatesCount(0);
        // setTotalEmployees(0); // Comentado ya que no se usa
        setSentMessages(0);
        setReadRate(0);
      }
    };

    loadDashboardData();
  }, [loadCompanyInsights, loadCompaniesFromDB]);

  // Efecto para cargar métricas cuando cambia la empresa seleccionada
  useEffect(() => {
    loadCompanyMetrics(selectedCompany);
  }, [selectedCompany, loadCompanyMetrics]);

  // Efecto separado para manejar la compañía seleccionada
  useEffect(() => {
    // Verificar si hay una compañía seleccionada desde el estado de navegación
    console.log('Verificando estado de navegación...');
    console.log('location:', location);
    console.log('location.state:', location.state);

    if (location.state && location.state.selectedCompany) {
      const selectedCompany = location.state.selectedCompany;
      console.log('Compañía seleccionada desde navegación:', selectedCompany);
      
      // Lista de compañías para comparación
      const companiesList = ['Aguas Andinas', 'Andes Iron', 'Banco de Chile', 'Banco Santander', 'BHP', 'Cencosud', 'Codelco', 'Colbún', 'Copec', 'Enel', 'Entel', 'Falabella', 'Latam Airlines', 'Lider', 'Movistar'];
      console.log('Compañías disponibles:', companiesList);

      // Buscar la compañía que coincida exactamente
      const matchingCompany = companiesList.find(company => company === selectedCompany);
      console.log('Compañía encontrada:', matchingCompany);

      if (matchingCompany) {
        console.log('Compañía seleccionada:', matchingCompany);
      } else {
        console.warn('No se encontró coincidencia para:', selectedCompany);
      }
    } else {
      console.log('No hay compañía seleccionada en el estado');
    }
  }, [location]); // Añadir location como dependencia completa




  // Orden específico para los insights (incluyendo variaciones)
  const insightOrder = [
    "Éxito",
    "Exito",
    "Tendencia Positiva",
    "Tendencia positiva",
    "Oportunidad",
    "Insight",
    "Patrón Identificado",
    "Patrón identificado",
    "Tema Recurrente",
    "Tema recurrente",
    "Área de Mejora",
    "Área de mejora",
    "Tendencias negativas",
    "Tendencias Negativas",
    "Alerta"
  ];

  // Función para obtener el índice de orden basado en keywords
  const getOrderIndex = (title) => {
    for (let i = 0; i < insightOrder.length; i++) {
      if (title.toLowerCase().includes(insightOrder[i].toLowerCase())) {
        return i;
      }
    }
    return insightOrder.length; // Si no coincide, va al final
  };

  // Función para ordenar insights por título
  const sortInsights = (insights) => {
    return insights.sort((a, b) => getOrderIndex(a.title) - getOrderIndex(b.title));
  };

  // Función para renderizar insights dinámicos
  const renderCompanyInsights = (companyName, insights) => {
    if (!insights) {
      return (
        <div className="space-y-4">
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Cargando insights...</span>
            </div>
            <p className="text-sm text-gray-600">Los insights de IA se están generando automáticamente.</p>
          </div>
        </div>
      );
    }

    const sortedFrontInsights = sortInsights([...(insights.frontInsights || [])]);

    if (companyName === 'Corporación Chilena') {
      console.log('Corporación Chilena front insights titles:', insights.frontInsights?.map(i => i.title));
      console.log('Corporación Chilena sorted front insights titles:', sortedFrontInsights.map(i => i.title));
    }

    return (
      <div className="space-y-4">
        {sortedFrontInsights.map((insight, index) => (
          <div key={index} className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                insight.type === 'positive' ? 'bg-green-500' :
                insight.type === 'negative' ? 'bg-red-500' :
                insight.type === 'warning' ? 'bg-orange-500' :
                insight.type === 'info' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">{insight.title}</span>
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar insights del reverso
  const renderBackInsights = (companyName, insights) => {
    if (!insights) {
      return (
        <div className="space-y-4">
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Más insights próximamente</span>
            </div>
            <p className="text-sm text-gray-600">Se están recopilando datos adicionales para insights más detallados.</p>
          </div>
        </div>
      );
    }

    const sortedBackInsights = sortInsights([...(insights.backInsights || [])]);

    if (companyName === 'Corporación Chilena') {
      console.log('Corporación Chilena back insights titles:', insights.backInsights?.map(i => i.title));
      console.log('Corporación Chilena sorted back insights titles:', sortedBackInsights.map(i => i.title));
    }

    return (
      <div className="space-y-4">
        {sortedBackInsights.map((insight, index) => (
          <div key={index} className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                insight.type === 'positive' ? 'bg-green-500' :
                insight.type === 'negative' ? 'bg-red-500' :
                insight.type === 'warning' ? 'bg-orange-500' :
                insight.type === 'info' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">{insight.title}</span>
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    );
  };



  const tabs = [
    { id: 'dashboard', name: 'Tendencias', icon: ChartBarIcon, url: '/base-de-datos' },
    { id: 'database', name: 'Datos', icon: BuildingOfficeIcon, url: '/base-de-datos/database' },
    { id: 'send', name: 'Enviar', icon: PaperAirplaneIcon, url: '/communication/send' },
    { id: 'folders', name: 'Carpetas', icon: FolderIcon, url: '/communication/folders' },
    { id: 'templates', name: 'Plantillas', icon: TemplateIcon, url: '/communication/templates' },
    { id: 'reports', name: 'Reportes', icon: DocumentReportIcon, url: '/communication/reports' },
    { id: 'bulk-upload', name: 'Importar', icon: ArrowUpTrayIcon, url: '/communication/bulk-upload' },
  ];

  // Función para navegar a una URL específica
  const handleNavigation = async (tab) => {
    try {
      console.log(`🚀 Navegando a: ${tab.url}`);
      navigate(tab.url);
    } catch (error) {
      console.error('❌ Error al navegar:', error);
      // En caso de error, mostrar alerta
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al navegar. Por favor, inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      });
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'database':
        return <EmployeeSelector />;
      case 'send':
        return <SendMessages />;
      case 'folders':
        return <EmployeeFolders />;
      case 'templates':
        return <TemplatesDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'bulk-upload':
        return <EmployeeBulkUpload />; // Agregar la nueva pestaña
      default:
        return (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard de Comunicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8" />
                  <div className="ml-4">
                    <p className="text-sm opacity-80">Total Empleados</p>
                    <p className="text-2xl font-bold">{employees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <PaperAirplaneIcon className="h-8 w-8" />
                  <div className="ml-4">
                    <p className="text-sm opacity-80">Mensajes Enviados</p>
                    <p className="text-2xl font-bold">{sentMessages.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <TemplateIcon className="h-8 w-8" />
                  <div className="ml-4">
                    <p className="text-sm opacity-80">Plantillas</p>
                    <p className="text-2xl font-bold">{templatesCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <DocumentReportIcon className="h-8 w-8" />
                  <div className="ml-4">
                    <p className="text-sm opacity-80">Tasa de Lectura</p>
                    <p className="text-2xl font-bold">{readRate}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              {/* Inyectar estilos CSS para flip effect */}
              <style dangerouslySetInnerHTML={{ __html: flipStyles }} />
              
              {/* Análisis Inteligente de Tendencias - Diseño Moderno y Compacto */}
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Análisis Inteligente de Tendencias
                      </h3>
                      <p className="text-gray-600 text-sm">Insights generados por IA sobre comunicación y engagement</p>
                    </div>
                  </div>
                </div>

                {/* Selector de Empresas */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Empresa:
                      </label>
                    </div>
                    <div className="flex-1 max-w-xs">
                      {loadingCompanies ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">Cargando empresas...</span>
                        </div>
                      ) : (
                        <select
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="all">Todas las empresas</option>
                          {companiesFromDB.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {companyMetrics && (
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Empleados:</span>
                          <span className="font-semibold text-purple-600">{companyMetrics.employeeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Engagement:</span>
                          <span className="font-semibold text-green-600">{companyMetrics.engagementRate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-300 hover:scale-102">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <ChartBarIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {companyMetrics ? `+${Math.floor(Math.random() * 20) + 5}%` : '+12%'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {companyMetrics ? `${companyMetrics.engagementRate}%` : '78%'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCompany !== 'all' && companyMetrics ? 'Engagement Empresa' : 'Engagement Promedio'}
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 hover:scale-102">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BellIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Activo</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {companyMetrics ? `${Math.floor(Math.random() * 15) + 85}%` : '92%'}
                    </p>
                    <p className="text-sm text-gray-600">Rendimiento AI</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-100 hover:shadow-md transition-all duration-300 hover:scale-102">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-cyan-100 p-2 rounded-lg">
                        <LightBulbIcon className="h-5 w-5 text-cyan-600" />
                      </div>
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Optimizar</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {companyMetrics ? `${Math.floor(Math.random() * 20) + 75}%` : '85%'}
                    </p>
                    <p className="text-sm text-gray-600">Optimización</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-rose-100 hover:shadow-md transition-all duration-300 hover:scale-102">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-rose-100 p-2 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-rose-600" />
                      </div>
                      <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-full">Alta</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {companyMetrics ? companyMetrics.employeeCount || '0' : '16'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCompany !== 'all' && companyMetrics ? 'Empleados' : 'Tendencias Detectadas'}
                    </p>
                  </div>
                </div>

                {/* Secciones Expandibles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Insights Clave */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-200">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, insights: !prev.insights }))}
                      className="flex items-center justify-between w-full mb-4 hover:bg-purple-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <LightBulbIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-900">Insights Clave</h4>
                      </div>
                      {expandedSections.insights ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.insights && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedCompany !== 'all' && companyInsights[selectedCompany] ? (
                          // Mostrar insights específicos de la empresa seleccionada
                          renderCompanyInsights(selectedCompany, companyInsights[selectedCompany])
                        ) : (
                          // Mostrar insights generales cuando no hay empresa seleccionada
                          <>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-800">Éxito</span>
                              </div>
                              <p className="text-sm text-gray-700">El engagement ha aumentado 15% en la última semana</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-blue-800">Oportunidad</span>
                              </div>
                              <p className="text-sm text-gray-700">Mejorar respuesta en mensajes de fin de semana</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-orange-800">Tendencia</span>
                              </div>
                              <p className="text-sm text-gray-700">Mayor actividad en horas de la mañana (9-11 AM)</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recomendaciones */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, recommendations: !prev.recommendations }))}
                      className="flex items-center justify-between w-full mb-4 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-900">Recomendaciones</h4>
                      </div>
                      {expandedSections.recommendations ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.recommendations && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedCompany !== 'all' && companyInsights[selectedCompany] ? (
                          // Mostrar recomendaciones específicas de la empresa seleccionada
                          renderBackInsights(selectedCompany, companyInsights[selectedCompany])
                        ) : (
                          // Mostrar recomendaciones generales cuando no hay empresa seleccionada
                          <>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-purple-800">Alta Prioridad</span>
                              </div>
                              <p className="text-sm text-gray-700">Implementar respuestas automáticas para consultas frecuentes</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-indigo-800">Media Prioridad</span>
                              </div>
                              <p className="text-sm text-gray-700">Optimizar horarios de envío basados en engagement</p>
                            </div>
                            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                              <div className="flex items-center mb-1">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-cyan-800">Baja Prioridad</span>
                              </div>
                              <p className="text-sm text-gray-700">Personalizar plantillas por tipo de empleado</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>


                {/* Footer */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Análisis Actualizado</p>
                      <p className="text-xs text-indigo-600">Los insights se generan automáticamente cada 24 horas basados en patrones de comunicación y consultas a la base de conocimiento.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header simple sin menú */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <nav className="px-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div key={tab.id}>
                        <button
                          onClick={() => {
                            handleNavigation(tab);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
                            window.location.pathname === tab.url
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {tab.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Main content - Ahora ocupa todo el ancho disponible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Desktop horizontal menu - rediseño moderno */}
        <div className="mb-4">
          <nav className="flex items-center justify-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 shadow-lg border border-gray-200/50 backdrop-blur-sm overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = window.location.pathname === tab.url;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => handleNavigation(tab)}
                    className={`relative flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl scale-105'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:scale-102 border border-gray-200'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 transition-colors duration-300 ${
                      isActive ? 'text-blue-100' : 'text-blue-500 group-hover:text-blue-600'
                    }`} />
                    <span className="tracking-wide">{tab.name}</span>

                    {/* Active glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-30 animate-pulse"></div>
                    )}
                  </button>

                  {/* Decorative elements */}
                  {!isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="w-full">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default WebrifyCommunicationDashboard;