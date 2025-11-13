import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChartBarIcon,
  GiftIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  HeartIcon
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import gamificationService from '../../services/gamificationService.js';
import { useAuth } from '../../contexts/AuthContext.js';

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

const GamificationDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos principales de gamificación
      const gamificationResult = await gamificationService.getEmployeeGamification(
        user.id, 
        user.employee_id
      );
      
      if (gamificationResult.success) {
        setGamificationData(gamificationResult.data);
        setAchievements(gamificationResult.data.achievements || []);
      }

      // Cargar datos adicionales en paralelo
      const [leaderboardResult, rewardsResult, predictionsResult, eventsResult] = await Promise.all([
        gamificationService.getLeaderboard('weekly', 'points', 10),
        gamificationService.getAvailableRewards(),
        gamificationService.getEngagementPredictions(user.id, user.employee_id, 7),
        gamificationService.getGamificationEvents(user.id, user.employee_id, 10)
      ]);

      if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);
      if (rewardsResult.success) setRewards(rewardsResult.data);
      if (predictionsResult.success) setPredictions(predictionsResult.data);
      if (eventsResult.success) setEvents(eventsResult.data);

    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Error al cargar datos de gamificación');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      setSelectedReward(reward);
      setShowRewardModal(true);
    } catch (error) {
      console.error('Error preparing reward redemption:', error);
      toast.error('Error al preparar canje de recompensa');
    }
  };

  const confirmRedeemReward = async () => {
    try {
      const result = await gamificationService.redeemReward(
        user.id,
        user.employee_id,
        selectedReward.id
      );

      if (result.success) {
        toast.success(`¡Has canjeado ${selectedReward.name}!`);
        setShowRewardModal(false);
        setSelectedReward(null);
        loadGamificationData(); // Recargar datos
      } else {
        toast.error(result.error || 'Error al canjear recompensa');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Error al canjear recompensa');
    }
  };

  const generateEngagementPrediction = async () => {
    try {
      const result = await gamificationService.generateEngagementPrediction(
        user.id,
        user.employee_id
      );

      if (result.success) {
        toast.success('Predicción de engagement generada');
        setPredictions(prev => [result.data, ...prev]);
      } else {
        toast.error('Error al generar predicción');
      }
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Error al generar predicción');
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'diamond': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Datos para gráficos
  const engagementChartData = {
    labels: predictions.slice(0, 7).map(p => new Date(p.prediction_date).toLocaleDateString('es-ES', { day: 'short', month: 'short' })),
    datasets: [{
      label: 'Score de Engagement',
      data: predictions.slice(0, 7).map(p => p.predicted_engagement_score),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const achievementsByCategory = {
    communication: achievements.filter(a => a.category === 'communication').length,
    engagement: achievements.filter(a => a.category === 'engagement').length,
    learning: achievements.filter(a => a.category === 'learning').length,
    collaboration: achievements.filter(a => a.category === 'collaboration').length,
  };

  const categoryChartData = {
    labels: ['Comunicación', 'Engagement', 'Aprendizaje', 'Colaboración'],
    datasets: [{
      data: [
        achievementsByCategory.communication,
        achievementsByCategory.engagement,
        achievementsByCategory.learning,
        achievementsByCategory.collaboration
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderWidth: 0,
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Cargando gamificación...</p>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay datos de gamificación disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Centro de Gamificación</h1>
                <p className="text-indigo-100 text-lg">Tu progreso y logros en la plataforma</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{gamificationData.total_points || 0}</div>
                <div className="text-indigo-100">Puntos Totales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex space-x-2">
          {[
            { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
            { id: 'achievements', label: 'Logros', icon: TrophyIcon },
            { id: 'leaderboard', label: 'Clasificación', icon: UserGroupIcon },
            { id: 'rewards', label: 'Recompensas', icon: GiftIcon },
            { id: 'predictions', label: 'Predicciones', icon: ArrowTrendingUpIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Nivel Actual</p>
                    <p className="text-3xl font-bold">{gamificationData.current_level || 1}</p>
                    <p className="text-blue-100 text-xs mt-1">{gamificationData.gamification_levels?.name || 'Novato'}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <RocketLaunchIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Racha Actual</p>
                    <p className="text-3xl font-bold">{gamificationData.streak_days || 0}</p>
                    <p className="text-green-100 text-xs mt-1">días consecutivos</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FireIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Logros</p>
                    <p className="text-3xl font-bold">{achievements.length}</p>
                    <p className="text-purple-100 text-xs mt-1">desbloqueados</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <TrophyIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Engagement</p>
                    <p className="text-3xl font-bold">{Math.round(gamificationData.engagement_score || 0)}%</p>
                    <p className="text-orange-100 text-xs mt-1">score actual</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <HeartIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Level Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Progreso al Siguiente Nivel</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Nivel {gamificationData.current_level || 1}</span>
                      <span>Nivel {(gamificationData.current_level || 1) + 1}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, ((gamificationData.current_level_points || 0) / 100) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {gamificationData.current_level_points || 0} / 100 puntos para el siguiente nivel
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Logros por Categoría</h3>
                <div className="h-64">
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eventos Recientes</h3>
              <div className="space-y-3">
                {events.length > 0 ? (
                  events.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          {event.event_type === 'level_up' && <RocketLaunchIcon className="h-5 w-5 text-indigo-600" />}
                          {event.event_type === 'achievement_unlocked' && <TrophyIcon className="h-5 w-5 text-indigo-600" />}
                          {event.event_type === 'streak_milestone' && <FireIcon className="h-5 w-5 text-indigo-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.event_type === 'level_up' && '¡Nuevo nivel alcanzado!'}
                            {event.event_type === 'achievement_unlocked' && '¡Logro desbloqueado!'}
                            {event.event_type === 'streak_milestone' && '¡Hito de racha alcanzado!'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.created_at).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay eventos recientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tus Logros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.length > 0 ? (
                  achievements.map(achievement => (
                    <div key={achievement.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{achievement.icon}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(achievement.badge_type)}`}>
                          {achievement.badge_type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-600">+{achievement.points_reward} pts</span>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes logros desbloqueados aún</p>
                    <p className="text-sm text-gray-400 mt-2">¡Sigue participando para desbloquear tu primer logro!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tabla de Clasificación Semanal</h3>
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.user_id === user.id;
                    return (
                      <div 
                        key={entry.id} 
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                          isCurrentUser 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {entry.companies?.name || 'Usuario'}
                              {isCurrentUser && ' (Tú)'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {entry.companies?.department} • {entry.companies?.position}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{entry.score}</p>
                          <p className="text-sm text-gray-600">puntos</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay datos de clasificación disponibles</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Recompensas Disponibles</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tus puntos</p>
                  <p className="text-2xl font-bold text-indigo-600">{gamificationData.total_points || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map(reward => (
                  <div key={reward.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-4 text-center">{reward.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-2">{reward.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-indigo-600">{reward.cost_points} pts</span>
                      {reward.availability_limit !== null && (
                        <span className="text-sm text-gray-500">
                          {reward.availability_limit} disponibles
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={(gamificationData.total_points || 0) < reward.cost_points}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        (gamificationData.total_points || 0) >= reward.cost_points
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Canjear
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Análisis Predictivo de Engagement</h3>
                <button
                  onClick={generateEngagementPrediction}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Generar Nueva Predicción
                </button>
              </div>

              {/* Engagement Chart */}
              {predictions.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Engagement</h4>
                  <div className="h-64">
                    <Line
                      data={engagementChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
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
              )}

              {/* Predictions List */}
              <div className="space-y-4">
                {predictions.length > 0 ? (
                  predictions.map(prediction => (
                    <div key={prediction.id} className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Predicción del {new Date(prediction.prediction_date).toLocaleDateString('es-ES')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Nivel de confianza: {prediction.confidence_level}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {Math.round(prediction.predicted_engagement_score)}%
                          </p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(prediction.risk_level)}`}>
                            {prediction.risk_level === 'low' && 'Bajo riesgo'}
                            {prediction.risk_level === 'medium' && 'Riesgo medio'}
                            {prediction.risk_level === 'high' && 'Alto riesgo'}
                            {prediction.risk_level === 'critical' && 'Riesgo crítico'}
                          </span>
                        </div>
                      </div>

                      {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Recomendaciones:</h5>
                          <ul className="space-y-1">
                            {prediction.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ArrowTrendingUpIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay predicciones disponibles</p>
                    <p className="text-sm text-gray-400 mt-2">Genera tu primera predicción para ver análisis de engagement</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reward Redemption Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confirmar Canje</h3>
              <button
                onClick={() => setShowRewardModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{selectedReward.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedReward.name}</h4>
              <p className="text-gray-600 mb-4">{selectedReward.description}</p>
              <div className="text-2xl font-bold text-indigo-600">{selectedReward.cost_points} puntos</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tus puntos actuales:</span>
                <span className="font-bold text-gray-900">{gamificationData.total_points || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Puntos después del canje:</span>
                <span className="font-bold text-indigo-600">
                  {(gamificationData.total_points || 0) - selectedReward.cost_points}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRewardModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRedeemReward}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Confirmar Canje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;