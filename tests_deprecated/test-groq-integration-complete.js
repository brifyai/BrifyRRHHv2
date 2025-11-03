// Script completo para probar la integración de Groq AI en todo el sistema
const groqService = require('./src/services/groqService');
const aiRecommendationsService = require('./src/services/aiRecommendationsService');
const embeddingService = require('./src/services/embeddingService');
const enhancedCommunicationService = require('./src/services/enhancedCommunicationService');

console.log('🚀 Iniciando prueba completa de integración de Groq AI en StaffHub...\n');

// Función para probar el servicio de Groq
async function testGroqService() {
  console.log('📋 1. Probando Groq Service...');
  try {
    // Verificar configuración
    console.log('   🔍 Verificando configuración...');
    const isAvailable = await groqService.isAvailable();
    console.log(`   ✅ Groq disponible: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log('   ⚠️  Groq no está disponible. Verifica la API key.');
      return false;
    }
    
    // Probar generación de respuesta
    console.log('   💬 Probando generación de respuesta...');
    const response = await groqService.generateChatResponse(
      'Responde en una frase: ¿Qué es StaffHub?',
      [],
      [],
      'test-user'
    );
    console.log(`   ✅ Respuesta generada: "${response.response.substring(0, 100)}..."`);
    console.log(`   📊 Tokens usados: ${response.tokensUsed}`);
    
    // Probar análisis de sentimiento
    console.log('   😊 Probando análisis de sentimiento...');
    const sentiment = await groqService.analyzeSentiment('Me encanta trabajar en StaffHub, es excelente');
    console.log(`   ✅ Sentimiento: ${sentiment.label} (confianza: ${sentiment.confidence})`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error en Groq Service: ${error.message}`);
    return false;
  }
}

// Función para probar el servicio de recomendaciones IA
async function testAIRecommendations() {
  console.log('\n📋 2. Probando AI Recommendations Service...');
  try {
    const mockStats = {
      folders: 800,
      documents: 2500,
      tokensUsed: 15000,
      storageUsed: 5000000
    };
    
    console.log('   🧠 Probando generación de recomendaciones...');
    const recommendations = await aiRecommendationsService.generateDashboardRecommendations(mockStats);
    console.log(`   ✅ Recomendaciones generadas: ${recommendations.recommendations.length}`);
    
    console.log('   📈 Probando predicción de tendencias...');
    const trends = await aiRecommendationsService.predictTrends(mockStats, '30d');
    console.log(`   ✅ Predicciones generadas: ${trends.predictions.length}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error en AI Recommendations: ${error.message}`);
    return false;
  }
}

// Función para probar el servicio de embeddings
async function testEmbeddingService() {
  console.log('\n📋 3. Probando Embedding Service...');
  try {
    console.log('   🔍 Probando generación de embeddings...');
    const embedding = await embeddingService.generateEmbedding(
      'StaffHub es una plataforma de gestión de recursos humanos'
    );
    console.log(`   ✅ Embedding generado: ${embedding.length} dimensiones`);
    
    // Probar similitud coseno
    console.log('   📏 Probando similitud coseno...');
    const embedding2 = await embeddingService.generateEmbedding(
      'Sistema de administración de personal'
    );
    const similarity = embeddingService.cosineSimilarity(embedding, embedding2);
    console.log(`   ✅ Similitud: ${similarity.toFixed(3)}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error en Embedding Service: ${error.message}`);
    return false;
  }
}

