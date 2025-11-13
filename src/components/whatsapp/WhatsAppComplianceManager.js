import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase.js';
import whatsappComplianceService from '../../services/whatsappComplianceService';

/**
 * Componente para gestionar el cumplimiento de políticas de WhatsApp Business
 * 
 * Este componente permite:
 * - Gestionar consentimientos de usuarios
 * - Monitorear calidad de números
 * - Verificar estado de cumplimiento
 * - Gestionar plantillas aprobadas
 * - Visualizar reportes de cumplimiento
 */
const WhatsAppComplianceManager = ({ companyId }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consent');
  const [consents, setConsents] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConsents: 0,
    expiredConsents: 0,
    qualityScore: 0,
    messagesToday: 0,
    blockedMessages: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      loadComplianceData();
    }
  }, [companyId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [
        consentsData,
        qualityData,
        statusData,
        templatesData,
        violationsData,
        statsData
      ] = await Promise.all([
        loadUserConsents(),
        loadQualityMetrics(),
        loadComplianceStatus(),
        loadTemplates(),
        loadViolations(),
        loadStats()
      ]);

      setConsents(consentsData);
      setQualityMetrics(qualityData);
      setComplianceStatus(statusData);
      setTemplates(templatesData);
      setViolations(violationsData);
      setStats(statsData);

    } catch (error) {
      console.error('Error cargando datos de cumplimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select(`
          *,
          users:user_id (name, email)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando consentimientos:', error);
      return [];
    }
  };

  const loadQualityMetrics = async () => {
    try {
      const metrics = await whatsappComplianceService.getQualityMetrics(companyId);
      return metrics;
    } catch (error) {
      console.error('Error cargando métricas de calidad:', error);
      return null;
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const status = await whatsappComplianceService.getComplianceStatus(companyId);
      return status;
    } catch (error) {
      console.error('Error cargando estado de cumplimiento:', error);
      return null;
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      return [];
    }
  };

  const loadViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_logs')
        .select('*')
        .eq('company_id', companyId)
        .eq('event_type', 'policy_violation')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando violaciones:', error);
      return [];
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Cargar estadísticas
      const [
        totalUsers,
        activeConsents,
        expiredConsents,
        messagesToday,
        blockedMessages
      ] = await Promise.all([
        supabase.from('user_consent').select('id', { count: 'exact' }).eq('company_id', companyId),
        supabase.from('user_consent').select('id', { count: 'exact' }).eq('company_id', companyId).eq('status', 'active'),
        supabase.from('user_consent').select('id', { count: 'exact' }).eq('company_id', companyId).eq('status', 'expired'),
        supabase.from('whatsapp_logs').select('id', { count: 'exact' }).eq('company_id', companyId).gte('created_at', today),
        supabase.from('compliance_logs').select('id', { count: 'exact' }).eq('company_id', companyId).eq('event_type', 'message_blocked').gte('created_at', today)
      ]);

      const qualityScore = qualityMetrics?.currentScore || 0;

      return {
        totalUsers: totalUsers.count || 0,
        activeConsents: activeConsents.count || 0,
        expiredConsents: expiredConsents.count || 0,
        qualityScore,
        messagesToday: messagesToday.count || 0,
        blockedMessages: blockedMessages.count || 0
      };
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      return {
        totalUsers: 0,
        activeConsents: 0,
        expiredConsents: 0,
        qualityScore: 0,
        messagesToday: 0,
        blockedMessages: 0
      };
    }
  };

  const handleRevokeConsent = async (consentId) => {
    try {
      const { error } = await supabase
        .from('user_consent')
        .update({ 
          status: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('id', consentId);

      if (error) throw error;

      // Recargar datos
      await loadComplianceData();
      
      // Registrar evento
      await whatsappComplianceService.logComplianceEvent({
        companyId,
        eventType: 'consent_revoked',
        details: { consentId }
      });

    } catch (error) {
      console.error('Error revocando consentimiento:', error);
    }
  };

  const handleRenewConsent = async (consentId) => {
    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2 años

      const { error } = await supabase
        .from('user_consent')
        .update({ 
          status: 'active',
          expires_at: expiresAt.toISOString(),
          renewed_at: new Date().toISOString()
        })
        .eq('id', consentId);

      if (error) throw error;

      // Recargar datos
      await loadComplianceData();
      
      // Registrar evento
      await whatsappComplianceService.logComplianceEvent({
        companyId,
        eventType: 'consent_renewed',
        details: { consentId }
      });

    } catch (error) {
      console.error('Error renovando consentimiento:', error);
    }
  };

  const getQualityColor = (score) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 90) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityLabel = (score) => {
    if (score >= 95) return 'Excelente';
    if (score >= 90) return 'Bueno';
    if (score >= 80) return 'Regular';
    return 'Crítico';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centro de Cumplimiento</h1>
              <p className="text-gray-600">Gestión de políticas de WhatsApp Business</p>
            </div>
          </div>
          
          {complianceStatus && (
            <div className={`px-4 py-2 rounded-full ${getQualityColor(complianceStatus.overallScore)}`}>
              <span className="font-medium">
                {getQualityLabel(complianceStatus.overallScore)} ({complianceStatus.overallScore.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consentimientos Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeConsents}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consentimientos Expirados</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiredConsents}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calidad del Número</p>
              <p className={`text-2xl font-bold ${stats.qualityScore >= 95 ? 'text-green-600' : stats.qualityScore >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats.qualityScore.toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensajes Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{stats.messagesToday}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensajes Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.blockedMessages}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'consent', name: 'Consentimientos', icon: UserGroupIcon },
              { id: 'quality', name: 'Calidad', icon: ChartBarIcon },
              { id: 'templates', name: 'Plantillas', icon: DocumentTextIcon },
              { id: 'violations', name: 'Violaciones', icon: ExclamationTriangleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'consent' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Consentimientos</h3>
              
              {consents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay consentimientos registrados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Consentimiento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expira
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consents.map((consent) => (
                        <tr key={consent.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {consent.users?.name || 'Usuario'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {consent.users?.email || consent.user_phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              consent.status === 'active' ? 'bg-green-100 text-green-800' :
                              consent.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {consent.status === 'active' ? 'Activo' :
                               consent.status === 'expired' ? 'Expirado' : 'Revocado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(consent.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(consent.expires_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {consent.status === 'active' && (
                              <button
                                onClick={() => handleRevokeConsent(consent.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Revocar
                              </button>
                            )}
                            {consent.status === 'expired' && (
                              <button
                                onClick={() => handleRenewConsent(consent.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Renovar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Métricas de Calidad</h3>
              
              {qualityMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Estado Actual</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Puntuación de Calidad:</span>
                        <span className={`font-medium ${qualityMetrics.currentScore >= 95 ? 'text-green-600' : qualityMetrics.currentScore >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {qualityMetrics.currentScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className={`font-medium ${getQualityColor(qualityMetrics.currentScore).split(' ')[0]}`}>
                          {getQualityLabel(qualityMetrics.currentScore)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mensajes Enviados:</span>
                        <span className="font-medium">{qualityMetrics.messagesSent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tasa de Respuesta:</span>
                        <span className="font-medium">{qualityMetrics.responseRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Límites Dinámicos</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Límite Diario:</span>
                        <span className="font-medium">{qualityMetrics.dynamicLimits?.dailyLimit || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Límite Por Hora:</span>
                        <span className="font-medium">{qualityMetrics.dynamicLimits?.hourlyLimit || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mensajes Usados Hoy:</span>
                        <span className="font-medium">{qualityMetrics.messagesToday || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Disponibles Hoy:</span>
                        <span className="font-medium text-green-600">
                          {(qualityMetrics.dynamicLimits?.dailyLimit || 0) - (qualityMetrics.messagesToday || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay métricas de calidad disponibles
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Plantillas Aprobadas</h3>
              
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay plantillas aprobadas
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Aprobado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                      <div className="text-xs text-gray-500">
                        <div>Categoría: {template.category}</div>
                        <div>Idioma: {template.language}</div>
                        <div>Creado: {new Date(template.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Violaciones de Políticas</h3>
              
              {violations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay violaciones registradas
                </div>
              ) : (
                <div className="space-y-3">
                  {violations.map((violation) => (
                    <div key={violation.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-red-900">
                              {violation.details?.violation_type || 'Violación de Política'}
                            </h4>
                            <span className="text-sm text-red-600">
                              {new Date(violation.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-red-800">
                            {violation.details?.description || violation.details?.reason || 'Sin descripción'}
                          </p>
                          {violation.details?.user_phone && (
                            <p className="text-xs text-red-600 mt-1">
                              Usuario: {violation.details.user_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppComplianceManager;