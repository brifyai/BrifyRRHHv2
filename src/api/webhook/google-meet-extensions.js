// Extensiones avanzadas para Google Meet - Integración con WhatsApp
// Procesa eventos específicos de Google Meet más allá del calendario básico

import { supabase } from '../../lib/supabase.js';
import communicationService from '../../services/communicationService.js';

/**
 * Procesa extensiones avanzadas de Google Meet
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
    console.log('🎥 Extensión de Google Meet recibida:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const extensionData = req.body;

    // Validar que tenemos los datos necesarios
    if (!extensionData || !extensionData.type) {
      console.error('❌ Datos de extensión inválidos');
      return res.status(400).json({
        success: false,
        error: 'Datos de extensión inválidos'
      });
    }

    // Procesar según el tipo de extensión
    await processGoogleMeetExtension(extensionData);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Extensión procesada correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando extensión de Google Meet:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa una extensión específica de Google Meet
 * @param {Object} extensionData - Datos de la extensión
 */
async function processGoogleMeetExtension(extensionData) {
  try {
    const { type, data, userId } = extensionData;

    console.log('🔄 Procesando extensión de Google Meet:', type);

    switch (type) {
      case 'meeting_started':
        await processMeetingStarted(data, userId);
        break;

      case 'meeting_ended':
        await processMeetingEnded(data, userId);
        break;

      case 'participant_joined':
        await processParticipantJoined(data, userId);
        break;

      case 'participant_left':
        await processParticipantLeft(data, userId);
        break;

      case 'recording_started':
        await processRecordingStarted(data, userId);
        break;

      case 'recording_ended':
        await processRecordingEnded(data, userId);
        break;

      case 'screen_share_started':
        await processScreenShareStarted(data, userId);
        break;

      case 'screen_share_ended':
        await processScreenShareEnded(data, userId);
        break;

      case 'chat_message':
        await processChatMessage(data, userId);
        break;

      case 'hand_raised':
        await processHandRaised(data, userId);
        break;

      case 'poll_created':
        await processPollCreated(data, userId);
        break;

      case 'breakout_room_created':
        await processBreakoutRoomCreated(data, userId);
        break;

      default:
        console.log('⚠️ Tipo de extensión no manejado:', type);
    }

  } catch (error) {
    console.error('❌ Error procesando extensión de Google Meet:', error);
  }
}

/**
 * Procesa cuando una reunión de Google Meet comienza
 * @param {Object} data - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingStarted(data, userId) {
  try {
    const { meetingId, title, participants, startTime } = data;

    console.log('▶️ Reunión de Google Meet iniciada:', title);

    const whatsappMessage = `🚀 Reunión de Google Meet iniciada: "${title}". ${participants?.length || 0} participantes conectados.`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('meeting_started', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión iniciada:', error);
  }
}

/**
 * Procesa cuando una reunión de Google Meet termina
 * @param {Object} data - Datos de la reunión
 * @param {string} userId - ID del usuario
 */
async function processMeetingEnded(data, userId) {
  try {
    const { meetingId, title, duration, participants } = data;

    console.log('⏹️ Reunión de Google Meet finalizada:', title);

    const durationText = duration ? `Duración: ${Math.round(duration / 60)} minutos.` : '';
    const whatsappMessage = `🏁 Reunión de Google Meet finalizada: "${title}". ${durationText} ${participants?.length || 0} participantes.`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('meeting_ended', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión finalizada:', error);
  }
}

/**
 * Procesa cuando un participante se une a la reunión
 * @param {Object} data - Datos del participante
 * @param {string} userId - ID del usuario
 */
async function processParticipantJoined(data, userId) {
  try {
    const { meetingId, participantName, participantEmail, joinTime, totalParticipants } = data;

    console.log('👤 Participante se unió a Google Meet:', participantName);

    // Solo enviar notificación si hay más de 2 participantes (evitar spam)
    if (totalParticipants && totalParticipants > 2) {
      const whatsappMessage = `👋 ${participantName} se unió a la reunión de Google Meet. Total participantes: ${totalParticipants}`;

      await sendMeetWhatsAppNotification(userId, whatsappMessage);
      await saveMeetEvent('participant_joined', data, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando participante unido:', error);
  }
}

/**
 * Procesa cuando un participante sale de la reunión
 * @param {Object} data - Datos del participante
 * @param {string} userId - ID del usuario
 */
async function processParticipantLeft(data, userId) {
  try {
    const { meetingId, participantName, participantEmail, leaveTime, totalParticipants } = data;

    console.log('👋 Participante salió de Google Meet:', participantName);

    // Solo enviar notificación para salidas importantes o si quedan pocos participantes
    if (totalParticipants && totalParticipants <= 3) {
      const whatsappMessage = `👋 ${participantName} salió de la reunión de Google Meet. Quedan ${totalParticipants} participantes.`;

      await sendMeetWhatsAppNotification(userId, whatsappMessage);
      await saveMeetEvent('participant_left', data, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando participante salido:', error);
  }
}

/**
 * Procesa cuando comienza una grabación
 * @param {Object} data - Datos de la grabación
 * @param {string} userId - ID del usuario
 */
async function processRecordingStarted(data, userId) {
  try {
    const { meetingId, title, startedBy } = data;

    console.log('🎬 Grabación iniciada en Google Meet:', title);

    const whatsappMessage = `🎬 Grabación iniciada en reunión: "${title}". Iniciada por: ${startedBy || 'Sistema'}`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('recording_started', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando grabación iniciada:', error);
  }
}

/**
 * Procesa cuando termina una grabación
 * @param {Object} data - Datos de la grabación
 * @param {string} userId - ID del usuario
 */
async function processRecordingEnded(data, userId) {
  try {
    const { meetingId, title, duration, downloadUrl } = data;

    console.log('🎬 Grabación finalizada en Google Meet:', title);

    const durationText = duration ? `Duración: ${Math.round(duration / 60)} minutos.` : '';
    const urlText = downloadUrl ? ` Enlace de descarga disponible.` : '';

    const whatsappMessage = `🎬 Grabación finalizada: "${title}". ${durationText}${urlText}`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('recording_ended', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando grabación finalizada:', error);
  }
}

/**
 * Procesa cuando alguien comparte pantalla
 * @param {Object} data - Datos del compartir pantalla
 * @param {string} userId - ID del usuario
 */
async function processScreenShareStarted(data, userId) {
  try {
    const { meetingId, participantName, shareType } = data;

    console.log('🖥️ Compartir pantalla iniciado:', participantName);

    const whatsappMessage = `🖥️ ${participantName} comenzó a compartir pantalla (${shareType || 'pantalla completa'})`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('screen_share_started', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando compartir pantalla iniciado:', error);
  }
}

/**
 * Procesa cuando termina el compartir pantalla
 * @param {Object} data - Datos del compartir pantalla
 * @param {string} userId - ID del usuario
 */
async function processScreenShareEnded(data, userId) {
  try {
    const { meetingId, participantName, duration } = data;

    console.log('🖥️ Compartir pantalla finalizado:', participantName);

    const durationText = duration ? ` después de ${Math.round(duration / 60)} minutos` : '';
    const whatsappMessage = `🖥️ ${participantName} dejó de compartir pantalla${durationText}`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('screen_share_ended', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando compartir pantalla finalizado:', error);
  }
}

/**
 * Procesa mensajes del chat de Google Meet
 * @param {Object} data - Datos del mensaje
 * @param {string} userId - ID del usuario
 */
async function processChatMessage(data, userId) {
  try {
    const { meetingId, senderName, message, timestamp, isPrivate } = data;

    console.log('💬 Mensaje en chat de Google Meet:', senderName, message?.substring(0, 50));

    // Solo procesar mensajes importantes o menciones
    if (message && (message.includes('@') || message.length > 100 || isPrivate)) {
      const privateText = isPrivate ? ' (privado)' : '';
      const whatsappMessage = `💬 Chat de Google Meet${privateText}: ${senderName}: "${message?.substring(0, 200)}${message?.length > 200 ? '...' : ''}"`;

      await sendMeetWhatsAppNotification(userId, whatsappMessage);
      await saveMeetEvent('chat_message', data, userId, whatsappMessage);
    }

  } catch (error) {
    console.error('❌ Error procesando mensaje de chat:', error);
  }
}

/**
 * Procesa cuando alguien levanta la mano
 * @param {Object} data - Datos de la mano levantada
 * @param {string} userId - ID del usuario
 */
async function processHandRaised(data, userId) {
  try {
    const { meetingId, participantName, timestamp } = data;

    console.log('✋ Mano levantada en Google Meet:', participantName);

    const whatsappMessage = `✋ ${participantName} levantó la mano en la reunión`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('hand_raised', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando mano levantada:', error);
  }
}

/**
 * Procesa cuando se crea una encuesta
 * @param {Object} data - Datos de la encuesta
 * @param {string} userId - ID del usuario
 */
async function processPollCreated(data, userId) {
  try {
    const { meetingId, title, options, createdBy } = data;

    console.log('📊 Encuesta creada en Google Meet:', title);

    const optionsText = options?.length ? ` (${options.length} opciones)` : '';
    const whatsappMessage = `📊 Nueva encuesta en reunión: "${title}"${optionsText}. Creada por: ${createdBy || 'Sistema'}`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('poll_created', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando encuesta creada:', error);
  }
}

/**
 * Procesa cuando se crean salas de breakout
 * @param {Object} data - Datos de las salas
 * @param {string} userId - ID del usuario
 */
async function processBreakoutRoomCreated(data, userId) {
  try {
    const { meetingId, roomCount, assignmentType } = data;

    console.log('🏢 Salas de breakout creadas:', roomCount);

    const assignmentText = assignmentType === 'auto' ? 'asignación automática' : 'asignación manual';
    const whatsappMessage = `🏢 Se crearon ${roomCount} salas de breakout con ${assignmentText}`;

    await sendMeetWhatsAppNotification(userId, whatsappMessage);
    await saveMeetEvent('breakout_room_created', data, userId, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando salas de breakout:', error);
  }
}

/**
 * Envía notificación por WhatsApp para extensiones de Google Meet
 * @param {string} userId - ID del usuario
 * @param {string} message - Mensaje a enviar
 */
async function sendMeetWhatsAppNotification(userId, message) {
  try {
    // Obtener empleados asociados al usuario
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .limit(10);

    if (!employees || employees.length === 0) {
      console.error('❌ No se encontraron empleados para enviar WhatsApp');
      return;
    }

    const recipientIds = employees.map(emp => emp.id);

    // Enviar mensaje usando el servicio de comunicación
    await communicationService.sendWhatsAppMessage(recipientIds, message);

    console.log('✅ Mensaje de WhatsApp enviado para extensión de Google Meet:', message);

  } catch (error) {
    console.error('❌ Error enviando mensaje de WhatsApp para extensión de Google Meet:', error);
  }
}

/**
 * Guarda el evento de extensión de Google Meet en la base de datos
 * @param {string} eventType - Tipo de evento
 * @param {Object} eventData - Datos del evento
 * @param {string} userId - ID del usuario
 * @param {string} whatsappMessage - Mensaje enviado por WhatsApp
 */
async function saveMeetEvent(eventType, eventData, userId, whatsappMessage) {
  try {
    const meetEventData = {
      event_type: eventType,
      user_id: userId,
      event_data: eventData,
      whatsapp_message: whatsappMessage,
      processed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('google_meet_extensions')
      .insert(meetEventData);

    if (error) {
      console.error('❌ Error guardando extensión de Google Meet:', error);
    } else {
      console.log('✅ Extensión de Google Meet guardada en BD');
    }
  } catch (error) {
    console.error('❌ Error guardando extensión de Google Meet:', error);
  }
}