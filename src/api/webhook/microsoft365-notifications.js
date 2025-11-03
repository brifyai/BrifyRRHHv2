// Endpoint API para recibir notificaciones de Microsoft 365 (Microsoft Graph)
// Procesa notificaciones de calendario y envía mensajes a WhatsApp

import { supabase } from '../../lib/supabase.js';
import communicationService from '../../services/communicationService.js';

/**
 * Procesa notificaciones de Microsoft 365 recibidas desde Microsoft Graph
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
    console.log('📅 Webhook recibido desde Microsoft 365:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const webhookData = req.body;

    // Validar que tenemos los datos necesarios
    if (!webhookData) {
      console.error('❌ Datos de webhook inválidos');
      return res.status(400).json({
        success: false,
        error: 'Datos de webhook inválidos'
      });
    }

    // Procesar diferentes tipos de notificaciones de Microsoft 365
    if (webhookData.value && Array.isArray(webhookData.value)) {
      // Notificación de cambios en recursos (change notifications)
      for (const notification of webhookData.value) {
        await processMicrosoft365Notification(notification);
      }
    } else if (webhookData.lifecycleEvent) {
      // Evento de lifecycle (subscription validation, etc.)
      await processLifecycleEvent(webhookData);
    } else {
      console.log('⚠️ Tipo de notificación no reconocido');
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Notificación procesada correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando webhook de Microsoft 365:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa una notificación individual de Microsoft 365
 * @param {Object} notification - Notificación de Microsoft Graph
 */
async function processMicrosoft365Notification(notification) {
  try {
    console.log('🔄 Procesando notificación de Microsoft 365:', notification);

    const { subscriptionId, resource, changeType, clientState } = notification;

    // Verificar que la notificación es válida
    if (!subscriptionId || !resource) {
      console.error('❌ Notificación inválida: faltan campos requeridos');
      return;
    }

    // Buscar la suscripción en la base de datos
    const { data: subscription, error: subError } = await supabase
      .from('microsoft365_subscriptions')
      .select('id, user_id, resource_type')
      .eq('subscription_id', subscriptionId)
      .eq('is_active', true)
      .single();

    if (subError || !subscription) {
      console.error('❌ Suscripción no encontrada:', subError);
      return;
    }

    console.log('✅ Suscripción encontrada:', subscription);

    // Procesar según el tipo de recurso
    if (resource.includes('/events')) {
      await processCalendarEvent(notification, subscription);
    } else if (resource.includes('/messages')) {
      await processEmailMessage(notification, subscription);
    } else {
      console.log('⚠️ Tipo de recurso no manejado:', resource);
    }

  } catch (error) {
    console.error('❌ Error procesando notificación individual:', error);
  }
}

/**
 * Procesa eventos de calendario
 * @param {Object} notification - Notificación del evento
 * @param {Object} subscription - Datos de la suscripción
 */
