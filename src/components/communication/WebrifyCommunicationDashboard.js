import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import EmployeeSelector from './EmployeeSelector';
import SendMessages from './SendMessages';
import EmployeeFolders from './EmployeeFolders';
import TemplatesDashboard from './TemplatesDashboard';
import ReportsDashboard from './ReportsDashboard';
import EmployeeBulkUpload from './EmployeeBulkUpload'; // Importar el nuevo componente
import templateService from '../../services/templateService';
import databaseEmployeeService from '../../services/databaseEmployeeService';
import inMemoryDraftService from '../../services/inMemoryDraftService';
import communicationService from '../../services/communicationService';
import { supabase } from '../../lib/supabase';
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
  const [templatesCount, setTemplatesCount] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [sentMessages, setSentMessages] = useState(0);
  const [readRate, setReadRate] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [companyInsights, setCompanyInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos del dashboard al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Cargando dashboard de comunicación...');

        // Cargar conteo de plantillas
        const templatesCount = await templateService.getTemplatesCount();
        setTemplatesCount(templatesCount);

        // Cargar estadísticas del dashboard desde el servicio de base de datos
        const dashboardStats = await databaseEmployeeService.getDashboardStats();
        setTotalEmployees(dashboardStats.totalEmployees);
        setSentMessages(dashboardStats.sentMessages);
        setReadRate(dashboardStats.readRate);

        // Cargar insights de IA para todas las compañías
        await loadCompanyInsights();

        // Verificar si hay una compañía seleccionada desde el estado de navegación
        console.log('Verificando estado de navegación...');
        console.log('location:', location);
        console.log('location.state:', location.state);

        if (location.state && location.state.selectedCompany) {
          const selectedCompany = location.state.selectedCompany;
          console.log('Compañía seleccionada desde navegación:', selectedCompany);
          console.log('Compañías disponibles:', companies);

          // Buscar la compañía que coincida exactamente
          const matchingCompany = companies.find(company => company === selectedCompany);
          console.log('Compañía encontrada:', matchingCompany);

          if (matchingCompany) {
            // Abrir la tarjeta de la compañía seleccionada
            setFlippedCards(prev => new Set([...prev, matchingCompany]));
            console.log('Tarjeta volteada para:', matchingCompany);
          } else {
            console.warn('No se encontró coincidencia para:', selectedCompany);
          }
        } else {
          console.log('No hay compañía seleccionada en el estado');
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setTemplatesCount(0);
        setTotalEmployees(0);
        setSentMessages(0);
        setReadRate(0);
      }
    };

    loadDashboardData();
  }, []);

  // Lista de compañías para análisis (ordenadas alfabéticamente)
  const companies = ['Achs', 'AFP Habitat', 'Antofagasta Minerals', 'Arcoprime', 'Ariztia', 'CMPC', 'Colbun', 'Copec', 'Corporación Chilena', 'Empresas SB', 'Enaex', 'Grupo Saesa', 'Hogar Alemán', 'Inchcape', 'SQM', 'Vida Cámara'];

  // Función para cargar insights de IA para todas las compañías
  const loadCompanyInsights = async () => {
    setLoadingInsights(true);
    try {
      const insightsPromises = companies.map(async (companyName) => {
        try {
          const insights = await communicationService.generateCompanyInsights(companyName);
          return { companyName, insights };
        } catch (error) {
          console.error(`Error loading insights for ${companyName}:`, error);
          return { companyName, insights: null };
        }
      });

      const results = await Promise.all(insightsPromises);
      const insightsMap = {};
      results.forEach(({ companyName, insights }) => {
        insightsMap[companyName] = insights;
      });

      setCompanyInsights(insightsMap);
    } catch (error) {
      console.error('Error loading company insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Función para voltear tarjetas
  const toggleFlip = (companyId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // Función para expandir/colapsar tarjetas
  const toggleExpansion = (companyId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // Función para filtrar compañías basadas en el término de búsqueda
  const filteredCompanies = companies.filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Esquemas de color para cada compañía
  const colorSchemes = {
    'Ariztia': {
      frontBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      frontBorder: 'border-blue-200',
      backBg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      backBorder: 'border-indigo-200',
      iconBg: 'bg-blue-500',
      iconBgBack: 'bg-indigo-500'
    },
    'Inchcape': {
      frontBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      frontBorder: 'border-green-200',
      backBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      backBorder: 'border-emerald-200',
      iconBg: 'bg-green-500',
      iconBgBack: 'bg-emerald-500'
    },
    'Copec': {
      frontBg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      frontBorder: 'border-purple-200',
      backBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      backBorder: 'border-violet-200',
      iconBg: 'bg-purple-500',
      iconBgBack: 'bg-violet-500'
    },
    'CMPC': {
      frontBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      frontBorder: 'border-orange-200',
      backBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      backBorder: 'border-amber-200',
      iconBg: 'bg-orange-500',
      iconBgBack: 'bg-amber-500'
    },
    'Achs': {
      frontBg: 'bg-gradient-to-br from-pink-50 to-rose-50',
      frontBorder: 'border-pink-200',
      backBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      backBorder: 'border-rose-200',
      iconBg: 'bg-pink-500',
      iconBgBack: 'bg-rose-500'
    },
    'Arcoprime': {
      frontBg: 'bg-gradient-to-br from-cyan-50 to-teal-50',
      frontBorder: 'border-cyan-200',
      backBg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      backBorder: 'border-teal-200',
      iconBg: 'bg-cyan-500',
      iconBgBack: 'bg-teal-500'
    },
    'Grupo Saesa': {
      frontBg: 'bg-gradient-to-br from-red-50 to-pink-50',
      frontBorder: 'border-red-200',
      backBg: 'bg-gradient-to-br from-pink-50 to-red-50',
      backBorder: 'border-pink-200',
      iconBg: 'bg-red-500',
      iconBgBack: 'bg-pink-500'
    },
    'Colbun': {
      frontBg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      frontBorder: 'border-yellow-200',
      backBg: 'bg-gradient-to-br from-orange-50 to-yellow-50',
      backBorder: 'border-orange-200',
      iconBg: 'bg-yellow-500',
      iconBgBack: 'bg-orange-500'
    },
    'AFP Habitat': {
      frontBg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      frontBorder: 'border-teal-200',
      backBg: 'bg-gradient-to-br from-cyan-50 to-teal-50',
      backBorder: 'border-cyan-200',
      iconBg: 'bg-teal-500',
      iconBgBack: 'bg-cyan-500'
    },
    'Antofagasta Minerals': {
      frontBg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      frontBorder: 'border-amber-200',
      backBg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      backBorder: 'border-yellow-200',
      iconBg: 'bg-amber-500',
      iconBgBack: 'bg-yellow-500'
    },
    'Vida Cámara': {
      frontBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      frontBorder: 'border-emerald-200',
      backBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      backBorder: 'border-green-200',
      iconBg: 'bg-emerald-500',
      iconBgBack: 'bg-green-500'
    },
    'Enaex': {
      frontBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      frontBorder: 'border-rose-200',
      backBg: 'bg-gradient-to-br from-pink-50 to-rose-50',
      backBorder: 'border-pink-200',
      iconBg: 'bg-rose-500',
      iconBgBack: 'bg-pink-500'
    },
    'SQM': {
      frontBg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
      frontBorder: 'border-cyan-200',
      backBg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      backBorder: 'border-blue-200',
      iconBg: 'bg-cyan-500',
      iconBgBack: 'bg-blue-500'
    },
    'Corporación Chilena': {
      frontBg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      frontBorder: 'border-indigo-200',
      backBg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      backBorder: 'border-purple-200',
      iconBg: 'bg-indigo-500',
      iconBgBack: 'bg-purple-500'
    },
    'Hogar Alemán': {
      frontBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      frontBorder: 'border-violet-200',
      backBg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      backBorder: 'border-purple-200',
      iconBg: 'bg-violet-500',
      iconBgBack: 'bg-purple-500'
    },
    'Empresas SB': {
      frontBg: 'bg-gradient-to-br from-fuchsia-50 to-pink-50',
      frontBorder: 'border-fuchsia-200',
      backBg: 'bg-gradient-to-br from-pink-50 to-fuchsia-50',
      backBorder: 'border-pink-200',
      iconBg: 'bg-fuchsia-500',
      iconBgBack: 'bg-pink-500'
    }
  };

  // Función para renderizar una tarjeta completa de compañía
  const renderCompanyCard = (companyName) => {
    const colorScheme = colorSchemes[companyName] || colorSchemes['Ariztia']; // fallback
    const insights = companyInsights[companyName];
    const isFlipped = flippedCards.has(companyName);

    return (
      <div className={`flip-card cursor-pointer ${isFlipped ? 'flipped' : ''}`} onClick={() => toggleFlip(companyName)}>
        <div className="flip-card-inner">
          {/* Front of card */}
          <div className={`flip-card-front ${colorScheme.frontBg} rounded-2xl p-8 border ${colorScheme.frontBorder} relative`}>
            {/* Botón flotante para voltear */}
            <button
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip(companyName);
              }}
              title="Ver más insights"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex items-center mb-4">
              <div className={`${colorScheme.iconBg} p-2 rounded-lg mr-3`}>
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 break-words">{companyName}</h4>
            </div>
            {renderCompanyInsights(companyName, insights)}
          </div>

          {/* Back of card */}
          <div className={`flip-card-back ${colorScheme.backBg} rounded-2xl p-8 border ${colorScheme.backBorder} relative`}>
            {/* Botón flotante para regresar */}
            <button
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip(companyName);
              }}
              title="Regresar"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-600 rotate-180" />
            </button>

            <div className="flex items-center mb-4">
              <div className={`${colorScheme.iconBgBack} p-2 rounded-lg mr-3`}>
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 break-words">{companyName}</h4>
            </div>
            {renderBackInsights(companyName, insights)}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', name: 'Tendencias', icon: ChartBarIcon },
    { id: 'database', name: 'Datos', icon: BuildingOfficeIcon },
    { id: 'send', name: 'Enviar', icon: PaperAirplaneIcon },
    { id: 'folders', name: 'Carpetas', icon: FolderIcon },
    { id: 'templates', name: 'Plantillas', icon: TemplateIcon },
    { id: 'reports', name: 'Reportes', icon: DocumentReportIcon },
    { id: 'bulk-upload', name: 'Importar', icon: ArrowUpTrayIcon }, // Agregar nueva pestaña
  ];

  // Función para verificar si hay empleados seleccionados antes de navegar
  const handleNavigateToSend = async () => {
    try {
      // Verificar si hay empleados seleccionados en el almacenamiento temporal
      if (window.tempSelectedEmployees && window.tempSelectedEmployees.length > 0) {
        // Si hay empleados seleccionados, navegar a la página de envío con los datos
        navigate('/communication/send', { 
          state: { selectedEmployees: window.tempSelectedEmployees } 
        });
      } else if (window.selectedEmployeesData && window.selectedEmployeesData.length > 0) {
        // Si no hay empleados en tempSelectedEmployees, verificar selectedEmployeesData
        navigate('/communication/send', { 
          state: { selectedEmployees: window.selectedEmployeesData.map(emp => emp.id) } 
        });
      } else {
        // Si no hay empleados seleccionados, mostrar alerta con SweetAlert
        MySwal.fire({
          title: 'Advertencia',
          text: 'Debe seleccionar al menos un empleado en la Base de Datos antes de poder enviar mensajes',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#fcb900'
        }).then(() => {
          // Después de cerrar la alerta, redirigir a la base de datos
          navigate('/communication/database');
        });
      }
    } catch (error) {
      console.error('Error al navegar a enviar mensajes:', error);
      // En caso de error, mostrar alerta y redirigir a la base de datos
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al acceder a la función de envío de mensajes',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#0693e3'
      }).then(() => {
        navigate('/communication/database');
      });
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
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
                    <p className="text-2xl font-bold">800</p>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Análisis Inteligente de Tendencias</h3>
                    <p className="text-gray-600">Insights generados por IA sobre comunicación y engagement por empresa</p>
                  </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Insights por Empresa - Todas las 16 marcas */}
                {filteredCompanies.map((companyName) => renderCompanyCard(companyName))}
              </div>

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
                        {tab.id === 'send' ? (
                          <button
                            onClick={() => {
                              handleNavigateToSend();
                              setMobileMenuOpen(false);
                            }}
                            className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {tab.name}
                          </button>
                        ) : tab.id === 'dashboard' ? (
                          <button
                            onClick={() => {
                              navigate('/communication/dashboard');
                              setMobileMenuOpen(false);
                            }}
                            className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {tab.name}
                          </button>
                        ) : (
                          <Link
                            to={`/communication/${tab.id}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {tab.name}
                          </Link>
                        )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop horizontal menu - rediseño moderno */}
        <div className="mb-8">
          <nav className="flex items-center justify-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 shadow-lg border border-gray-200/50 backdrop-blur-sm overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <div key={tab.id} className="relative group">
                  {tab.id === 'send' ? (
                    <button
                      onClick={handleNavigateToSend}
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
                  ) : tab.id === 'dashboard' ? (
                    <button
                      onClick={() => navigate('/communication/dashboard')}
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
                  ) : (
                    <Link
                      to={`/communication/${tab.id}`}
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
                    </Link>
                  )}

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