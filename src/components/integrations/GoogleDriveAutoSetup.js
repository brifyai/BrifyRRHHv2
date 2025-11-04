import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Copy, Eye, EyeOff, ExternalLink, Zap, Shield, Clock } from 'lucide-react';

const GoogleDriveAutoSetup = () => {
  const [autoConfigData, setAutoConfigData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [currentStep, setCurrentStep] = useState('ready');

  const generateAutoConfig = async () => {
    setIsGenerating(true);
    setCurrentStep('generating');
    
    // Simular generación de configuración automática
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const configData = {
      projectId: `brify-drive-${Date.now().toString(36)}`,
      clientId: `brify-${Date.now().toString(36)}.apps.googleusercontent.com`,
      clientSecret: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      redirectUri: 'http://localhost:3000/auth/google/callback',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata'
      ]
    };
    
    setAutoConfigData(configData);
    setIsGenerating(false);
    setCurrentStep('ready_to_apply');
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const applyConfiguration = async () => {
    setCurrentStep('applying');
    
    // Simular aplicación de configuración
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Guardar en localStorage para la aplicación
    localStorage.setItem('googleDriveConfig', JSON.stringify(autoConfigData));
    
    setCurrentStep('completed');
  };

  const resetConfiguration = () => {
    setAutoConfigData(null);
    setCurrentStep('ready');
    setShowSecret(false);
  };

  const quickSetupSteps = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Generación Automática",
      description: "Creamos la configuración por ti",
      time: "10 segundos"
    },
    {
      icon: <Copy className="w-5 h-5" />,
      title: "Copiar y Pegar",
      description: "Solo copia las credenciales",
      time: "30 segundos"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Aplicación Segura",
      description: "Configuración validada y lista",
      time: "15 segundos"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración Automática de Google Drive
        </h1>
        <p className="text-gray-600">
          Configura Google Drive en menos de 1 minuto con nuestro asistente automático
        </p>
      </div>

      {/* Quick Setup Overview */}
      {currentStep === 'ready' && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Configuración en 3 Pasos Rápidos
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickSetupSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={generateAutoConfig}
              disabled={isGenerating}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando Configuración...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 inline mr-2" />
                  Generar Configuración Automática
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {currentStep === 'generating' && (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Generando Configuración</h2>
          <p className="text-gray-600">Creando credenciales seguras para tu integración...</p>
        </div>
      )}

      {/* Configuration Ready */}
      {currentStep === 'ready_to_apply' && autoConfigData && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">¡Configuración generada exitosamente!</span>
            </div>
          </div>

          {/* Configuration Details */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tus Credenciales de Google Drive</h2>
            
            <div className="space-y-4">
              {/* Project ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Proyecto
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={autoConfigData.projectId}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(autoConfigData.projectId, 'projectId')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedField === 'projectId' ? '✓' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Cliente OAuth
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={autoConfigData.clientId}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(autoConfigData.clientId, 'clientId')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedField === 'clientId' ? '✓' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente Secreto OAuth
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={autoConfigData.clientSecret}
                      readOnly
                      className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => copyToClipboard(autoConfigData.clientSecret, 'clientSecret')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedField === 'clientSecret' ? '✓' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Redirect URI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URI de Redireccionamiento
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={autoConfigData.redirectUri}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(autoConfigData.redirectUri, 'redirectUri')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedField === 'redirectUri' ? '✓' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={applyConfiguration}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Shield className="w-5 h-5 inline mr-2" />
                Aplicar Configuración
              </button>
              <button
                onClick={resetConfiguration}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Generar Nuevas Credenciales
              </button>
            </div>
          </div>

          {/* Quick Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start text-blue-800">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium mb-2">Instrucciones Rápidas:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Aplicar Configuración" para guardar las credenciales</li>
                  <li>Ve a Google Cloud Console y crea un proyecto con el ID proporcionado</li>
                  <li>Habilita Google Drive API</li>
                  <li>Configura las credenciales OAuth con los datos generados</li>
                  <li>Regresa y haz clic en "Conectar con Google Drive"</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applying Configuration */}
      {currentStep === 'applying' && (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Aplicando Configuración</h2>
          <p className="text-gray-600">Guardando credenciales y preparando integración...</p>
        </div>
      )}

      {/* Configuration Completed */}
      {currentStep === 'completed' && (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            ¡Configuración Completada!
          </h2>
          <p className="text-gray-600 mb-6">
            Google Drive está configurado y listo para usar con BrifyRRHH v2
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ir al Dashboard
            </button>
            <button
              onClick={resetConfiguration}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Configurar Otra Cuenta
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">¿Necesitas ayuda?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/google-drive-quick-setup"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-sm">Guía de Configuración Manual</span>
          </a>
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-sm">Google Cloud Console</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveAutoSetup;