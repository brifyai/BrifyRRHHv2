// Endpoint API para recibir notificaciones de Zoom
// Procesa eventos de reuniones y envía mensajes a WhatsApp

import { supabase } from '../../lib/supabase.js';
import communicationService from '../../services/communicationService.js';

/**
 * Procesa notificaciones de Zoom recibidas desde Zoom Webhooks
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
    console.log('📹 Webhook recibido desde Zoom:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const webhookData = req.body;

    // Validar que tenemos los datos necesarios
    if (!webhookData || !webhookData.event) {
      console.error('❌ Datos de webhook inválidos: faltan campos requeridos');
      return res.status(400).json({
        success: false,
        error: 'Datos de webhook inválidos: faltan campos requeridos'
      });
    }

    // Verificar firma de Zoom (en producción)
    // const signature = req.headers['x-zm-signature'];
    // const timestamp = req.headers['x-zm-request-timestamp'];
    // if (!verifyZoomSignature(signature, timestamp, JSON.stringify(webhookData))) {
    //   return res.status(401).json({ success: false, error: 'Firma inválida' });
    // }

    // Procesar el evento de Zoom
    await processZoomEvent(webhookData);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Notificación procesada correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando webhook de Zoom:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa un evento individual de Zoom
 * @param {Object} eventData - Datos del evento de Zoom
 */
async function processZoomEvent(eventData) {
  try {
    console.log('🔄 Procesando evento de Zoom:', eventData.event);

    const { event, payload } = eventData;

    // Procesar diferentes tipos de eventos
    switch (event) {
      case 'meeting.started':
        await processMeetingStarted(payload, eventData);
        break;

      case 'meeting.ended':
        await processMeetingEnded(payload, eventData);
        break;

      case 'meeting.participant_joined':
        await processParticipantJoined(payload, eventData);
        break;

      case 'meeting.participant_left':
        await processParticipantLeft(payload, eventData);
        break;

      case 'meeting.created':
        await processMeetingCreated(payload, eventData);
        break;

      case 'meeting.updated':
        await processMeetingUpdated(payload, eventData);
        break;

      case 'meeting.deleted':
        await processMeetingDeleted(payload, eventData);
        break;

      default:
        console.log('⚠️ Evento de Zoom no manejado:', event);
    }

  } catch (error) {
    console.error('❌ Error procesando evento de Zoom:', error);
  }
}

/**
 * Procesa cuando una reunión comienza
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processMeetingStarted(payload, eventData) {
  try {
    const { object } = payload;
    const meetingId = object.id;
    const topic = object.topic || 'Reunión sin título';

    console.log('▶️ Reunión iniciada:', topic);

    // Obtener información adicional de la reunión
    const meetingDetails = await getZoomMeetingDetails(meetingId);

    // Generar mensaje de WhatsApp
    const whatsappMessage = `La reunión "${topic}" ha comenzado. Enlace: ${meetingDetails?.join_url || 'No disponible'}`;

    // Enviar notificación
    await sendZoomWhatsAppNotification(payload, whatsappMessage);

    // Guardar evento
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión iniciada:', error);
  }
}

/**
 * Procesa cuando una reunión termina
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processMeetingEnded(payload, eventData) {
  try {
    const { object } = payload;
    const topic = object.topic || 'Reunión sin título';

    console.log('⏹️ Reunión finalizada:', topic);

    const whatsappMessage = `La reunión "${topic}" ha finalizado.`;

    await sendZoomWhatsAppNotification(payload, whatsappMessage);
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión finalizada:', error);
  }
}

/**
 * Procesa cuando un participante se une
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processParticipantJoined(payload, eventData) {
  try {
    const { object } = payload;
    const participantName = object.participant?.user_name || 'Participante desconocido';
    const meetingTopic = object.topic || 'Reunión sin título';

    console.log('👤 Participante se unió:', participantName, 'a', meetingTopic);

    // Solo enviar notificación si es un participante importante o si está configurado
    const whatsappMessage = `${participantName} se unió a la reunión "${meetingTopic}".`;

    await sendZoomWhatsAppNotification(payload, whatsappMessage);
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando participante unido:', error);
  }
}

/**
 * Procesa cuando un participante sale
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processParticipantLeft(payload, eventData) {
  try {
    const { object } = payload;
    const participantName = object.participant?.user_name || 'Participante desconocido';
    const meetingTopic = object.topic || 'Reunión sin título';

    console.log('👋 Participante salió:', participantName, 'de', meetingTopic);

    // Opcional: solo enviar para participantes importantes
    // const whatsappMessage = `${participantName} salió de la reunión "${meetingTopic}".`;
    // await sendZoomWhatsAppNotification(payload, whatsappMessage);
    // await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando participante salido:', error);
  }
}

/**
 * Procesa cuando se crea una reunión
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processMeetingCreated(payload, eventData) {
  try {
    const { object } = payload;
    const topic = object.topic || 'Reunión sin título';
    const startTime = object.start_time;

    console.log('📅 Nueva reunión creada:', topic);

    const formattedDate = startTime ? formatZoomDate(startTime) : 'Fecha no especificada';
    const whatsappMessage = `Nueva reunión programada: "${topic}" el ${formattedDate}. Enlace: ${object.join_url || 'No disponible'}`;

    await sendZoomWhatsAppNotification(payload, whatsappMessage);
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión creada:', error);
  }
}

/**
 * Procesa cuando se actualiza una reunión
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processMeetingUpdated(payload, eventData) {
  try {
    const { object } = payload;
    const topic = object.topic || 'Reunión sin título';
    const startTime = object.start_time;

    console.log('🔄 Reunión actualizada:', topic);

    const formattedDate = startTime ? formatZoomDate(startTime) : 'Fecha no especificada';
    const whatsappMessage = `Reunión actualizada: "${topic}" ahora es el ${formattedDate}. Enlace: ${object.join_url || 'No disponible'}`;

    await sendZoomWhatsAppNotification(payload, whatsappMessage);
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión actualizada:', error);
  }
}

/**
 * Procesa cuando se elimina una reunión
 * @param {Object} payload - Payload del evento
 * @param {Object} eventData - Datos completos del evento
 */