async function processCalendarEvent(notification, subscription) {
  try {
    const { resource, changeType } = notification;

    // Extraer el ID del evento de la URL del recurso
    const eventIdMatch = resource.match(/events\/([^\/]+)/);
    if (!eventIdMatch) {
      console.error('❌ No se pudo extraer el ID del evento');
      return;
    }

    const eventId = eventIdMatch[1];
    console.log('📅 Procesando evento de calendario:', eventId, 'Tipo de cambio:', changeType);

    // Obtener detalles del evento desde Microsoft Graph
    const eventDetails = await getCalendarEventDetails(eventId, subscription.user_id);

    if (!eventDetails) {
      console.error('❌ No se pudieron obtener detalles del evento');
      return;
    }

    // Generar mensaje de WhatsApp según el tipo de cambio
    let whatsappMessage = '';

    switch (changeType) {
      case 'created':
        // Nueva reunión programada
        whatsappMessage = `Nueva reunión programada: "${eventDetails.subject}" el ${formatDate(eventDetails.start.dateTime)} a las ${formatTime(eventDetails.start.dateTime)}`;
        break;

      case 'updated':
        // Reunión reprogramada o actualizada
        if (eventDetails.subject.includes('reprogram') || eventDetails.subject.includes('cambi')) {
          whatsappMessage = `Se reprogramó la reunión: "${eventDetails.subject}" para el ${formatDate(eventDetails.start.dateTime)} a las ${formatTime(eventDetails.start.dateTime)}`;
        } else {
          whatsappMessage = `Actualización en reunión: "${eventDetails.subject}" el ${formatDate(eventDetails.start.dateTime)} a las ${formatTime(eventDetails.start.dateTime)}`;
        }
        break;

      case 'deleted':
        // Reunión cancelada
        whatsappMessage = `Reunión cancelada: "${eventDetails.subject || 'Sin título'}"`;
        break;

      default:
        console.log('⚠️ Tipo de cambio no manejado:', changeType);
        return;
    }

    // Enviar recordatorio si es una reunión próxima (menos de 15 minutos)
    if (changeType === 'created' || changeType === 'updated') {
      const eventTime = new Date(eventDetails.start.dateTime);
      const now = new Date();
      const timeDiff = eventTime - now;
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff > 0 && minutesDiff <= 15) {
        whatsappMessage = `Tienes una reunión en ${Math.round(minutesDiff)} minutos: "${eventDetails.subject}"`;
      }
    }

    // Enviar mensaje a WhatsApp
    await sendWhatsAppNotification(subscription.user_id, whatsappMessage);

    // Guardar la notificación en la base de datos
    await saveMicrosoft365Notification(notification, subscription, eventDetails, whatsappMessage);

  } catch (error) {
    console.error('❌ Error procesando evento de calendario:', error);
  }
}

/**
 * Procesa mensajes de email
 * @param {Object} notification - Notificación del mensaje
 * @param {Object} subscription - Datos de la suscripción
 */
