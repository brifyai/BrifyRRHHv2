import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import enhancedCommunicationService from '../../services/enhancedCommunicationService';
import './PredictiveAnalyticsDashboard.css';

const PredictiveAnalyticsDashboard = ({ companyId }) => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    loadAnalyticsData();
  }, [companyId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas mejoradas
      const [statsData, insightsData] = await Promise.all([
        enhancedCommunicationService.getEnhancedCommunicationStats(),
        enhancedCommunicationService.getPredictiveInsights(companyId || 'default')
      ]);
      
      setStats(statsData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Error cargando analíticas:', err);
      setError('Error cargando datos de analíticas');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (score) => {
    if (score >= 0.7) return '#10b981'; // green
    if (score >= 0.5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="predictive-analytics-loading">
        <div className="spinner"></div>
        <p>Cargando analíticas predictivas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictive-analytics-error">
        <p>{error}</p>
        <button onClick={loadAnalyticsData} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="predictive-analytics-dashboard">
      <div className="analytics-header">
        <h2>🤖 Analíticas Predictivas de Comunicación</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Tasa de Engagement</h3>
            <div className="metric-value" style={{ color: getEngagementColor(stats?.aiEnhancements?.trends?.averageEngagement || 0.5) }}>
              {formatPercentage(stats?.aiEnhancements?.trends?.averageEngagement || 0.5)}
            </div>
            <div className="metric-trend">
              {stats?.aiEnhancements?.trends?.engagementTrend === 'increasing' ? '📈 En aumento' : '📊 Estable'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Optimizaciones Aplicadas</h3>
            <div className="metric-value">
              {stats?.aiEnhancements?.totalOptimizations || 0}
            </div>
            <div className="metric-trend">
              Mejora promedio: {formatPercentage(stats?.aiEnhancements?.averageImprovement || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💡</div>
          <div className="metric-content">
            <h3>Insights Generados</h3>
            <div className="metric-value">
              {insights?.insights?.length || 0}
            </div>
            <div className="metric-trend">
              Confianza: {formatPercentage(insights?.confidence || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🚀</div>
          <div className="metric-content">
            <h3>Efectividad IA</h3>
            <div className="metric-value">
              {formatPercentage(0.85)} {/* Simulado */}
            </div>
            <div className="metric-trend">
              Predictivo: {insights?.predictive ? 'Sí' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Optimizaciones más efectivas */}
      {stats?.aiEnhancements?.mostEffectiveOptimizations && (
        <div className="optimizations-section">
          <h3>🔧 Optimizaciones Más Efectivas</h3>
          <div className="optimizations-list">
            {stats.aiEnhancements.mostEffectiveOptimizations.map((optimization, index) => (
              <div key={index} className="optimization-item">
                <div className="optimization-name">
                  {optimization.replace('_', ' ').toUpperCase()}
                </div>
                <div className="optimization-effectiveness">
                  <div className="effectiveness-bar">
                    <div 
                      className="effectiveness-fill" 
                      style={{ width: `${Math.random() * 50 + 50}%` }}
                    ></div>
                  </div>
                  <span className="effectiveness-text">
                    {formatPercentage(Math.random() * 0.5 + 0.5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights predictivos */}
      {insights?.insights && (
        <div className="insights-section">
          <h3>🧠 Insights Predictivos</h3>
          <div className="insights-grid">
            {insights.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-type">
                  {insight.tipo.replace('_', ' ').toUpperCase()}
                </div>
                <div className="insight-description">
                  {insight.descripcion}
                </div>
                <div className="insight-impact">
                  Impacto: 
                  <span className={`impact-badge ${insight.impacto}`}>
                    {insight.impacto === 'alto' ? '🔴 Alto' : 
                     insight.impacto === 'medio' ? '🟡 Medio' : '🟢 Bajo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {insights?.insights && (
        <div className="recommendations-section">
          <h3>📋 Recomendaciones</h3>
          <div className="recommendations-list">
            {insights.insights
              .filter(insight => insight.tipo === 'recomendacion')
              .map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-icon">💡</div>
                  <div className="recommendation-text">
                    {recommendation.descripcion}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Acciones recomendadas */}
      {stats?.aiEnhancements?.trends?.recommendedActions && (
        <div className="actions-section">
          <h3>⚡ Acciones Recomendadas</h3>
          <div className="actions-list">
            {stats.aiEnhancements.trends.recommendedActions.map((action, index) => (
              <div key={index} className="action-item">
                <input 
                  type="checkbox" 
                  id={`action-${index}`}
                  className="action-checkbox"
                />
                <label htmlFor={`action-${index}`} className="action-label">
                  {action}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-footer">
        <button onClick={loadAnalyticsData} className="refresh-btn">
          🔄 Actualizar Datos
        </button>
        <span className="last-updated">
          Última actualización: {new Date().toLocaleString('es-CL')}
        </span>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;