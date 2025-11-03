import React from 'react';
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
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const DashboardChart = ({ type, data, options, title, height = 300 }) => {
  // Validar que los datos existan y tengan la estructura correcta
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    console.warn('DashboardChart: Datos inválidos o incompletos', { type, data });
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div style={{ height: `${height}px` }} className="flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Cargando gráfico...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const chartOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    try {
      switch (type) {
        case 'line':
          return <Line data={data} options={chartOptions} />;
        case 'bar':
          return <Bar data={data} options={chartOptions} />;
        case 'doughnut':
          return <Doughnut data={data} options={chartOptions} />;
        case 'radar':
          return <Radar data={data} options={chartOptions} />;
        default:
          return <Line data={data} options={chartOptions} />;
      }
    } catch (error) {
      console.error('DashboardChart: Error al renderizar gráfico', error);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500 text-center">
            <p>Error al cargar gráfico</p>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default DashboardChart;