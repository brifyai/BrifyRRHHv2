import React from 'react';
import { BuildingOfficeIcon, UsersIcon, PaperAirplaneIcon, EyeIcon, FaceSmileIcon, FaceFrownIcon, ExclamationTriangleIcon, ClockIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

  // Función para renderizar el lado frontal
  const renderFrontSide = () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '1.5rem',
        border: '1px solid #f3f4f6'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(to bottom right, #8b5cf6, #9333ea)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <BuildingOfficeIcon style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
          </div>
          <div>
            <h4
              style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#111827',
                lineHeight: '1.25'
              }}
            >
              {company.name}
            </h4>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827'
            }}
          >
            {company.employeeCount}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <UsersIcon style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.25rem' }} />
            Empleados
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
              borderRadius: '0.75rem',
              padding: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Enviados</div>
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}
                >
                  {company.sentMessages?.toLocaleString() || '0'}
                </div>
              </div>
              <PaperAirplaneIcon style={{ height: '1.25rem', width: '1.25rem', color: '#3b82f6' }} />
            </div>
          </div>
          
          <div
            style={{
              background: 'linear-gradient(to right, #d1fae5, #ccfbf1)',
              borderRadius: '0.75rem',
              padding: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Leídos</div>
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#059669'
                  }}
                >
                  {company.readMessages?.toLocaleString() || '0'}
                </div>
              </div>
              <EyeIcon style={{ height: '1.25rem', width: '1.25rem', color: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* Sentimiento */}
        <div
          style={{
            background: 'linear-gradient(to right, #fce7f3, #fce7f3)',
            borderRadius: '0.75rem',
            padding: '0.75rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sentimiento</div>
              <div
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#9333ea'
                }}
              >
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
                return <ExclamationTriangleIcon style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />;
              }
              
              // Mostrar icono según el sentimiento válido
              return company.sentimentScore > 0 ?
                <FaceSmileIcon style={{ height: '1.25rem', width: '1.25rem', color: '#10b981' }} /> :
                <FaceFrownIcon style={{ height: '1.25rem', width: '1.25rem', color: '#ef4444' }} />;
            })()}
          </div>
        </div>

        {/* Engagement */}
        <div
          style={{
            background: 'linear-gradient(to right, #fed7aa, #fef3c7)',
            borderRadius: '0.75rem',
            padding: '0.75rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Engagement</div>
              <div
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#ea580c'
                }}
              >
                {company.engagementRate || 0}%
              </div>
            </div>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #fb923c, #facc15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {Math.round(company.engagementRate || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de tendencias */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Aquí iría la lógica para mostrar tendencias
            console.log(`📈 Mostrando tendencias para ${company.name}`);
          }}
          style={{
            padding: '0.5rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(to right, #6366f1, #9333ea)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(to right, #4f46e5, #7c3aed)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(to right, #6366f1, #9333ea)';
            e.target.style.transform = 'scale(1)';
          }}
          title="Ver tendencias"
        >
          <ArrowPathIcon style={{ height: '1rem', width: '1rem' }} />
        </button>
      </div>

      {/* Indicador de flip */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem'
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span>👆 Toca para ver detalles</span>
        </div>
      </div>
    </div>
  );

  // Función para renderizar el lado trasero
  const renderBackSide = () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom right, #e0e7ff, #f3e8ff)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '1rem',
        border: '1px solid #f3f4f6'
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            flexShrink: 0
          }}
        >
          <h4
            style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#111827'
            }}
          >
            📊 Vista Detallada
          </h4>
          <div
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginLeft: '0.5rem'
            }}
          >
            {company.name}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}
        >
          {/* Programados */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>📅 Mensajes Programados</div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#4f46e5'
                  }}
                >
                  {scheduledMessages}
                </div>
                {nextSendDate && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.25rem'
                    }}
                  >
                    Próximo: {new Date(nextSendDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <ClockIcon style={{ height: '1.5rem', width: '1.5rem', color: '#4f46e5' }} />
            </div>
          </div>

          {/* Borradores */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>📝 Borradores</div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#d97706'
                  }}
                >
                  {draftMessages}
                </div>
              </div>
              <DocumentTextIcon style={{ height: '1.5rem', width: '1.5rem', color: '#d97706' }} />
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              📈 Estadísticas Adicionales
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tasa de lectura:</span>
                <span style={{ fontWeight: '500' }}>
                  {company.sentMessages > 0 ?
                    Math.round((company.readMessages / company.sentMessages) * 100)
                    : 0}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Última actividad:</span>
                <span style={{ fontWeight: '500' }}>Hoy</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estado:</span>
                <span style={{ fontWeight: '500', color: '#059669' }}>🟢 Activa</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              🏢 Información de la Empresa
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{company.id.slice(0, 12)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Empleados:</span>
                <span style={{ fontWeight: '500' }}>{company.employeeCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de flip de vuelta */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '1rem'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>👆 Toca para volver</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div
      style={{
        perspective: '1000px',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={(e) => {
          // Verificar si el clic fue en el botón de tendencias
          if (e.target.closest('button')) {
            return; // No hacer nada si el clic fue en un botón
          }
          onToggleFlip(company.id);
        }}
      >
        {/* Renderizado condicional - solo un lado a la vez */}
        {!isFlipped ? renderFrontSide() : renderBackSide()}
      </div>
    </div>
  );
});

// Configurar displayName para debugging
CompanyCard.displayName = 'CompanyCard';

export default CompanyCard;