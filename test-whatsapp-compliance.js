/**
 * Script de prueba para validar el cumplimiento de políticas de WhatsApp Business
 * 
 * Este script prueba:
 * - Verificación de consentimiento de usuarios
 * - Validación de ventana de 24 horas
 * - Validación de contenido de mensajes
 * - Monitoreo de calidad de números
 * - Límites dinámicos de envío
 * - Registro de eventos de cumplimiento
 */

import whatsappComplianceService from './src/services/whatsappComplianceService.js';
import { supabase } from './src/lib/supabase.js';

// Configuración de prueba
const TEST_COMPANY_ID = 1;
const TEST_USER_PHONE = '+56912345678';
const TEST_MESSAGE = 'Este es un mensaje de prueba para validar el cumplimiento de políticas';

// Colores para salida en consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logTest(message) {
  log(`🧪 ${message}`, 'cyan');
}

/**
 * Suite de pruebas completas para el sistema de cumplimiento
 */
class WhatsAppComplianceTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    logTest(`Ejecutando: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        logSuccess(`${testName}: ${result.message || 'PASÓ'}`);
        this.testResults.passed++;
      } else {
        logError(`${testName}: ${result.message || 'FALLÓ'}`);
        this.testResults.failed++;
      }
      return result;
    } catch (error) {
      logError(`${testName}: Error - ${error.message}`);
      this.testResults.failed++;
      return { success: false, message: error.message };
    }
  }

  async testConsentManagement() {
    logInfo('\n=== PRUEBAS DE GESTIÓN DE CONSENTIMIENTO ===');

    // Test 1: Registrar consentimiento
    await this.runTest('Registrar consentimiento de usuario', async () => {
      const consent = await whatsappComplianceService.recordUserConsent(
        TEST_COMPANY_ID,
        TEST_USER_PHONE,
        'web_form',
        {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Suite',
          consentText: 'Acepto recibir mensajes de WhatsApp'
        }
      );
      
      if (consent && consent.id) {
        return { 
          success: true, 
          message: `Consentimiento registrado con ID: ${consent.id}` 
        };
      }
      return { success: false, message: 'No se pudo registrar el consentimiento' };
    });

    // Test 2: Verificar consentimiento activo
    await this.runTest('Verificar consentimiento activo', async () => {
      const hasConsent = await whatsappComplianceService.hasActiveConsent(
        TEST_COMPANY_ID,
        TEST_USER_PHONE
      );
      
      return {
        success: hasConsent,
        message: hasConsent ? 'Consentimiento activo verificado' : 'No hay consentimiento activo'
      };
    });

    // Test 3: Verificar consentimiento expirado
    await this.runTest('Verificar consentimiento expirado', async () => {
      const expiredPhone = '+56987654321';
      const hasConsent = await whatsappComplianceService.hasActiveConsent(
        TEST_COMPANY_ID,
        expiredPhone
      );
      
      return {
        success: !hasConsent,
        message: hasConsent ? 'Inesperado: hay consentimiento para usuario no registrado' : 'Correcto: no hay consentimiento para usuario no registrado'
      };
    });
  }

  async test24HourWindow() {
    logInfo('\n=== PRUEBAS DE VENTANA DE 24 HORAS ===');

    // Test 1: Registrar interacción del usuario
    await this.runTest('Registrar interacción de usuario', async () => {
      const interaction = await whatsappComplianceService.recordUserInteraction(
        TEST_COMPANY_ID,
        TEST_USER_PHONE,
        'message_received',
        {
          messageId: 'test_msg_123',
          messageType: 'text',
          content: 'Mensaje de prueba'
        }
      );
      
      if (interaction && interaction.id) {
        return { 
          success: true, 
          message: `Interacción registrada con ID: ${interaction.id}` 
        };
      }
      return { success: false, message: 'No se pudo registrar la interacción' };
    });

    // Test 2: Verificar ventana de 24 horas (dentro de la ventana)
    await this.runTest('Verificar ventana de 24 horas (dentro)', async () => {
      const windowStatus = await whatsappComplianceService.check24HourWindow(
        TEST_COMPANY_ID,
        TEST_USER_PHONE
      );
      
      return {
        success: windowStatus.inWindow,
        message: windowStatus.inWindow 
          ? 'Usuario dentro de ventana de 24 horas' 
          : `Usuario fuera de ventana. Última interacción: ${windowStatus.hoursSinceInteraction}h`
      };
    });

    // Test 3: Verificar ventana de 24 horas (fuera de la ventana)
    await this.runTest('Verificar ventana de 24 horas (fuera)', async () => {
      const oldPhone = '+56911111111';
      const windowStatus = await whatsappComplianceService.check24HourWindow(
        TEST_COMPANY_ID,
        oldPhone
      );
      
      return {
        success: !windowStatus.inWindow && windowStatus.requiresTemplate,
        message: windowStatus.requiresTemplate 
          ? 'Correcto: se requiere plantilla para usuario sin interacción reciente' 
          : 'Inesperado: no se requiere plantilla'
      };
    });
  }

  async testContentValidation() {
    logInfo('\n=== PRUEBAS DE VALIDACIÓN DE CONTENIDO ===');

    // Test 1: Validar contenido permitido
    await this.runTest('Validar contenido permitido', async () => {
      const validation = await whatsappComplianceService.validateMessageContent(
        'Hola, este es un mensaje de prueba válido',
        'text'
      );
      
      return {
        success: validation.valid,
        message: validation.valid 
          ? 'Contenido válido' 
          : `Contenido inválido: ${validation.reason}`
      };
    });

    // Test 2: Validar contenido con spam
    await this.runTest('Validar contenido con spam', async () => {
      const spamContent = '¡GANASTE! Haz clic aquí ahora mismo!!! http://spam.com';
      const validation = await whatsappComplianceService.validateMessageContent(
        spamContent,
        'text'
      );
      
      return {
        success: !validation.valid,
        message: !validation.valid 
          ? 'Correcto: contenido detectado como spam' 
          : 'Inesperado: contenido spam no fue detectado'
      };
    });

    // Test 3: Validar contenido con palabras prohibidas
    await this.runTest('Validar contenido con palabras prohibidas', async () => {
      const prohibitedContent = 'Compra ahora con tarjeta de crédito sin intereses';
      const validation = await whatsappComplianceService.validateMessageContent(
        prohibitedContent,
        'text'
      );
      
      return {
        success: !validation.valid,
        message: !validation.valid 
          ? 'Correcto: contenido con palabras prohibidas detectado' 
          : 'Inesperado: palabras prohibidas no detectadas'
      };
    });
  }

  async testQualityMonitoring() {
    logInfo('\n=== PRUEBAS DE MONITOREO DE CALIDAD ===');

    // Test 1: Obtener métricas de calidad
    await this.runTest('Obtener métricas de calidad', async () => {
      const metrics = await whatsappComplianceService.getQualityMetrics(TEST_COMPANY_ID);
      
      if (metrics && typeof metrics.currentScore === 'number') {
        return { 
          success: true, 
          message: `Métricas obtenidas. Calidad actual: ${metrics.currentScore}%` 
        };
      }
      return { success: false, message: 'No se pudieron obtener las métricas de calidad' };
    });

    // Test 2: Verificar límites dinámicos
    await this.runTest('Verificar límites dinámicos', async () => {
      const qualityCheck = await whatsappComplianceService.checkQualityAndLimits(TEST_COMPANY_ID);
      
      if (qualityCheck && qualityCheck.limits) {
        return { 
          success: true, 
          message: `Límites dinámicos verificados. Diario: ${qualityCheck.limits.dailyLimit}, Por hora: ${qualityCheck.limits.hourlyLimit}` 
        };
      }
      return { success: false, message: 'No se pudieron verificar los límites dinámicos' };
    });
  }

  async testComplianceEvents() {
    logInfo('\n=== PRUEBAS DE EVENTOS DE CUMPLIMIENTO ===');

    // Test 1: Registrar evento de cumplimiento
    await this.runTest('Registrar evento de cumplimiento', async () => {
      const event = await whatsappComplianceService.logComplianceEvent({
        companyId: TEST_COMPANY_ID,
        eventType: 'consent_recorded',
        details: {
          userPhone: TEST_USER_PHONE,
          consentMethod: 'test_suite',
          timestamp: new Date().toISOString()
        }
      });
      
      if (event && event.id) {
        return { 
          success: true, 
          message: `Evento registrado con ID: ${event.id}` 
        };
      }
      return { success: false, message: 'No se pudo registrar el evento' };
    });

    // Test 2: Obtener estado de cumplimiento
    await this.runTest('Obtener estado de cumplimiento', async () => {
      const status = await whatsappComplianceService.getComplianceStatus(TEST_COMPANY_ID);
      
      if (status && typeof status.overallScore === 'number') {
        return { 
          success: true, 
          message: `Estado de cumplimiento obtenido. Puntuación: ${status.overallScore}%` 
        };
      }
      return { success: false, message: 'No se pudo obtener el estado de cumplimiento' };
    });
  }

  async testOptOutHandling() {
    logInfo('\n=== PRUEBAS DE MANEJO DE OPT-OUT ===');

    // Test 1: Procesar solicitud de opt-out
    await this.runTest('Procesar solicitud de opt-out', async () => {
      const result = await whatsappComplianceService.handleOptOut(
        TEST_COMPANY_ID,
        TEST_USER_PHONE,
        'STOP',
        {
          timestamp: new Date().toISOString(),
          method: 'whatsapp_message'
        }
      );
      
      if (result && result.success) {
        return { 
          success: true, 
          message: `Opt-out procesado. Consentimiento revocado: ${result.consentRevoked}` 
        };
      }
      return { success: false, message: 'No se pudo procesar el opt-out' };
    });

    // Test 2: Verificar consentimiento después de opt-out
    await this.runTest('Verificar consentimiento después de opt-out', async () => {
      const hasConsent = await whatsappComplianceService.hasActiveConsent(
        TEST_COMPANY_ID,
        TEST_USER_PHONE
      );
      
      return {
        success: !hasConsent,
        message: !hasConsent 
          ? 'Correcto: consentimiento revocado después de opt-out' 
          : 'Inesperado: consentimiento aún activo después de opt-out'
      };
    });
  }

  async testCompleteMessageFlow() {
    logInfo('\n=== PRUEBA INTEGRAL DE FLUJO DE MENSAJES ===');

    await this.runTest('Flujo completo de mensaje con cumplimiento', async () => {
      // 1. Registrar consentimiento
      const testPhone = '+56999999999';
      await whatsappComplianceService.recordUserConsent(
        TEST_COMPANY_ID,
        testPhone,
        'test_flow'
      );

      // 2. Registrar interacción
      await whatsappComplianceService.recordUserInteraction(
        TEST_COMPANY_ID,
        testPhone,
        'message_received'
      );

      // 3. Verificar consentimiento
      const hasConsent = await whatsappComplianceService.hasActiveConsent(
        TEST_COMPANY_ID,
        testPhone
      );

      // 4. Verificar ventana
      const windowStatus = await whatsappComplianceService.check24HourWindow(
        TEST_COMPANY_ID,
        testPhone
      );

      // 5. Validar contenido
      const contentValidation = await whatsappComplianceService.validateMessageContent(
        'Mensaje de prueba válido',
        'text'
      );

      // 6. Verificar calidad y límites
      const qualityCheck = await whatsappComplianceService.checkQualityAndLimits(
        TEST_COMPANY_ID
      );

      const allChecksPass = hasConsent && 
                           windowStatus.inWindow && 
                           contentValidation.valid && 
                           qualityCheck.success;

      return {
        success: allChecksPass,
        message: allChecksPass 
          ? 'Flujo completo validado correctamente' 
          : 'El flujo completo falló en alguna validación'
      };
    });
  }

  async runAllTests() {
    log('🚀 INICIANDO PRUEBAS DE CUMPLIMIENTO DE WHATSAPP BUSINESS', 'cyan');
    log('='.repeat(60), 'cyan');

    try {
      // Ejecutar todas las suites de pruebas
      await this.testConsentManagement();
      await this.test24HourWindow();
      await this.testContentValidation();
      await this.testQualityMonitoring();
      await this.testComplianceEvents();
      await this.testOptOutHandling();
      await this.testCompleteMessageFlow();

      // Mostrar resumen
      log('\n' + '='.repeat(60), 'cyan');
      log('📊 RESUMEN DE PRUEBAS', 'cyan');
      log('='.repeat(60), 'cyan');
      
      log(`Total de pruebas: ${this.testResults.total}`);
      logSuccess(`Pruebas pasadas: ${this.testResults.passed}`);
      
      if (this.testResults.failed > 0) {
        logError(`Pruebas fallidas: ${this.testResults.failed}`);
      }
      
      const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
      log(`Tasa de éxito: ${successRate}%`);

      if (this.testResults.failed === 0) {
        logSuccess('\n🎉 TODAS LAS PRUEBAS PASARON - El sistema cumple con las políticas de WhatsApp Business');
      } else {
        logWarning('\n⚠️  ALGUNAS PRUEBAS FALLARON - Revisar la implementación del cumplimiento');
      }

    } catch (error) {
      logError(`Error ejecutando las pruebas: ${error.message}`);
    }
  }
}

// Ejecutar pruebas si este script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new WhatsAppComplianceTester();
  tester.runAllTests().catch(console.error);
}

export default WhatsAppComplianceTester;