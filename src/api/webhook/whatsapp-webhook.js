/**
 * Webhook Listener para WhatsApp Business API
 * 
 * Este endpoint recibe webhooks de Meta para procesar mensajes entrantes,
 * actualizaciones de estado y otros eventos de WhatsApp.
 */

import { supabase } from '../../lib/supabaseClient.js';

/**
 * Verifica el webhook con Meta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function verifyWebhook(req, res) {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Webhook verification request:', { mode, token, challenge });

    // Buscar configuración de WhatsApp con este verify_token
    const { data: config, error } = await supabase
      .from('whatsapp_configs')
      .select('*')
      .eq('webhook_verify_token', token)
      .eq('is_active', true)
      .single();

    if (error || !config) {
      console.log('Webhook verification failed: Invalid token');
      return res.status(403).send('Verification failed');
    }

    if (mode && token) {
      if (mode === 'subscribe' && token === config.webhook_verify_token) {
        console.log('Webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.log('Webhook verification failed: Mode or token mismatch');
        return res.status(403).send('Verification failed');
      }
    }

    res.status(400).send('Bad request');
  } catch (error) {
    console.error('Webhook verification error:', error);
    res.status(500).send('Internal server error');
  }
}

/**
 * Procesa eventos entrantes de WhatsApp
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function processWebhook(req, res) {
  try {
    console.log('Received WhatsApp webhook:', JSON.stringify(req.body, null, 2));

    const data = req.body;
    
    // Verificar si es un webhook de WhatsApp
    if (data.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp webhook');
      return res.status(200).send('OK');
    }

    // Procesar cada entrada
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessage(change.value);
        } else if (change.field === 'message_template_status_update') {
          await processTemplateStatusUpdate(change.value);
        } else if (change.field === 'account_update') {
          await processAccountUpdate(change.value);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal server error');
  }
}

/**
 * Procesa mensajes entrantes
 * @param {Object} messageData - Datos del mensaje
 */
