// Endpoint API para recibir notificaciones de Telegram
// Procesa mensajes entrantes y realiza análisis de sentimientos

import { supabase } from '../../lib/supabase.js';
import groqService from '../../services/groqService.js';

/**
 * Procesa notificaciones de Telegram recibidas desde Telegram Bot API
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
    console.log('✈️ Webhook recibido desde Telegram:', {
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

    // Procesar updates de Telegram
    if (webhookData.update_id) {
      // Es un update individual
      await processTelegramUpdate(webhookData);
    } else if (Array.isArray(webhookData)) {
      // Es un array de updates
      for (const update of webhookData) {
        await processTelegramUpdate(update);
      }
    }

    // Respuesta exitosa (Telegram espera 200 OK)
    return res.status(200).json({
      success: true,
      message: 'Notificación procesada correctamente'
    });

  } catch (error) {
    console.error('💥 Error procesando webhook de Telegram:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

/**
 * Procesa un update individual de Telegram
 * @param {Object} update - Update de Telegram
 */
async function processTelegramUpdate(update) {
  try {
    console.log('🔄 Procesando update de Telegram:', update);

    // Verificar si es un mensaje
    if (!update.message) {
      console.log('⚠️ Update no es un mensaje');
      return;
    }

    const message = update.message;

    // Verificar que tiene texto
    if (!message.text) {
      console.log('⚠️ Mensaje sin texto');
      return;
    }

    const messageText = message.text;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const timestamp = message.date;

    console.log('📨 Mensaje entrante de Telegram:', {
      chatId: chatId,
      userId: userId,
      text: messageText,
      timestamp: timestamp
    });

    // Buscar usuario por telegram_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('telegram_id', userId.toString())
      .single();

    if (userError || !user) {
      console.log('⚠️ Usuario no encontrado para telegram_id:', userId);
      // Aún así procesar el mensaje pero sin usuario específico
    }

    // Procesar el mensaje de forma asíncrona (no bloquear la respuesta del webhook)
    processMessageAsync(messageText, chatId, userId, user?.id, user?.company_id, timestamp);

  } catch (error) {
    console.error('❌ Error procesando update individual:', error);
  }
}

/**
 * Procesa el mensaje de forma asíncrona para no bloquear el webhook
 * @param {string} messageText - Texto del mensaje
 * @param {string} chatId - ID del chat
 * @param {string} telegramUserId - ID del usuario de Telegram
 * @param {string} userId - ID del usuario en el sistema (opcional)
 * @param {string} companyId - ID de la compañía (opcional)
 * @param {number} timestamp - Timestamp del mensaje
 */
async function processMessageAsync(messageText, chatId, telegramUserId, userId, companyId, timestamp) {
  try {
    console.log('🤖 Iniciando análisis de sentimientos para mensaje de Telegram');

    // Analizar sentimiento usando GROQ
    const sentimentResult = await groqService.analyzeSentiment(messageText, userId);

    console.log('✅ Análisis de sentimientos completado:', sentimentResult);

    // Guardar el mensaje en la base de datos con el análisis de sentimientos
    await saveTelegramMessage(messageText, chatId, telegramUserId, userId, companyId, timestamp, sentimentResult);

  } catch (error) {
    console.error('❌ Error en análisis de sentimientos:', error);

    // Guardar el mensaje sin análisis de sentimientos en caso de error
    try {
      await saveTelegramMessage(messageText, chatId, telegramUserId, userId, companyId, timestamp, null);
    } catch (saveError) {
      console.error('❌ Error guardando mensaje sin análisis:', saveError);
    }
  }
}

/**
 * Guarda el mensaje de Telegram en la base de datos
 * @param {string} messageText - Texto del mensaje
 * @param {string} chatId - ID del chat
 * @param {string} telegramUserId - ID del usuario de Telegram
 * @param {string} userId - ID del usuario en el sistema
 * @param {string} companyId - ID de la compañía
 * @param {number} timestamp - Timestamp del mensaje
 * @param {Object|null} sentimentResult - Resultado del análisis de sentimientos
 */
async function saveTelegramMessage(messageText, chatId, telegramUserId, userId, companyId, timestamp, sentimentResult) {
  try {
    const messageData = {
      message: messageText,
      channel: 'telegram',
      sender_id: telegramUserId.toString(),
      user_id: userId,
      company_id: companyId,
      status: 'received',
      sent_at: new Date(timestamp * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Agregar metadatos específicos de Telegram
      metadata: {
        chat_id: chatId.toString(),
        telegram_user_id: telegramUserId.toString()
      }
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
      console.error('❌ Error guardando mensaje de Telegram:', error);
    } else {
      console.log('✅ Mensaje de Telegram guardado en BD:', {
        id: data?.[0]?.id,
        sentiment: sentimentResult ? `${sentimentResult.label} (${sentimentResult.score})` : 'No analizado'
      });
    }
  } catch (error) {
    console.error('❌ Error guardando mensaje de Telegram:', error);
  }
}