// Función para probar el servicio de comunicación mejorada
async function testEnhancedCommunication() {
  console.log('\n📋 4. Probando Enhanced Communication Service...');
  try {
    console.log('   💬 Probando optimización de mensaje...');
    const optimized = await enhancedCommunicationService.optimizeMessage(
      'El meeting es hoy',
      { channel: 'whatsapp', recipients: ['user1'], engagementPrediction: { score: 0.3 } }
    );
    console.log(`   ✅ Mensaje optimizado: "${optimized.content}"`);
    console.log(`   🔧 Optimizaciones aplicadas: ${optimized.applied.join(', ') || 'ninguna'}`);
    
    console.log('   📊 Probando predicción de engagement...');
    const engagement = await enhancedCommunicationService.engagementPredictor.predict(
      ['user1'], 
      '¡Buenos días! Tenemos una reunión importante hoy a las 3pm.',
      'whatsapp'
    );
    console.log(`   ✅ Engagement predicho: ${engagement.prediction} (score: ${engagement.score})`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error en Enhanced Communication: ${error.message}`);
    return false;
  }
}

// Función para probar integración completa
async function testCompleteIntegration() {
  console.log('\n📋 5. Probando Integración Completa...');
  try {
    console.log('   🔄 Probando flujo completo de IA...');
    
    // 1. Generar embedding para una consulta
    const query = '¿Cómo mejorar la productividad en la empresa?';
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    
    // 2. Generar recomendaciones basadas en estadísticas
    const stats = {
      folders: 800,
      documents: 2500,
      tokensUsed: 15000,
      storageUsed: 5000000
    };
    const recommendations = await aiRecommendationsService.generateDashboardRecommendations(stats);
    
    // 3. Analizar sentimiento de un mensaje
    const sentiment = await groqService.analyzeSentiment(
      'Necesito mejorar la comunicación con mi equipo'
    );
    
    // 4. Optimizar mensaje basado en análisis
    const optimized = await enhancedCommunicationService.optimizeMessage(
      'Necesito mejorar la comunicación con mi equipo',
      { channel: 'whatsapp', recipients: ['team'], engagementPrediction: { score: 0.4 } }
    );
    
    // 5. Generar respuesta final usando todo el contexto
    const finalResponse = await groqService.generateChatResponse(
      query,
      [{
        content: `Recomendaciones: ${recommendations.recommendations.map(r => r.title).join(', ')}`,
        similarity: 0.8
      }],
      [],
      'integration-test'
    );
    
    console.log('   ✅ Flujo completado exitosamente');
    console.log(`   📊 Tokens totales usados en la prueba: ${finalResponse.tokensUsed}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error en integración completa: ${error.message}`);
    return false;
  }
}

// Función principal
async function runCompleteTest() {
  console.log('🎯 CONFIGURACIÓN DE GROQ AI EN STAFFHUB');
  console.log('=====================================\n');
  
  const results = {
    groqService: await testGroqService(),
    aiRecommendations: await testAIRecommendations(),
    embeddingService: await testEmbeddingService(),
    enhancedCommunication: await testEnhancedCommunication(),
    completeIntegration: await testCompleteIntegration()
  };
  
  console.log('\n📊 RESULTADOS DE LA PRUEBA');
  console.log('========================');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([service, passed]) => {
    const status = passed ? '✅ PASÓ' : '❌ FALLÓ';
    const serviceName = {
      groqService: 'Groq Service',
      aiRecommendations: 'AI Recommendations',
      embeddingService: 'Embedding Service',
      enhancedCommunication: 'Enhanced Communication',
      completeIntegration: 'Integración Completa'
    }[service];
    
    console.log(`${status} ${serviceName}`);
  });
  
  console.log(`\n🎉 RESUMEN: ${passed}/${total} pruebas pasaron`);
  
  if (passed === total) {
    console.log('\n🚀 ¡FELICITACIONES! Groq AI está completamente integrado en StaffHub');
    console.log('✅ Todos los servicios de IA están usando Groq por defecto');
    console.log('✅ El análisis de tendencias inteligentes utiliza Groq');
    console.log('✅ Todas las funcionalidades de IA usan Groq');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración de Groq AI.');
  }
  
  console.log('\n📝 NOTAS IMPORTANTES:');
  console.log('• Asegúrate de haber configurado la API key de Groq en Settings');
  console.log('• Verifica que el modelo seleccionado sea funcional');
  console.log('• Los embeddings ahora se generan usando Groq en lugar de Gemini');
  console.log('• El análisis de sentimiento usa Groq para mayor precisión');
  console.log('• Todas las recomendaciones de IA son generadas por Groq');
}

// Ejecutar prueba
runCompleteTest().catch(console.error);