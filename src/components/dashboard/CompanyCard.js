import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuildingOfficeIcon, UsersIcon, PaperAirplaneIcon, EyeIcon, FaceSmileIcon, FaceFrownIcon, ExclamationTriangleIcon, ClockIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import databaseEmployeeService from '../../services/databaseEmployeeService';

// Estilos CSS para el efecto de flip
const flipStyles = `
  .flip-card {
    perspective: 1000px;
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
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }
`;

const CompanyCard = ({ company, isFlipped, onToggleFlip }) => {
  const navigate = useNavigate();
  const [scheduledMessages, setScheduledMessages] = useState(0);
  const [draftMessages, setDraftMessages] = useState(0);
  const [nextSendDate, setNextSendDate] = useState('');

  useEffect(() => {
    const loadCompanyMessageStats = async () => {
      try {
        const stats = await databaseEmployeeService.getCompanyMessageStats(company.id);
        setScheduledMessages(stats.scheduledMessages);
        setDraftMessages(stats.draftMessages);
        setNextSendDate(stats.nextSendDate);
      } catch (error) {
        console.error('Error loading company message stats:', error);
        setScheduledMessages(0);
        setDraftMessages(0);
        setNextSendDate('');
      }
    };

    loadCompanyMessageStats();
  }, [company.id]);
  return (
    <div
      className="group relative"
      style={{ animationDelay: `${Math.random() * 100}ms` }}
    >
      {/* Inyectar estilos CSS para flip effect */}
      <style dangerouslySetInnerHTML={{ __html: flipStyles }} />

      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div
        className={`flip-card cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={() => onToggleFlip(company.id)}
        style={{ height: '400px' }}
      >
        <div className="flip-card-inner">
          {/* Front of card */}
          <div className="flip-card-front relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-violet-50 p-5 min-h-[400px]">

            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0 flex-1 mr-2">
                <h4 className="font-bold text-gray-900 text-base overflow-hidden text-ellipsis whitespace-nowrap">{company.name}</h4>
                <p className="text-xs text-gray-500 mt-1">Datos Totales</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <ArrowPathIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" title="Haz clic para ver mensajes pendientes" />
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <BuildingOfficeIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Empleados */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <div className="p-1 rounded-md bg-blue-100 mr-2">
                    <UsersIcon className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Empleados</span>
                </div>
                <span className="text-base font-bold text-blue-700">{company.employeeCount}</span>
              </div>

              {/* Mensajes enviados */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                <div className="flex items-center">
                  <div className="p-1 rounded-md bg-emerald-100 mr-2">
                    <PaperAirplaneIcon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Enviados</span>
                </div>
                <span className="text-base font-bold text-emerald-700">{company.sentMessages}</span>
              </div>

              {/* Mensajes leídos */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <div className="p-1 rounded-md bg-purple-100 mr-2">
                    <EyeIcon className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Leídos</span>
                </div>
                <span className="text-base font-bold text-purple-700">{company.readMessages}</span>
              </div>

              {/* Sentimiento */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="flex items-center">
                  <div className="p-1 rounded-md bg-orange-100 mr-2">
                    {company.sentimentScore >= 0.1 ? (
                      <FaceSmileIcon className="h-3.5 w-3.5 text-green-600" />
                    ) : company.sentimentScore <= -0.1 ? (
                      <FaceFrownIcon className="h-3.5 w-3.5 text-red-600" />
                    ) : (
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 text-orange-600" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600">Sentimiento</span>
                </div>
                <span className={`text-base font-bold ${
                  company.sentimentScore >= 0.1 ? 'text-green-700' :
                  company.sentimentScore <= -0.1 ? 'text-red-700' : 'text-orange-700'
                }`}>
                  {company.sentimentScore.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Barra de progreso de engagement */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Engagement</span>
                <span>{company.sentMessages > 0 ? Math.round((company.readMessages / company.sentMessages) * 100) : 100}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${company.sentMessages > 0 ? Math.min((company.readMessages / company.sentMessages) * 100, 100) : 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">Haz clic para ver mensajes pendientes</span>
              <button
                className="mt-2 px-3 py-1.5 pb-[15px] text-black text-xs font-medium rounded-md hover:text-[#5F3DE4] transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que se propague el click al contenedor
                  e.preventDefault(); // Prevenir cualquier comportamiento por defecto

                  console.log('Botón Recomendaciones IA clickeado para:', company.name);

                  // Mapeo de nombres de empresas para asegurar coincidencia exacta
                  const companyNameMapping = {
                    'Corporación Chilena - Alemana': 'Corporación Chilena',
                    'Corporación Chilena': 'Corporación Chilena',
                    'Hogar Alemán': 'Hogar Alemán',
                    'Empresas SB': 'Empresas SB',
                    'Antofagasta Minerals': 'Antofagasta Minerals',
                    'Vida Cámara': 'Vida Cámara',
                    'AFP Habitat': 'AFP Habitat',
                    'Grupo Saesa': 'Grupo Saesa',
                    'Arcoprime': 'Arcoprime',
                    'Achs': 'Achs',
                    'CMPC': 'CMPC',
                    'Copec': 'Copec',
                    'Inchcape': 'Inchcape',
                    'Ariztia': 'Ariztia',
                    'Colbun': 'Colbun',
                    'Enaex': 'Enaex',
                    'SQM': 'SQM'
                  };

                  // Usar el nombre mapeado o el original si no hay mapeo
                  const mappedCompanyName = companyNameMapping[company.name] || company.name;

                  console.log('Nombre mapeado:', mappedCompanyName);

                  // Navegar con el estado
                  navigate('/base-de-datos', {
                    state: { selectedCompany: mappedCompanyName }
                  });

                  console.log('Navegación ejecutada hacia:', '/base-de-datos');
                }}
              >
                Recomendaciones IA
              </button>
            </div>
          </div>

          {/* Back of card */}
          <div className="flip-card-back relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-violet-50 p-5 min-h-[400px]">

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 text-base">{company.name}</h4>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <ArrowPathIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" title="Haz clic para ver estadísticas" />
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Mensajes Pendientes</h5>

              {/* Mensajes programados */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-md bg-yellow-100 mr-3">
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Programados</span>
                    <p className="text-xs text-gray-500">Listos para enviar</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-yellow-700">
                  {scheduledMessages}
                </span>
              </div>

              {/* Mensajes en borrador */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-md bg-gray-100 mr-3">
                    <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">En Borrador</span>
                    <p className="text-xs text-gray-500">Sin finalizar</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-700">
                  {draftMessages}
                </span>
              </div>

              {/* Próximo envío */}
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-800">Próximo envío</span>
                    <p className="text-xs text-green-600">Campaña programada</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {nextSendDate ? new Date(nextSendDate).toLocaleDateString('es-ES') : 'Sin programar'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">Haz clic para ver estadísticas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;