async function processMessage(messageData) {
  try {
    const { messages, contacts, metadata } = messageData;
    
    if (!messages || messages.length === 0) {
      console.log('No messages to process');
      return;
    }

    for (const message of messages) {
      const { from, id, timestamp, type } = message;
      
      // Buscar configuración activa para este número de teléfono
      const { data: config, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('phone_number_id', metadata.phone_number_id)
        .eq('is_active', true)
        .single();

      if (error || !config) {
        console.log('No active WhatsApp config found for phone number:', metadata.phone_number_id);
        continue;
      }

      // Registrar el mensaje en la base de datos
      const messageRecord = {
        whatsapp_config_id: config.id,
        message_id: id,
        sender_phone: from,
        recipient_phone: config.display_phone_number,
        message_type: type,
        direction: 'inbound',
        content: null,
        metadata: message,
        status: 'received',
        received_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      // Extraer contenido según el tipo de mensaje
      if (type === 'text') {
        messageRecord.content = message.text.body;
      } else if (type === 'image') {
        messageRecord.content = `[Image] ${message.image.caption || ''}`;
        messageRecord.media_url = message.image.id;
      } else if (type === 'audio') {
        messageRecord.content = '[Audio message]';
        messageRecord.media_url = message.audio.id;
      } else if (type === 'video') {
        messageRecord.content = `[Video] ${message.video.caption || ''}`;
        messageRecord.media_url = message.video.id;
      } else if (type === 'document') {
        messageRecord.content = `[Document] ${message.document.filename || ''}`;
        messageRecord.media_url = message.document.id;
      } else if (type === 'interactive') {
        messageRecord.content = `[Interactive] ${JSON.stringify(message.interactive)}`;
      } else if (type === 'button') {
        messageRecord.content = `[Button] ${message.button.text}`;
      } else if (type === 'location') {
        messageRecord.content = `[Location] ${message.location.latitude}, ${message.location.longitude}`;
      } else if (type === 'contacts') {
        messageRecord.content = `[Contact] ${message.contacts[0]?.name?.formatted_name || 'Unknown'}`;
      } else if (type === 'order') {
        messageRecord.content = `[Order] ${message.order.id || 'Unknown'}`;
      } else if (type === 'system') {
        messageRecord.content = `[System] ${message.system.body || ''}`;
      } else if (type === 'unsupported') {
        messageRecord.content = '[Unsupported message type]';
      }

      // Guardar en la base de datos
      const { error: insertError } = await supabase
        .from('whatsapp_logs')
        .insert(messageRecord);

      if (insertError) {
        console.error('Error saving message:', insertError);
        continue;
      }

      // Actualizar contador de mensajes
      await updateMessageCount(config.id, 'inbound');

      // Procesar respuesta automática si está configurada
      if (config.auto_reply_enabled && type === 'text') {
        await processAutoReply(config, message, contacts);
      }

      console.log('Message processed successfully:', id);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

/**
 * Procesa actualizaciones de estado de plantillas
 * @param {Object} templateData - Datos de la plantilla
 */
async function processTemplateStatusUpdate(templateData) {
  try {
    console.log('Template status update:', templateData);
    
    // Aquí puedes implementar lógica para manejar cambios en el estado de las plantillas
    // Por ejemplo, cuando una plantilla es aprobada o rechazada
    
    const { message_template_id, event, status } = templateData;
    
    // Actualizar estado de la plantilla en la base de datos
    const { error } = await supabase
      .from('whatsapp_templates')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('template_id', message_template_id);

    if (error) {
      console.error('Error updating template status:', error);
    } else {
      console.log('Template status updated successfully:', message_template_id);
    }
  } catch (error) {
    console.error('Error processing template status update:', error);
  }
}

/**
 * Procesa actualizaciones de cuenta
 * @param {Object} accountData - Datos de la cuenta
 */
async function processAccountUpdate(accountData) {
  try {
    console.log('Account update:', accountData);
    
    // Aquí puedes implementar lógica para manejar cambios en la cuenta
    // Por ejemplo, cambios en el estado del número de teléfono
    
    const { phone_number_id, display_phone_number, quality_rating } = accountData;
    
    // Actualizar información del número de teléfono
    const { error } = await supabase
      .from('whatsapp_configs')
      .update({ 
        display_phone_number,
        quality_rating,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number_id', phone_number_id);

    if (error) {
      console.error('Error updating account info:', error);
    } else {
      console.log('Account info updated successfully:', phone_number_id);
    }
  } catch (error) {
    console.error('Error processing account update:', error);
  }
}

/**
 * Procesa respuestas automáticas
 * @param {Object} config - Configuración de WhatsApp
 * @param {Object} message - Mensaje entrante
 * @param {Array} contacts - Contactos del mensaje
 */
async function processAutoReply(config, message, contacts) {
  try {
    if (!config.auto_reply_message) {
      return;
    }

    // Personalizar mensaje con variables
    let replyMessage = config.auto_reply_message;
    const contactName = contacts?.[0]?.profile?.name || 'Cliente';
    
    replyMessage = replyMessage.replace('{name}', contactName);
    replyMessage = replyMessage.replace('{company}', config.company_name || 'nosotros');
    replyMessage = replyMessage.replace('{time}', new Date().toLocaleTimeString('es-ES'));

    // Enviar respuesta automática
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.from,
        type: 'text',
        text: {
          body: replyMessage
        }
      })
    });

    if (response.ok) {
      const responseData = await response.json();
      
      // Registrar la respuesta automática
      const { error: logError } = await supabase
        .from('whatsapp_logs')
        .insert({
          whatsapp_config_id: config.id,
          message_id: responseData.messages[0].id,
          sender_phone: config.display_phone_number,
          recipient_phone: message.from,
          message_type: 'text',
          direction: 'outbound',
          content: replyMessage,
          metadata: { auto_reply: true },
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.error('Error logging auto-reply:', logError);
      }

      // Actualizar contador de mensajes salientes
      await updateMessageCount(config.id, 'outbound');
      
      console.log('Auto-reply sent successfully');
    } else {
      console.error('Error sending auto-reply:', await response.text());
    }
  } catch (error) {
    console.error('Error processing auto-reply:', error);
  }
}

/**
 * Actualiza el contador de mensajes
 * @param {string} configId - ID de la configuración
 * @param {string} direction - Dirección del mensaje (inbound/outbound)
 */
async function updateMessageCount(configId, direction) {
  try {
    const field = direction === 'inbound' ? 'messages_received_today' : 'messages_sent_today';
    
    const { error } = await supabase
      .from('whatsapp_configs')
      .update({ [field]: supabase.raw(`${field} + 1`) })
      .eq('id', configId);

    if (error) {
      console.error('Error updating message count:', error);
    }
  } catch (error) {
    console.error('Error in updateMessageCount:', error);
  }
}

/**
 * Manejador principal del webhook (para uso en Express)
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    return verifyWebhook(req, res);
  } else if (req.method === 'POST') {
    return processWebhook(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}