async function processEmailMessage(notification, subscription) {
  try {
    const { resource, changeType } = notification;

    // Extraer el ID del mensaje de la URL del recurso
    const messageIdMatch = resource.match(/messages\/([^\/]+)/);
    if (!messageIdMatch) {
      console.error('❌ No se pudo extraer el ID del mensaje');
      return;
    }

    const messageId = messageIdMatch[1];
    console.log('📧 Procesando mensaje de email:', messageId, 'Tipo de cambio:', changeType);

    // Obtener detalles del mensaje desde Microsoft Graph
    const messageDetails = await getEmailMessageDetails(messageId, subscription.user_id);

    if (!messageDetails) {
      console.error('❌ No se pudieron obtener detalles del mensaje');
      return;
    }

    // Procesar archivos adjuntos si existen
    if (messageDetails.hasAttachments && messageDetails.attachments) {
      for (const attachment of messageDetails.attachments) {
        if (attachment['@odata.type'] === '#microsoft.graph.fileAttachment') {
          const fileMessage = `Archivo compartido en OneDrive: ${attachment.name} - ${attachment.webUrl || 'Enlace no disponible'}`;
          await sendWhatsAppNotification(subscription.user_id, fileMessage);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error procesando mensaje de email:', error);
  }
}

/**
 * Obtiene detalles del evento de calendario desde Microsoft Graph
 * @param {string} eventId - ID del evento
 * @param {string} userId - ID del usuario
 * @returns {Object|null} Detalles del evento
 */
async function getCalendarEventDetails(eventId, userId) {
  try {
    // Obtener credenciales del usuario
    const { data: credentials, error } = await supabase
      .from('user_credentials')
      .select('microsoft_access_token')
      .eq('user_id', userId)
      .single();

    if (error || !credentials?.microsoft_access_token) {
      console.error('❌ No se encontraron credenciales de Microsoft para el usuario');
      return null;
    }

    // Hacer petición a Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.microsoft_access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('❌ Error obteniendo detalles del evento:', response.status);
      return null;
    }

    const eventData = await response.json();
    console.log('✅ Detalles del evento obtenidos:', eventData.subject);

    return eventData;

  } catch (error) {
    console.error('❌ Error obteniendo detalles del evento:', error);
    return null;
  }
}

/**
 * Obtiene detalles del mensaje de email desde Microsoft Graph
 * @param {string} messageId - ID del mensaje
 * @param {string} userId - ID del usuario
 * @returns {Object|null} Detalles del mensaje
 */
async function getEmailMessageDetails(messageId, userId) {
  try {
    // Obtener credenciales del usuario
    const { data: credentials, error } = await supabase
      .from('user_credentials')
      .select('microsoft_access_token')
      .eq('user_id', userId)
      .single();

    if (error || !credentials?.microsoft_access_token) {
      console.error('❌ No se encontraron credenciales de Microsoft para el usuario');
      return null;
    }

    // Hacer petición a Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${messageId}?$expand=attachments`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.microsoft_access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('❌ Error obteniendo detalles del mensaje:', response.status);
      return null;
    }

    const messageData = await response.json();
    console.log('✅ Detalles del mensaje obtenidos:', messageData.subject);

    return messageData;

  } catch (error) {
    console.error('❌ Error obteniendo detalles del mensaje:', error);
    return null;
  }
}

/**
 * Envía notificación por WhatsApp
 * @param {string} userId - ID del usuario
 * @param {string} message - Mensaje a enviar
 */
async function sendWhatsAppNotification(userId, message) {
  try {
    // Obtener empleados asociados al usuario
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .limit(10); // Limitar para evitar spam

    if (error || !employees || employees.length === 0) {
      console.error('❌ No se encontraron empleados para enviar WhatsApp');
      return;
    }

    const recipientIds = employees.map(emp => emp.id);

    // Enviar mensaje usando el servicio de comunicación
    await communicationService.sendWhatsAppMessage(recipientIds, message);

    console.log('✅ Mensaje de WhatsApp enviado:', message);

  } catch (error) {
    console.error('❌ Error enviando mensaje de WhatsApp:', error);
  }
}

/**
 * Procesa eventos de lifecycle de la suscripción
 * @param {Object} lifecycleEvent - Evento de lifecycle
 */
async function processLifecycleEvent(lifecycleEvent) {
  console.log('🔄 Procesando evento de lifecycle:', lifecycleEvent.lifecycleEvent);

  if (lifecycleEvent.lifecycleEvent === 'subscriptionRemoved') {
    // Marcar suscripción como inactiva
    const { error } = await supabase
      .from('microsoft365_subscriptions')
      .update({ is_active: false })
      .eq('subscription_id', lifecycleEvent.subscriptionId);

    if (error) {
      console.error('❌ Error actualizando suscripción:', error);
    } else {
      console.log('✅ Suscripción marcada como inactiva');
    }
  }
}

/**
 * Guarda la notificación en la base de datos
 * @param {Object} notification - Notificación original
 * @param {Object} subscription - Datos de la suscripción
 * @param {Object} eventDetails - Detalles del evento
 * @param {string} whatsappMessage - Mensaje enviado por WhatsApp
 */
async function saveMicrosoft365Notification(notification, subscription, eventDetails, whatsappMessage) {
  try {
    const { data, error } = await supabase
      .from('microsoft365_notifications')
      .insert({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        notification_data: notification,
        event_details: eventDetails,
        whatsapp_message: whatsappMessage,
        processed_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error guardando notificación:', error);
    } else {
      console.log('✅ Notificación guardada en BD');
    }
  } catch (error) {
    console.error('❌ Error guardando notificación:', error);
  }
}

/**
 * Formatea fecha para mensajes
 * @param {string} dateTime - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatDate(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea hora para mensajes
 * @param {string} dateTime - Fecha en formato ISO
 * @returns {string} Hora formateada
 */
function formatTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}