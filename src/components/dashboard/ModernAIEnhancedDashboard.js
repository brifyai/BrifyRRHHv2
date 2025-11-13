import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  DocumentTextIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import DashboardChart from '../charts/DashboardChart.js';
import AIRecommendations from './AIRecommendations.js';
import aiRecommendationsService from '../../services/aiRecommendationsService.js';
import organizedDatabaseService from '../../services/organizedDatabaseService.js';

const ModernAIEnhancedDashboard = ({ dashboardStats, loading = false }) => {
  const [trendData, setTrendData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const generateMockTrendData = useCallback(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Carpetas',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 750),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Documentos',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 200) + 800),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Tokens Usados',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 40000),
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          tension: 0.4
        }
      ]
    };
  }, [selectedTimeRange]);

  const generateMockPredictions = useCallback(() => {
    // Validación segura de dashboardStats
    const safeFolders = dashboardStats?.folders || 800;
    const safeDocuments = dashboardStats?.documents || 1000;
    const safeTokens = dashboardStats?.tokensUsed || 50000;
    const safeStorage = dashboardStats?.storageUsed || 10000;

    return {
      nextMonth: {
        folders: Math.floor(safeFolders * 1.1),
        documents: Math.floor(safeDocuments * 1.15),
        tokens: Math.floor(safeTokens * 1.2),
        storage: Math.floor(safeStorage * 1.25)
      },
      insights: [
        'El crecimiento de carpetas se mantendrá estable (+10%)',
        'El uso de documentos aumentará significativamente (+15%)',
        'Se recomienda optimizar el uso de tokens para el próximo mes'
      ]
    };
  }, [dashboardStats]);

  const loadTrendData = useCallback(async () => {
    if (!dashboardStats) return;
    
    try {
      const data = await aiRecommendationsService.getTrendPredictions(dashboardStats, selectedTimeRange);
      setTrendData(data);
    } catch (error) {
      console.error('Error loading trend data:', error);
      // Datos de respaldo
      setTrendData(generateMockTrendData());
    }
  }, [dashboardStats, selectedTimeRange, generateMockTrendData]);

  const loadPredictions = useCallback(async () => {
    if (!dashboardStats) return;
    
    try {
      const data = await aiRecommendationsService.getProductivityRecommendations(dashboardStats);
      setPredictions(data);
    } catch (error) {
      console.error('Error loading predictions:', error);
      // Predicciones de respaldo
      setPredictions(generateMockPredictions());
    }
  }, [dashboardStats, generateMockPredictions]);

  useEffect(() => {
    if (dashboardStats) {
      loadTrendData();
      loadPredictions();
    }
  }, [dashboardStats, selectedTimeRange, loadTrendData, loadPredictions]);


  const chartData = useMemo(() => {
    if (!trendData) return null;

    return {
      labels: trendData.labels,
      datasets: trendData.datasets
    };
  }, [trendData]);

  const pieData = useMemo(() => {
    // Validación segura de dashboardStats
    if (!dashboardStats || typeof dashboardStats !== 'object') {
      return null;
    }

    // Valores seguros con fallbacks
    const safeFolders = dashboardStats.folders || 800;
    const safeDocuments = dashboardStats.documents || 1000;
    const safeTokens = dashboardStats.tokensUsed || 50000;
    const safeStorage = dashboardStats.storageUsed || 10000;

    return {
      labels: ['Carpetas', 'Documentos', 'Tokens Usados', 'Almacenamiento'],
      datasets: [
        {
          data: [
            safeFolders,
            safeDocuments,
            Math.floor(safeTokens / 100), // Escalar para visualización
            Math.floor(safeStorage / 10) // Escalar para visualización
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(251, 146, 60)',
            'rgb(147, 51, 234)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [dashboardStats]);

  const radarData = useMemo(() => {
    // Validación segura de dashboardStats y predictions
    if (!dashboardStats || typeof dashboardStats !== 'object' ||
        !predictions || typeof predictions !== 'object' || !predictions.nextMonth) {
      return null;
    }

    // Valores seguros con fallbacks
    const currentFolders = dashboardStats.folders || 800;
    const currentDocuments = dashboardStats.documents || 1000;
    const currentTokens = dashboardStats.tokensUsed || 50000;
    const currentStorage = dashboardStats.storageUsed || 10000;

    const predictedFolders = predictions.nextMonth.folders || currentFolders * 1.1;
    const predictedDocuments = predictions.nextMonth.documents || currentDocuments * 1.15;
    const predictedTokens = predictions.nextMonth.tokens || currentTokens * 1.2;
    const predictedStorage = predictions.nextMonth.storage || currentStorage * 1.25;

    return {
      labels: ['Carpetas', 'Documentos', 'Tokens', 'Almacenamiento', 'Eficiencia'],
      datasets: [
        {
          label: 'Actual',
          data: [
            currentFolders / 10,
            currentDocuments / 20,
            currentTokens / 1000,
            currentStorage / 200,
            75
          ],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
        },
        {
          label: 'Predicción',
          data: [
            predictedFolders / 10,
            predictedDocuments / 20,
            predictedTokens / 1000,
            predictedStorage / 200,
            85
          ],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
        }
      ]
    };
  }, [dashboardStats, predictions]);

  const handleRecommendationClick = (recommendation) => {
    console.log('Recomendación seleccionada:', recommendation);
    // Aquí puedes implementar la lógica para manejar las recomendaciones
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel Principal Mejorado con IA
          </h1>
          <p className="text-gray-600">
            Análisis inteligente y recomendaciones personalizadas para tu negocio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carpetas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.folders?.toLocaleString() || '800'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
                  +{predictions && predictions.nextMonth && dashboardStats?.folders && dashboardStats.folders > 0 ? Math.round(((predictions.nextMonth.folders - dashboardStats.folders) / dashboardStats.folders) * 100) : 10}% pronosticado
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FolderIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.documents?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
                  +{predictions && predictions.nextMonth && dashboardStats?.documents && dashboardStats.documents > 0 ? Math.round(((predictions.nextMonth.documents - dashboardStats.documents) / dashboardStats.documents) * 100) : 15}% pronosticado
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tokens Usados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.tokensUsed?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
                  +{predictions && predictions.nextMonth && dashboardStats?.tokensUsed && dashboardStats.tokensUsed > 0 ? Math.round(((predictions.nextMonth.tokens - dashboardStats.tokensUsed) / dashboardStats.tokensUsed) * 100) : 20}% pronosticado
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <CpuChipIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Almacenamiento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.storageUsed?.toLocaleString() || '0'} MB
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  <CloudArrowUpIcon className="w-3 h-3 inline mr-1" />
                  {Math.round((dashboardStats?.storageUsed || 0) / 1024)} GB usados
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CloudArrowUpIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tendencias y Pronósticos</h3>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </select>
              </div>
              {chartData && (
                <DashboardChart
                  type="line"
                  data={chartData}
                  height={300}
                />
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Recursos</h3>
              {pieData && (
                <DashboardChart
                  type="doughnut"
                  data={pieData}
                  height={300}
                />
              )}
            </div>
          </div>
        </div>

        {/* Radar Chart and AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Comparativo</h3>
              {radarData && (
                <DashboardChart
                  type="radar"
                  data={radarData}
                  height={350}
                />
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <AIRecommendations
              dashboardStats={dashboardStats}
              onRecommendationClick={handleRecommendationClick}
            />
          </div>
        </div>

        {/* Predictions Summary */}
        {predictions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6"
          >
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Pronósticos Inteligentes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Carpetas próximas</p>
                <p className="text-xl font-bold text-blue-600">
                  {(predictions.nextMonth?.folders || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Documentos próximas</p>
                <p className="text-xl font-bold text-green-600">
                  {(predictions.nextMonth?.documents || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Tokens próximas</p>
                <p className="text-xl font-bold text-orange-600">
                  {(predictions.nextMonth?.tokens || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Almacenamiento próximas</p>
                <p className="text-xl font-bold text-purple-600">
                  {(predictions.nextMonth?.storage || 0).toLocaleString()} MB
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {predictions.insights && Array.isArray(predictions.insights) && predictions.insights.map((insight, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <ChartBarIcon className="w-4 h-4 text-blue-500 mr-2" />
                  {insight}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ModernAIEnhancedDashboard;