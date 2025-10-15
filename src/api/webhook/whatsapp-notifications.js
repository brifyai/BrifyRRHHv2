// Endpoint API para recibir notificaciones de WhatsApp
// Procesa mensajes entrantes y realiza análisis de sentimientos

import { supabase } from '../../lib/supabase.js';
import groqService from '../../services/groqService.js';

/**
 * Procesa notificaciones de WhatsApp recibidas desde WhatsApp Business API
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
    console.log('📱 Webhook recibido desde WhatsApp:', {
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

    // Procesar mensajes entrantes
    if (webhookData.entry && Array.isArray(webhookData.entry)) {
      for (const entry of webhookData.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messaging of entry.messaging) {
            await processWhatsAppMessage(messaging);
          }
        }
      }
    }

    // Respuesta exitosa (WhatsApp espera 200 OK)
    return res.status(200).json({
      success: true,
      message: 'Notificación procesada correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando webhook de WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa un mensaje individual de WhatsApp
 * @param {Object} messaging - Objeto de mensaje de WhatsApp
 */
async function processWhatsAppMessage(messaging) {
  try {
    console.log('🔄 Procesando mensaje de WhatsApp:', messaging);

    const { message, sender, recipient } = messaging;

    // Verificar que es un mensaje entrante con texto
    if (!message || !message.text || !sender || !sender.id) {
      console.log('⚠️ Mensaje no válido o sin texto');
      return;
    }

    const messageText = message.text.body;
    const senderId = sender.id;
    const timestamp = message.timestamp;

    console.log('📨 Mensaje entrante:', {
      sender: senderId,
      text: messageText,
      timestamp: timestamp
    });

    // Buscar usuario por número de teléfono de WhatsApp
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('whatsapp_number', senderId)
      .single();

    if (userError || !user) {
      console.log('⚠️ Usuario no encontrado para número WhatsApp:', senderId);
      // Aún así procesar el mensaje pero sin usuario específico
    }

    // Procesar el mensaje de forma asíncrona (no bloquear la respuesta del webhook)
    processMessageAsync(messageText, senderId, user?.id, user?.company_id, timestamp);

  } catch (error) {
    console.error('❌ Error procesando mensaje individual:', error);
  }
}

/**
 * Procesa el mensaje de forma asíncrona para no bloquear el webhook
 * @param {string} messageText - Texto del mensaje
 * @param {string} senderId - ID del remitente
 * @param {string} userId - ID del usuario (opcional)
 * @param {string} companyId - ID de la compañía (opcional)
 * @param {string} timestamp - Timestamp del mensaje
 */
async function processMessageAsync(messageText, senderId, userId, companyId, timestamp) {
  try {
    console.log('🤖 Iniciando análisis de sentimientos para mensaje de WhatsApp');

    // Analizar sentimiento usando GROQ
    const sentimentResult = await groqService.analyzeSentiment(messageText, userId);

    console.log('✅ Análisis de sentimientos completado:', sentimentResult);

    // Guardar el mensaje en la base de datos con el análisis de sentimientos
    await saveWhatsAppMessage(messageText, senderId, userId, companyId, timestamp, sentimentResult);

  } catch (error) {
    console.error('❌ Error en análisis de sentimientos:', error);

    // Guardar el mensaje sin análisis de sentimientos en caso de error
    try {
      await saveWhatsAppMessage(messageText, senderId, userId, companyId, timestamp, null);
    } catch (saveError) {
      console.error('❌ Error guardando mensaje sin análisis:', saveError);
    }
  }
}

/**
 * Guarda el mensaje de WhatsApp en la base de datos
 * @param {string} messageText - Texto del mensaje
 * @param {string} senderId - ID del remitente
 * @param {string} userId - ID del usuario
 * @param {string} companyId - ID de la compañía
 * @param {string} timestamp - Timestamp del mensaje
 * @param {Object|null} sentimentResult - Resultado del análisis de sentimientos
 */
async function saveWhatsAppMessage(messageText, senderId, userId, companyId, timestamp, sentimentResult) {
  try {
    const messageData = {
      message: messageText,
      channel: 'whatsapp',
      sender_id: senderId,
      user_id: userId,
      company_id: companyId,
      status: 'received',
      sent_at: new Date(parseInt(timestamp) * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Agregar datos de sentimiento si están disponibles
    if (sentimentResult) {
      messageData.sentiment_score = sentimentResult.score;
      messageData.sentiment_label = sentimentResult.label;
      // Nota: confidence no se guarda actualmente en BD, pero se puede agregar si es necesario
    }

    const { data, error } = await supabase
      .from('communication_logs')
      .insert(messageData);

    if (error) {
      console.error('❌ Error guardando mensaje de WhatsApp:', error);
    } else {
      console.log('✅ Mensaje de WhatsApp guardado en BD:', {
        id: data?.[0]?.id,
        sentiment: sentimentResult ? `${sentimentResult.label} (${sentimentResult.score})` : 'No analizado'
      });
    }
  } catch (error) {
    console.error('❌ Error guardando mensaje de WhatsApp:', error);
  }
}