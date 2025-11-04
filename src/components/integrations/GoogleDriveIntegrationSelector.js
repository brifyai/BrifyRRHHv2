import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, BookOpen, Settings, ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';

const GoogleDriveIntegrationSelector = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);

  const setupMethods = [
    {
      id: 'auto',
      title: 'Configuración Automática',
      description: 'La forma más rápida y sencilla',
      icon: <Zap className="w-6 h-6" />,
      time: '1 minuto',
      difficulty: 'Muy fácil',
      features: [
        'Generación automática de credenciales',
        'Asistente paso a paso guiado',
        'Validación automática',
        'Copiar y pegar sencillo'
      ],
      color: 'blue',
      component: 'GoogleDriveAutoSetup',
      path: '/integrations/google-drive/auto-setup'
    },
    {
      id: 'wizard',
      title: 'Asistente Interactivo',
      description: 'Guía detallada con soporte',
      icon: <Settings className="w-6 h-6" />,
      time: '5 minutos',
      difficulty: 'Fácil',
      features: [
        'Paso a paso detallado',
        'Enlaces directos a Google Cloud',
        'Tips y solución de problemas',
        'Verificación en cada paso'
      ],
      color: 'green',
      component: 'GoogleDriveSetupWizard',
      path: '/integrations/google-drive/wizard'
    },
    {
      id: 'manual',
      title: 'Guía Manual',
      description: 'Control total del proceso',
      icon: <BookOpen className="w-6 h-6" />,
      time: '10 minutos',
      difficulty: 'Intermedio',
      features: [
        'Documentación completa',
        'Capturas de pantalla incluidas',
        'Solución de problemas avanzada',
        'Configuración personalizada'
      ],
      color: 'purple',
      component: 'GoogleDriveQuickSetup',
      path: '/google-drive-quick-setup'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method.id);
    // Navegar al componente seleccionado usando React Router
    navigate(method.path);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Muy fácil': return 'text-green-600 bg-green-100';
      case 'Fácil': return 'text-blue-600 bg-blue-100';
      case 'Intermedio': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
          selected: 'border-blue-500 bg-blue-100'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-500',
          button: 'bg-green-500 hover:bg-green-600',
          selected: 'border-green-500 bg-green-100'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-500',
          button: 'bg-purple-500 hover:bg-purple-600',
          selected: 'border-purple-500 bg-purple-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600',
          selected: 'border-gray-500 bg-gray-100'
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configurar Google Drive para BrifyRRHH v2
        </h1>
        <p className="text-gray-600 mb-6">
          Elige el método de configuración que mejor se adapte a tus necesidades
        </p>
        
        {/* Quick Stats */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Tiempo promedio: 5 minutos</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-1" />
            <span>Configuración 100% segura</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Soporte incluido</span>
          </div>
        </div>
      </div>

      {/* Setup Methods Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {setupMethods.map((method) => {
          const colors = getColorClasses(method.color);
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              className={`relative bg-white rounded-lg p-6 border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isSelected ? colors.selected : colors.border
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}

              {/* Method Header */}
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center ${colors.icon} mr-4`}>
                  {method.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Method Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiempo estimado:</span>
                  <span className="font-medium">{method.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dificultad:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(method.difficulty)}`}>
                    {method.difficulty}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Características:</h4>
                <ul className="space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={`w-full px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMethodSelect(method);
                }}
              >
                {isSelected ? 'Configuración Seleccionada' : 'Seleccionar Método'}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Recommendation Section */}
      <div className="bg-white rounded-lg p-6 border border-blue-200">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Recomendación para la mayoría de usuarios
            </h3>
            <p className="text-gray-600 mb-3">
              La <strong>Configuración Automática</strong> es la opción más rápida y sencilla para la mayoría de los usuarios. 
              Genera automáticamente todas las credenciales necesarias y te guía paso a paso con instrucciones claras.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Ideal para principiantes
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Sin conocimientos técnicos
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Soporte integrado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          ¿Necesitas ayuda para decidir? 
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.href = '/help/google-drive'}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ver Comparación Detallada
          </button>
          <button
            onClick={() => window.location.href = '/support'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Contactar Soporte
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Enlaces Rápidos:</h4>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Google Cloud Console
          </a>
          <a
            href="/docs/google-drive-integration"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Documentación Técnica
          </a>
          <a
            href="/faq/google-drive"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Preguntas Frecuentes
          </a>
          <a
            href="/troubleshooting/google-drive"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Solución de Problemas
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveIntegrationSelector;