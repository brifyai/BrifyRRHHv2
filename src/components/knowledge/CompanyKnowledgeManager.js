/**
 * Componente de Gestión de Base de Conocimiento Empresarial
 * 
 * Este componente permite:
 * - Ver el estado de la base de conocimiento
 * - Sincronizar documentos con Google Drive
 * - Buscar en la base de conocimiento vectorizada
 * - Gestionar categorías y FAQs
 * - Ver estadísticas de uso
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  RefreshIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient.js';
import companyKnowledgeService from '../../services/companyKnowledgeService.js';
import toast from 'react-hot-toast';

const CompanyKnowledgeManager = ({ companyId, companyName }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Estados de la base de conocimiento
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [stats, setStats] = useState({
    documents: 0,
    faqs: 0,
    categories: 0,
    chunks: 0,
    lastSync: null
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      loadKnowledgeData();
    }
  }, [companyId]);

  const loadKnowledgeData = async () => {
    try {
      setLoading(true);
      
      const [
        kbData,
        statsData,
        recentDocs,
        logsData
      ] = await Promise.all([
        loadKnowledgeBase(),
        loadStats(),
        loadRecentDocuments(),
        loadSyncLogs()
      ]);

      setKnowledgeBase(kbData);
      setStats(statsData);
      setRecentDocuments(recentDocs);
      setSyncLogs(logsData);

    } catch (error) {
      console.error('Error cargando datos de conocimiento:', error);
      toast.error('Error al cargar datos de la base de conocimiento');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('company_knowledge_bases')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error cargando base de conocimiento:', error);
      return null;
    }
  };

  const loadStats = async () => {
    try {
      return await companyKnowledgeService.getKnowledgeStats(companyId);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      return {
        documents: 0,
        faqs: 0,
        categories: 0,
        chunks: 0,
        lastUpdated: null
      };
    }
  };

  const loadRecentDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select(`
          id,
          title,
          description,
          file_type,
          folder_type,
          created_at,
          knowledge_categories(name)
        `)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando documentos recientes:', error);
      return [];
    }
  };

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('drive_sync_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('started_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando logs de sincronización:', error);
      return [];
    }
  };

  const handleSyncWithDrive = async () => {
    try {
      setSyncing(true);
      toast.loading('Iniciando sincronización con Google Drive...');

      // Obtener el ID del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      const result = await companyKnowledgeService.syncAndVectorizeDocuments(
        companyId,
        user.id
      );

      toast.dismiss();
      
      if (result.success) {
        toast.success(`Sincronización completada: ${result.totalVectorized}/${result.totalProcessed} documentos procesados`);
        
        // Recargar datos
        await loadKnowledgeData();
      } else {
        toast.error('Error en la sincronización');
      }

    } catch (error) {
      toast.dismiss();
      console.error('Error en sincronización:', error);
      toast.error('Error al sincronizar con Google Drive');
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await companyKnowledgeService.searchKnowledge(companyId, searchQuery, {
        limit: 20,
        includeFAQs: true,
        includeDocuments: true
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar en la base de conocimiento');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Base de Conocimiento - {companyName}
              </h1>
              <p className="text-gray-600">
                Gestiona documentos, FAQs y búsqueda semántica
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {knowledgeBase && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(knowledgeBase.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(knowledgeBase.status)}`}>
                  {knowledgeBase.status === 'active' ? 'Activa' : 
                   knowledgeBase.status === 'syncing' ? 'Sincronizando' : 'Error'}
                </span>
              </div>
            )}
            
            <button
              onClick={handleSyncWithDrive}
              disabled={syncing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar con Drive'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.documents}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">FAQs</p>
              <p className="text-2xl font-bold text-green-600">{stats.faqs}</p>
            </div>
            <BookOpenIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
            </div>
            <FolderIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chunks</p>
              <p className="text-2xl font-bold text-orange-600">{stats.chunks}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en documentos y FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Resultados ({searchResults.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          result.type === 'document' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {result.type === 'document' ? 'Documento' : 'FAQ'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Relevancia: {(result.relevance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mt-1">
                        {result.type === 'document' ? result.title : result.question}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {result.type === 'document' ? result.description : result.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Resumen', icon: ChartBarIcon },
              { id: 'documents', name: 'Documentos', icon: DocumentTextIcon },
              { id: 'sync', name: 'Sincronización', icon: RefreshIcon },
              { id: 'settings', name: 'Configuración', icon: Cog6ToothIcon }
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                {knowledgeBase ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(knowledgeBase.status)}
                        <span className="text-sm text-gray-900">
                          {knowledgeBase.status === 'active' ? 'Activa' : 
                           knowledgeBase.status === 'syncing' ? 'Sincronizando' : 'Con errores'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última sincronización</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(knowledgeBase.last_sync_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Carpeta de Drive</label>
                      <a 
                        href={knowledgeBase.drive_folder_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                      >
                        Abrir en Google Drive
                      </a>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID de Carpeta</label>
                      <p className="text-sm text-gray-900 mt-1 font-mono">
                        {knowledgeBase.drive_folder_id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay una base de conocimiento configurada para esta empresa.</p>
                    <p className="text-sm mt-2">La base de conocimiento se crea automáticamente al registrar una empresa con Google Drive configurado.</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos Recientes</h3>
                {recentDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            <p className="text-sm text-gray-500">
                              {doc.knowledge_categories?.name || 'Sin categoría'} • {doc.file_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(doc.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay documentos recientes</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Todos los Documentos</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <PlusIcon className="h-5 w-5" />
                  <span>Subir Documento</span>
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>La gestión completa de documentos estará disponible próximamente.</p>
                <p className="text-sm mt-2">Puedes sincronizar documentos desde Google Drive usando el botón "Sincronizar con Drive".</p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Sincronización</h3>
                {syncLogs.length > 0 ? (
                  <div className="space-y-3">
                    {syncLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span className="font-medium text-gray-900">
                              {log.status === 'completed' ? 'Completada' :
                               log.status === 'running' ? 'En progreso' :
                               log.status === 'failed' ? 'Fallida' : 'Cancelada'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {log.sync_type === 'full' ? 'Completa' : 'Incremental'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(log.started_at)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Procesados:</span>
                            <span className="ml-2 font-medium">{log.files_processed}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Creados:</span>
                            <span className="ml-2 font-medium text-green-600">{log.files_created}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Actualizados:</span>
                            <span className="ml-2 font-medium text-blue-600">{log.files_updated}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Errores:</span>
                            <span className="ml-2 font-medium text-red-600">{log.errors_count}</span>
                          </div>
                        </div>

                        {log.duration_seconds && (
                          <div className="mt-2 text-sm text-gray-500">
                            Duración: {log.duration_seconds} segundos
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay historial de sincronización</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de IA</h3>
                <div className="text-center py-8 text-gray-500">
                  <Cog6ToothIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>La configuración avanzada de IA estará disponible próximamente.</p>
                  <p className="text-sm mt-2">Podrás configurar modelos de embeddings, umbrales de similitud y más.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyKnowledgeManager;