import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import aiRecommendationsService from '../../services/aiRecommendationsService.js';

const AIRecommendations = ({ dashboardStats, onRecommendationClick }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (dashboardStats) {
      loadRecommendations();
    }
  }, [dashboardStats]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const recs = await aiRecommendationsService.getDashboardRecommendations(dashboardStats);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
      setError('No se pudieron cargar las recomendaciones de IA');
      
      // Recomendaciones de respaldo si falla la API
      setRecommendations(getFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRecommendations = () => {
    if (!dashboardStats) return [];
    
    const recs = [];
    
    // Recomendaciones basadas en estadísticas simples
    if (dashboardStats.folders > 500) {
      recs.push({
        type: 'optimization',
        title: 'Optimización de Carpetas',
        description: 'Tienes muchas carpetas. Considera organizarlas por departamentos para mejorar la eficiencia.',
        priority: 'medium',
        action: 'organize_folders'
      });
    }
    
    if (dashboardStats.documents > 1000) {
      recs.push({
        type: 'storage',
        title: 'Gestión de Almacenamiento',
        description: 'Tu almacenamiento está creciendo rápidamente. Revisa archivos antiguos para liberar espacio.',
        priority: 'high',
        action: 'cleanup_storage'
      });
    }
    
    if (dashboardStats.tokensUsed > 50000) {
      recs.push({
        type: 'usage',
        title: 'Uso de Tokens',
        description: 'Estás usando muchos tokens. Considera optimizar las consultas o actualizar tu plan.',
        priority: 'medium',
        action: 'optimize_tokens'
      });
    }
    
    return recs;
  };

  const dismissRecommendation = (id) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'optimization':
        return <ChartBarIcon className="w-5 h-5 text-blue-500" />;
      case 'storage':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'usage':
        return <LightBulbIcon className="w-5 h-5 text-purple-500" />;
      case 'insight':
        return <SparklesIcon className="w-5 h-5 text-green-500" />;
      default:
        return <LightBulbIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleRecommendationClick = (recommendation) => {
    if (onRecommendationClick) {
      onRecommendationClick(recommendation);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Generando recomendaciones con IA...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const visibleRecommendations = recommendations.filter(rec => !dismissed.has(rec.id));

  if (visibleRecommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 text-gray-500">
          <CheckCircleIcon className="w-5 h-5" />
          <span>No hay recomendaciones nuevas en este momento</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recomendaciones de IA</h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {visibleRecommendations.length}
        </span>
      </div>
      
      <AnimatePresence>
        {visibleRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getPriorityColor(recommendation.priority)}`}
            onClick={() => handleRecommendationClick(recommendation)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getRecommendationIcon(recommendation.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {recommendation.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {recommendation.description}
                  </p>
                  {recommendation.action && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver detalles →
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissRecommendation(recommendation.id || index);
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {recommendations.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadRecommendations}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Actualizar recomendaciones</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;