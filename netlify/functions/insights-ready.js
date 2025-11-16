/**
 * Webhook Receiver: Recibe notificaciones del microservicio
 * Endpoint: POST /api/webhook/insights-ready
 * 
 * Este endpoint es llamado por el microservicio cuando termina el análisis
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Handler del webhook
 */
exports.handler = async (event, context) => {
  // 1. VALIDAR MÉTODO
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // 2. VALIDAR CABECERAS
    const signature = event.headers['x-signature'] || event.headers['X-Signature'];
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];

    if (!signature) {
      console.warn('Webhook recibido sin firma de seguridad');
      return res.status(401).json({ error: 'Falta firma de seguridad' });
    }

    // 3. PARSEAR BODY
    const body = JSON.parse(event.body);
    const { event: eventType, timestamp, data } = body;

    // 4. VALIDAR FIRMA
    const expectedSignature = generateWebhookSignature(data);
    if (signature !== expectedSignature) {
      console.error('Firma de webhook inválida');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Firma inválida' })
      };
    }

    // 5. VALIDAR EVENTO
    if (eventType !== 'company.analysis.completed') {
      console.warn(`Evento no manejado: ${eventType}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Evento no manejado: ${eventType}` })
      };
    }

    // 6. PROCESAR DATOS
    const { companyId, companyName, insights, resultId } = data;

    console.log(`[WEBHOOK] Análisis recibido para ${companyName} (${companyId})`);

    // 7. GUARDAR NOTIFICACIÓN EN BASE DE DATOS
    const { error: notificationError } = await supabase
      .from('realtime_notifications')
      .insert({
        company_id: companyId,
        event_type: 'insights_ready',
        payload: {
          companyId,
          companyName,
          insights,
          resultId,
          timestamp
        },
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error guardando notificación:', notificationError);
    }

    // 8. RESPONDER AL MICROSERVICIO
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Webhook procesado exitosamente',
        companyId,
        processedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('[WEBHOOK] Error procesando:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error interno procesando webhook',
        message: error.message
      })
    };
  }
};

/**
 * Genera firma HMAC para validar webhook
 */
function generateWebhookSignature(payload) {
  try {
    const secret = process.env.WEBHOOK_SECRET || 'fallback-secret-key-change-in-production';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  } catch (error) {
    console.error('Error generando firma:', error);
    return 'no-signature';
  }
}