async function processMeetingDeleted(payload, eventData) {
  try {
    const { object } = payload;
    const topic = object.topic || 'Reunión sin título';

    console.log('🗑️ Reunión eliminada:', topic);

    const whatsappMessage = `Reunión cancelada: "${topic}".`;

    await sendZoomWhatsAppNotification(payload, whatsappMessage);
    await saveZoomNotification(eventData, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando reunión eliminada:', error);
  }
}

/**
 * Obtiene detalles adicionales de una reunión de Zoom
 * @param {string} meetingId - ID de la reunión
 * @returns {Object|null} Detalles de la reunión
 */
async function getZoomMeetingDetails(meetingId) {
  try {
    // En una implementación real, obtendríamos el access token del usuario
    // Por ahora, devolvemos datos básicos del payload
    console.log('📋 Obteniendo detalles de reunión Zoom:', meetingId);

    // Aquí iría la lógica para llamar a la API de Zoom
    // const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${zoomAccessToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    return null; // Placeholder

  } catch (error) {
    console.error('❌ Error obteniendo detalles de reunión Zoom:', error);
    return null;
  }
}

/**
 * Envía notificación por WhatsApp para eventos de Zoom
 * @param {Object} payload - Payload del evento
 * @param {string} message - Mensaje a enviar
 */
async function sendZoomWhatsAppNotification(payload, message) {
  try {
    // Extraer información del organizador o usuario
    const accountId = payload?.account_id || payload?.object?.host_id;

    if (!accountId) {
      console.error('❌ No se pudo identificar el usuario para Zoom');
      return;
    }

    // Buscar usuario por account_id de Zoom
    const { data: userCredentials, error } = await supabase
      .from('user_credentials')
      .select('user_id')
      .eq('zoom_account_id', accountId)
      .single();

    if (error || !userCredentials) {
      console.error('❌ No se encontraron credenciales de Zoom para el usuario');
      return;
    }

    // Obtener empleados asociados al usuario
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userCredentials.user_id)
      .limit(10);

    if (!employees || employees.length === 0) {
      console.error('❌ No se encontraron empleados para enviar WhatsApp');
      return;
    }

    const recipientIds = employees.map(emp => emp.id);

    // Enviar mensaje usando el servicio de comunicación
    await communicationService.sendWhatsAppMessage(recipientIds, message);

    console.log('✅ Mensaje de WhatsApp enviado para Zoom:', message);

  } catch (error) {
    console.error('❌ Error enviando mensaje de WhatsApp para Zoom:', error);
  }
}

/**
 * Guarda la notificación de Zoom en la base de datos
 * @param {Object} eventData - Datos del evento
 * @param {string} whatsappMessage - Mensaje enviado por WhatsApp
 */
async function saveZoomNotification(eventData, whatsappMessage) {
  try {
    const { data, error } = await supabase
      .from('zoom_notifications')
      .insert({
        event_type: eventData.event,
        event_data: eventData,
        whatsapp_message: whatsappMessage,
        processed_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error guardando notificación de Zoom:', error);
    } else {
      console.log('✅ Notificación de Zoom guardada en BD');
    }
  } catch (error) {
    console.error('❌ Error guardando notificación de Zoom:', error);
  }
}

/**
 * Verifica la firma de Zoom (para producción)
 * @param {string} signature - Firma del webhook
 * @param {string} timestamp - Timestamp del request
 * @param {string} body - Cuerpo del request
 * @returns {boolean} Si la firma es válida
 */
function verifyZoomSignature(signature, timestamp, body) {
  // Implementación de verificación de firma de Zoom
  // Usando HMAC-SHA256 con el secret del webhook
  // const expectedSignature = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
  //   .update(`v0:${timestamp}:${body}`)
  //   .digest('hex');
  // return signature === `v0=${expectedSignature}`;

  return true; // Placeholder para desarrollo
}

/**
 * Formatea fecha de Zoom para mensajes
 * @param {string} dateTime - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatZoomDate(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}