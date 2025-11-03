// Sistema de detección en tiempo real para Google Meet
// Monitorea eventos de reuniones activas y envía notificaciones a WhatsApp

import { supabase } from '../../lib/supabase.js';
import communicationService from '../../services/communicationService.js';

/**
 * Procesa eventos en tiempo real de Google Meet
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
export default async function handler(req, res) {
  // Solo aceptar métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se acepta POST.'
    });
  }

  try {
    console.log('⚡ Evento en tiempo real de Google Meet:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const realtimeData = req.body;

    // Validar que tenemos los datos necesarios
    if (!realtimeData || !realtimeData.eventType) {
      console.error('❌ Datos de tiempo real inválidos');
      return res.status(400).json({
        success: false,
        error: 'Datos de tiempo real inválidos'
      });
    }

    // Procesar evento en tiempo real
    await processRealtimeEvent(realtimeData);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Evento en tiempo real procesado correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando evento en tiempo real de Google Meet:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa un evento en tiempo real de Google Meet
 * @param {Object} eventData - Datos del evento
 */
async function processRealtimeEvent(eventData) {
  try {
    const { eventType, meetingData, userId, timestamp } = eventData;

    console.log('🔄 Procesando evento en tiempo real:', eventType);

    // Verificar si el evento es reciente (últimos 30 segundos)
    const eventTime = new Date(timestamp);
    const now = new Date();
    const timeDiff = now - eventTime;

    if (timeDiff > 30000) { // 30 segundos
      console.log('⚠️ Evento muy antiguo, ignorando');
      return;
    }

    switch (eventType) {
      case 'meeting_detected':
        await processMeetingDetected(meetingData, userId);
        break;

      case 'participant_count_changed':
        await processParticipantCountChanged(meetingData, userId);
        break;

      case 'active_speaker_changed':
        await processActiveSpeakerChanged(meetingData, userId);
        break;

      case 'meeting_quality_issue':
        await processMeetingQualityIssue(meetingData, userId);
        break;

      case 'meeting_idle_detected':
        await processMeetingIdleDetected(meetingData, userId);
        break;

      case 'meeting_ending_soon':
        await processMeetingEndingSoon(meetingData, userId);
        break;

      default:
        console.log('⚠️ Tipo de evento en tiempo real no manejado:', eventType);
    }

  } catch (error) {
    console.error('❌ Error procesando evento en tiempo real:', error);
  }
}

