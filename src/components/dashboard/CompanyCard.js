import React from 'react';
import { BuildingOfficeIcon, UsersIcon, PaperAirplaneIcon, EyeIcon, FaceSmileIcon, FaceFrownIcon, ExclamationTriangleIcon, ClockIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Estilos CSS para el efecto de flip
const flipStyles = `
  .flip-card {
    perspective: 1000px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
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
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }

  .backface-hidden {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
`;

// Memoizar el componente para evitar re-renders innecesarios
const CompanyCard = React.memo(({ company, isFlipped, onToggleFlip }) => {
  
  // Logging solo en desarrollo y solo una vez por empresa
  if (process.env.NODE_ENV === 'development' && !company._logged) {
    console.log(`🎯 CompanyCard: Renderizando tarjeta para ${company.name}`)
    console.log(`   - ID: ${company.id}`)
    console.log(`   - Empleados: ${company.employeeCount}`)
    console.log(`   - Mensajes enviados: ${company.sentMessages}`)
    console.log(`   - Mensajes leídos: ${company.readMessages}`)
    console.log(`   - Sentimiento: ${company.sentimentScore}`)
    console.log(`   - Engagement: ${company.engagementRate}%`)
    
    // Marcar como loggeado para evitar logs repetitivos
    company._logged = true
  }
  
  // Verificar datos inválidos solo una vez
  if (process.env.NODE_ENV === 'development' && !company._validated) {
    if (company.sentimentScore && (company.sentimentScore > 1 || company.sentimentScore < -1)) {
      console.warn(`⚠️ CompanyCard: DATO MOCK DETECTADO - Sentimiento inválido (${company.sentimentScore}) para ${company.name}`)
    }
    
    if (company.employeeCount && (company.employeeCount < 0 || company.employeeCount > 1000)) {
      console.warn(`⚠️ CompanyCard: DATO MOCK DETECTADO - Número de empleados inválido (${company.employeeCount}) para ${company.name}`)
    }
    
    company._validated = true
  }
  
  // Usar los datos que ya vienen del componente padre
  const scheduledMessages = company.scheduledMessages || 0;
  const draftMessages = company.draftMessages || 0;
  const nextSendDate = company.nextScheduledDate;
  
  return (
    <div className="flip-card group relative">
      {/* Inyectar estilos CSS para flip effect */}
      <style dangerouslySetInnerHTML={{ __html: flipStyles }} />
      
      <div
        className="flip-card-inner relative cursor-pointer transition-all duration-700"
        style={{
          height: '400px',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={(e) => {
          // Verificar si el clic fue en el botón de tendencias
          if (e.target.closest('button')) {
            return; // No hacer nada si el clic fue en un botón
          }
          onToggleFlip(company.id);
        }}
      >
        {/* Lado frontal de la tarjeta */}
        <div className="flip-card-front absolute inset-0 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                  {company.name}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {company.employeeCount}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <UsersIcon className="h-3 w-3 mr-1" />
                Empleados
              </div>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Enviados</div>
                    <div className="text-lg font-bold text-blue-600">
                      {company.sentMessages?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <PaperAirplaneIcon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Leídos</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {company.readMessages?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <EyeIcon className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Sentimiento */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Sentimiento</div>
                  <div className="text-lg font-bold text-purple-600">
                    {(() => {
                      // Si no hay mensajes enviados, el sentimiento debe ser 0
                      if (!company.sentMessages || company.sentMessages === 0) {
                        return '0.00';
                      }
                      
                      // Si sentimentScore es inválido, mostrar 0.00
                      if (!company.sentimentScore ||
                          typeof company.sentimentScore !== 'number' ||
                          isNaN(company.sentimentScore) ||
                          company.sentimentScore < -1 ||
                          company.sentimentScore > 1) {
                        return '0.00';
                      }
                      
                      // Mostrar sentimentScore válido
                      return (company.sentimentScore > 0 ? '+' : '') + company.sentimentScore.toFixed(2);
                    })()}
                  </div>
                </div>
                {(() => {
                  // Si no hay mensajes o sentimentScore inválido, mostrar icono neutral
                  if (!company.sentMessages || company.sentMessages === 0 ||
                      !company.sentimentScore ||
                      typeof company.sentimentScore !== 'number' ||
                      isNaN(company.sentimentScore) ||
                      company.sentimentScore < -1 ||
                      company.sentimentScore > 1) {
                    return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
                  }
                  
                  // Mostrar icono según el sentimiento válido
                  return company.sentimentScore > 0 ?
                    <FaceSmileIcon className="h-5 w-5 text-green-500" /> :
                    <FaceFrownIcon className="h-5 w-5 text-red-500" />;
                })()}
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Engagement</div>
                  <div className="text-lg font-bold text-orange-600">
                    {company.engagementRate || 0}%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {Math.round(company.engagementRate || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de tendencias */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Aquí iría la lógica para mostrar tendencias
                console.log(`📈 Mostrando tendencias para ${company.name}`);
              }}
              className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-105"
              title="Ver tendencias"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Indicador de flip */}
          <div className="absolute bottom-4 left-4">
            <div className="text-xs text-gray-400 flex items-center">
              <span>👆 Toca para ver detalles</span>
            </div>
          </div>
        </div>

        {/* Lado trasero de la tarjeta */}
        <div className="flip-card-back absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-4 border border-gray-100 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900">
                📊 Vista Detallada
              </h4>
              <div className="text-sm text-gray-500 truncate ml-2">
                {company.name}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Programados */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">📅 Mensajes Programados</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {scheduledMessages}
                    </div>
                    {nextSendDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        Próximo: {new Date(nextSendDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <ClockIcon className="h-6 w-6 text-indigo-500" />
                </div>
              </div>

              {/* Borradores */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">📝 Borradores</div>
                    <div className="text-xl font-bold text-amber-600">
                      {draftMessages}
                    </div>
                  </div>
                  <DocumentTextIcon className="h-6 w-6 text-amber-500" />
                </div>
              </div>

              {/* Estadísticas adicionales */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">📈 Estadísticas Adicionales</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Tasa de lectura:</span>
                    <span className="font-medium">
                      {company.sentMessages > 0 ?
                        Math.round((company.readMessages / company.sentMessages) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actividad:</span>
                    <span className="font-medium">Hoy</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-medium text-green-600">🟢 Activa</span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">🏢 Información de la Empresa</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono">{company.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Empleados:</span>
                    <span className="font-medium">{company.employeeCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de flip de vuelta */}
            <div className="absolute bottom-2 left-4">
              <div className="text-xs text-gray-400 flex items-center">
                <span>👆 Toca para volver</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Configurar displayName para debugging
CompanyCard.displayName = 'CompanyCard';

export default CompanyCard;