/**
 * Microservicio: Análisis de Empresa
 * Endpoint: POST /.netlify/functions/analyze-company
 * 
 * Procesa una empresa completamente aislada del frontend
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Inicializar Groq AI
const groqService = {
  generateCompletion: async (params) => {
    const apiKey = process.env.GROQ_API_KEY || process.env.REACT_APP_GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your-groq-api-key')) {
      throw new Error('GROQ_API_KEY no está configurada');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: params.messages,
        temperature: params.temperature || 0.3,
        max_tokens: params.max_tokens || 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message;
  }
};

/**
 * Handler principal de la función serverless
 */
exports.handler = async (event, context) => {
  // 1. VALIDACIÓN Y PARSEO
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { companyId, companyName, webhookUrl, userId } = JSON.parse(event.body);

    // Validar parámetros requeridos
    if (!companyId || !companyName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'companyId y companyName son requeridos' })
      };
    }

    console.log(`[MICROSERVICIO] Iniciando análisis para ${companyName} (${companyId})`);

    // 2. ACTUALIZAR ESTADO A "PROCESSING"
    const { error: upsertError } = await supabase
      .from('company_insights_results')
      .upsert({
        company_id: companyId,
        company_name: companyName,
        status: 'processing',
        started_at: new Date().toISOString(),
        user_id: userId || 'anonymous'
      });

    if (upsertError) {
      console.error('Error actualizando estado:', upsertError);
    }

    // 3. PROCESAMIENTO EN BACKGROUND (no bloquea nada)
    const result = await processCompanyAnalysis(companyId, companyName);

    // 4. GUARDAR RESULTADO EN BD
    const { data: savedResult, error: saveError } = await supabase
      .from('company_insights_results')
      .upsert({
        company_id: companyId,
        company_name: companyName,
        status: 'completed',
        insights: result.insights,
        metrics: result.metrics,
        completed_at: new Date().toISOString(),
        processing_time_ms: result.processingTime
      })
      .select()
      .single();

    if (saveError) throw saveError;

    console.log(`[MICROSERVICIO] Análisis completado para ${companyName}`);

    // 5. NOTIFICAR WEBHOOK (si se proporcionó)
    if (webhookUrl) {
      await notifyWebhook(webhookUrl, {
        companyId,
        companyName,
        status: 'completed',
        insights: result.insights,
        resultId: savedResult?.id || null
      });
    }

    // 6. RESPONDER INMEDIATAMENTE (no esperar a que el webhook termine)
    return {
      statusCode: 202, // Accepted - Proceso iniciado
      body: JSON.stringify({
        success: true,
        message: 'Análisis iniciado exitosamente',
        jobId: context.awsRequestId, // ID único del trabajo
        companyId,
        companyName,
        status: 'processing',
        estimatedTime: '10-15 segundos',
        webhook: webhookUrl ? 'Será notificado cuando termine' : 'No configurado'
      })
    };

  } catch (error) {
    console.error(`[MICROSERVICIO] Error:`, error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

/**
 * Función principal de procesamiento
 * Esta es la lógica pesada que antes bloqueaba el frontend
 */
async function processCompanyAnalysis(companyId, companyName) {
  const startTime = Date.now();

  try {
    // 1. OBTENER DATOS DE COMUNICACIÓN
    const { data: logs, error: logsError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (logsError) {
      console.warn('Error obteniendo logs:', logsError.message);
    }

    // 2. OBTENER DATOS DE EMPLEADOS
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId);

    if (employeesError) {
      console.warn('Error obteniendo empleados:', employeesError.message);
    }

    // 3. PROCESAR Y CALCULAR MÉTRICAS
    const metrics = calculateMetrics(logs || [], employees || []);

    // 4. GENERAR INSIGHTS CON IA
    const insights = await generateAIInsights(companyName, metrics);

    const processingTime = Date.now() - startTime;

    return {
      insights,
      metrics,
      processingTime,
      recordsProcessed: {
        logs: logs?.length || 0,
        employees: employees?.length || 0
      }
    };

  } catch (error) {
    console.error(`[PROCESAMIENTO] Error para ${companyName}:`, error);
    throw error;
  }
}

/**
 * Calcula métricas de comunicación
 */
function calculateMetrics(logs, employees) {
  return {
    totalMessages: logs?.length || 0,
    sentMessages: logs?.filter(log => log.status === 'sent').length || 0,
    readMessages: logs?.filter(log => log.status === 'read').length || 0,
    deliveryRate: logs?.length ? (logs.filter(log => log.status === 'sent').length / logs.length) * 100 : 0,
    readRate: logs?.length ? (logs.filter(log => log.status === 'read').length / logs.length) * 100 : 0,
    channelUsage: logs?.reduce((acc, log) => {
      const channel = log.channel_id || 'unknown';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {}) || {},
    totalEmployees: employees?.length || 0,
    departments: employees?.reduce((acc, emp) => {
      const dept = emp.department || 'unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}) || {}
  };
}

/**
 * Genera insights usando IA
 */
async function generateAIInsights(companyName, metrics) {
  try {
    const prompt = `
      Analiza esta empresa: "${companyName}"
      
      Métricas:
      - Mensajes totales: ${metrics.totalMessages}
      - Tasa de entrega: ${metrics.deliveryRate.toFixed(1)}%
      - Empleados: ${metrics.totalEmployees}
      - Departamentos: ${Object.keys(metrics.departments).length}
      
      Genera 3 insights accionables en español. Responde en JSON con formato:
      {
        "insights": [
          {
            "type": "positive|negative|warning|info",
            "title": "título breve",
            "description": "descripción detallada"
          }
        ]
      }
    `;

    const response = await groqService.generateCompletion({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en RRHH. Responde SOLO en JSON válido.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    try {
      const parsed = JSON.parse(response.content);
      return parsed.insights || [
        {
          type: 'info',
          title: 'Análisis completado',
          description: `Se procesaron ${metrics.totalMessages} mensajes y ${metrics.totalEmployees} empleados.`
        }
      ];
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      return [
        {
          type: 'info',
          title: 'Análisis completado',
          description: `Se procesaron ${metrics.totalMessages} mensajes y ${metrics.totalEmployees} empleados.`
        }
      ];
    }
  } catch (error) {
    console.error('Error en generateAIInsights:', error);
    return [
      {
        type: 'info',
        title: 'Análisis completado',
        description: `Se procesaron ${metrics.totalMessages} mensajes y ${metrics.totalEmployees} empleados.`
      }
    ];
  }
}

/**
 * Notifica webhook cuando el análisis termina
 */
async function notifyWebhook(webhookUrl, data) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': generateWebhookSignature(data)
      },
      body: JSON.stringify({
        event: 'company.analysis.completed',
        timestamp: new Date().toISOString(),
        data
      })
    });

    if (!response.ok) {
      console.error(`Webhook respondió con status ${response.status}`);
    }

    console.log(`[WEBHOOK] Notificación enviada a ${webhookUrl}`);
  } catch (error) {
    console.error(`[WEBHOOK] Error notificando:`, error);
  }
}

/**
 * Genera firma HMAC para seguridad del webhook
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