/**
 * Procesa cuando se detecta una reunión activa
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingDetected(meetingData, userId) {
  try {
    const { title, participantCount, meetingUrl, startTime } = meetingData;

    console.log('🔍 Reunión activa detectada:', title);

    // Verificar si ya notificamos esta reunión recientemente
    const { data: recentNotification } = await supabase
      .from('google_meet_realtime_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'meeting_detected')
      .eq('meeting_url', meetingUrl)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
      .single();

    if (recentNotification) {
      console.log('⚠️ Reunión ya notificada recientemente');
      return;
    }

    const whatsappMessage = `🔍 Reunión activa detectada: "${title}". ${participantCount} participantes. URL: ${meetingUrl}`;

    await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
    await saveRealtimeEvent('meeting_detected', meetingData, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión detectada:', error);
  }
}

/**
 * Procesa cambios en el conteo de participantes
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processParticipantCountChanged(meetingData, userId) {
  try {
    const { title, participantCount, changeType, participantName } = meetingData;

    console.log('👥 Cambio en participantes:', changeType, participantName);

    let whatsappMessage = '';

    if (changeType === 'joined') {
      whatsappMessage = `➕ ${participantName} se unió a: "${title}". Total: ${participantCount} participantes`;
    } else if (changeType === 'left') {
      whatsappMessage = `➖ ${participantName} salió de: "${title}". Total: ${participantCount} participantes`;
    }

    if (whatsappMessage && participantCount <= 5) { // Solo notificar en reuniones pequeñas
      await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
      await saveRealtimeEvent('participant_count_changed', meetingData, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando cambio de participantes:', error);
  }
}

/**
 * Procesa cambios en el orador activo
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processActiveSpeakerChanged(meetingData, userId) {
  try {
    const { title, activeSpeaker, previousSpeaker } = meetingData;

    console.log('🎤 Orador activo cambió:', activeSpeaker);

    // Solo notificar cambios importantes o en reuniones pequeñas
    const { data: meetingInfo } = await supabase
      .from('google_meet_realtime_events')
      .select('event_data')
      .eq('user_id', userId)
      .eq('event_type', 'meeting_detected')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (meetingInfo?.event_data?.participantCount <= 10) {
      const whatsappMessage = `🎤 Ahora habla: ${activeSpeaker} en "${title}"`;

      await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
      await saveRealtimeEvent('active_speaker_changed', meetingData, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando cambio de orador:', error);
  }
}

/**
 * Procesa problemas de calidad en la reunión
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingQualityIssue(meetingData, userId) {
  try {
    const { title, issueType, severity } = meetingData;

    console.log('⚠️ Problema de calidad detectado:', issueType, severity);

    if (severity === 'high') {
      const issueMessages = {
        'audio': 'problemas de audio',
        'video': 'problemas de video',
        'connection': 'problemas de conexión',
        'bandwidth': 'ancho de banda limitado'
      };

      const issueText = issueMessages[issueType] || 'problemas técnicos';
      const whatsappMessage = `⚠️ ¡Atención! ${issueText} detectados en reunión: "${title}". Verifica tu conexión.`;

      await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
      await saveRealtimeEvent('meeting_quality_issue', meetingData, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando problema de calidad:', error);
  }
}

/**
 * Procesa cuando se detecta inactividad en la reunión
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingIdleDetected(meetingData, userId) {
  try {
    const { title, idleTime, participantCount } = meetingData;

    console.log('😴 Inactividad detectada:', idleTime, 'minutos');

    if (idleTime >= 10 && participantCount > 1) { // Solo notificar si hay otros participantes
      const whatsappMessage = `😴 La reunión "${title}" ha estado inactiva por ${idleTime} minutos. ¿Continuar o finalizar?`;

      await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
      await saveRealtimeEvent('meeting_idle_detected', meetingData, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando inactividad:', error);
  }
}

/**
 * Procesa cuando la reunión está por terminar
 * @param {Object} meetingData - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingEndingSoon(meetingData, userId) {
  try {
    const { title, timeRemaining, autoEnd } = meetingData;

    console.log('⏰ Reunión terminando pronto:', timeRemaining, 'minutos');

    const autoEndText = autoEnd ? ' (se cerrará automáticamente)' : '';
    const whatsappMessage = `⏰ La reunión "${title}" terminará en ${timeRemaining} minutos${autoEndText}. Prepara conclusiones.`;

    await sendRealtimeWhatsAppNotification(userId, whatsappMessage);
    await saveRealtimeEvent('meeting_ending_soon', meetingData, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión terminando:', error);
  }
}

/**
 * Envía notificación por WhatsApp para eventos en tiempo real
 * @param {string} userId - ID del usuario
 * @param {string} message - Mensaje a enviar
 */
async function sendRealtimeWhatsAppNotification(userId, message) {
  try {
    // Obtener empleados asociados al usuario
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .limit(5); // Menos empleados para notificaciones en tiempo real

    if (!employees || employees.length === 0) {
      console.error('❌ No se encontraron empleados para enviar WhatsApp');
      return;
    }

    const recipientIds = employees.map(emp => emp.id);

    // Enviar mensaje usando el servicio de comunicación
    await communicationService.sendWhatsAppMessage(recipientIds, message);

    console.log('✅ Mensaje de WhatsApp enviado para evento en tiempo real:', message);

  } catch (error) {
    console.error('❌ Error enviando mensaje de WhatsApp para evento en tiempo real:', error);
  }
}

/**
 * Guarda el evento en tiempo real en la base de datos
 * @param {string} eventType - Tipo de evento
 * @param {Object} eventData - Datos del evento
 * @param {string} userId - ID del usuario
 * @param {string} whatsappMessage - Mensaje enviado por WhatsApp
 */
async function saveRealtimeEvent(eventType, eventData, userId, whatsappMessage) {
  try {
    const realtimeEventData = {
      event_type: eventType,
      user_id: userId,
      event_data: eventData,
      meeting_url: eventData.meetingUrl,
      whatsapp_message: whatsappMessage,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('google_meet_realtime_events')
      .insert(realtimeEventData);

    if (error) {
      console.error('❌ Error guardando evento en tiempo real:', error);
    } else {
      console.log('✅ Evento en tiempo real guardado en BD');
    }
  } catch (error) {
    console.error('❌ Error guardando evento en tiempo real:', error);
  }
}