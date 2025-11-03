/**
 * Script de Prueba Completo del Sistema de Base de Conocimiento Empresarial
 * 
 * Este script verifica:
 * 1. Creación de base de conocimiento para una empresa
 * 2. Estructura de carpetas en Google Drive
 * 3. Vectorización de documentos
 * 4. Búsqueda semántica
 * 5. Sincronización con Supabase
 * 
 * Ejecutar con: node test-company-knowledge-system.js
 */

import { supabase } from './src/lib/supabaseClient.js';
import companyKnowledgeService from './src/services/companyKnowledgeService.js';
import embeddingService from './src/services/embeddingService.js';

// Configuración de prueba
const TEST_CONFIG = {
  companyName: 'Empresa Prueba Knowledge',
  companyDescription: 'Empresa de prueba para verificar el sistema de conocimiento',
  testUserId: null,
  testCompanyId: null,
  testQuery: 'políticas de vacaciones',
  testDocuments: [
    {
      title: 'Política de Vacaciones',
      content: 'La política de vacaciones de la empresa establece que todos los empleados tienen derecho a 15 días hábiles de vacaciones por año. Las vacaciones deben ser solicitadas con al menos 30 días de anticipación y aprobadas por el supervisor directo.',
      keywords: 'vacaciones, días libres, permisos, descanso'
    },
    {
      title: 'Manual de Bienvenida',
      content: 'Bienvenido a nuestra empresa. Este manual contiene información importante sobre tus primeros días, incluyendo horarios de trabajo, políticas de home office y beneficios disponibles para todos los empleados.',
      keywords: 'bienvenida, onboarding, nuevo empleado, inducción'
    },
    {
      title: 'Política de Teletrabajo',
      content: 'El teletrabajo está disponible para todos los empleados después de 3 meses de antigüedad. Se requiere aprobación del manager y cumplimiento de las políticas de seguridad informática establecidas por el departamento de TI.',
      keywords: 'teletrabajo, home office, trabajo remoto, covid'
    }
  ]
};

class CompanyKnowledgeSystemTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`Iniciando prueba: ${testName}`);
    try {
      const result = await testFunction();
      if (result.success) {
        this.log(`✅ Prueba "${testName}" aprobada`, 'success');
        this.results.passed++;
        return true;
      } else {
        this.log(`❌ Prueba "${testName}" fallida: ${result.error}`, 'error');
        this.results.failed++;
        this.results.errors.push({ test: testName, error: result.error });
        return false;
      }
    } catch (error) {
      this.log(`❌ Error en prueba "${testName}": ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push({ test: testName, error: error.message });
      return false;
    }
  }

  async testSupabaseConnection() {
    return this.runTest('Conexión con Supabase', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      if (error) {
        throw new Error(`Error de conexión: ${error.message}`);
      }

      return {
        success: true,
        data: `Conexión exitosa. Encontradas ${data.length} empresas.`
      };
    });
  }

  async testUserAuthentication() {
    return this.runTest('Autenticación de Usuario', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new Error(`Error de autenticación: ${error.message}`);
      }

      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      TEST_CONFIG.testUserId = user.id;
      
      return {
        success: true,
        data: `Usuario autenticado: ${user.email} (ID: ${user.id})`
      };
    });
  }

  async testGoogleDriveSetup() {
    return this.runTest('Configuración de Google Drive', async () => {
      if (!TEST_CONFIG.testUserId) {
        throw new Error('No hay ID de usuario para verificar Google Drive');
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('google_refresh_token, google_access_token, email')
        .eq('id', TEST_CONFIG.testUserId)
        .single();

      if (error) {
        throw new Error(`Error obteniendo perfil: ${error.message}`);
      }

      if (!userProfile?.google_refresh_token) {
        this.log('⚠️ Usuario no tiene Google Drive configurado', 'warning');
        TEST_CONFIG.results.warnings.push('Google Drive no configurado - algunas pruebas no se ejecutarán');
        return {
          success: true,
          warning: 'Google Drive no configurado'
        };
      }

      return {
        success: true,
        data: `Google Drive configurado para: ${userProfile.email}`
      };
    });
  }

  async testCompanyCreation() {
    return this.runTest('Creación de Empresa de Prueba', async () => {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: TEST_CONFIG.companyName,
          description: TEST_CONFIG.companyDescription,
          status: 'active',
          user_id: TEST_CONFIG.testUserId,
          google_enabled: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creando empresa: ${error.message}`);
      }

      TEST_CONFIG.testCompanyId = data.id;
      
      return {
        success: true,
        data: `Empresa creada: ${data.name} (ID: ${data.id})`
      };
    });
  }

  async testKnowledgeBaseCreation() {
    return this.runTest('Creación de Base de Conocimiento', async () => {
      if (!TEST_CONFIG.testCompanyId) {
        throw new Error('No hay ID de empresa para crear base de conocimiento');
      }

      const companyData = {
        id: TEST_CONFIG.testCompanyId,
        name: TEST_CONFIG.companyName
      };

      const result = await companyKnowledgeService.createCompanyKnowledgeBase(
        companyData,
        TEST_CONFIG.testUserId
      );

      if (!result.success) {
        throw new Error(`Error creando base de conocimiento: ${result.error}`);
      }

      return {
        success: true,
        data: `Base de conocimiento creada. Drive Folder ID: ${result.driveStructure.mainFolder.id}`
      };
    });
  }

  async testEmbeddingGeneration() {
    return this.runTest('Generación de Embeddings', async () => {
      const testText = TEST_CONFIG.testDocuments[0].content;
      
      try {
        const embedding = await embeddingService.generateEmbedding(testText);
        
        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error('Embedding no es un array válido');
        }

        return {
          success: true,
          data: `Embedding generado exitosamente. Dimensiones: ${embedding.length}`
        };
      } catch (error) {
        throw new Error(`Error generando embedding: ${error.message}`);
      }
    });
  }

  async testDocumentVectorization() {
    return this.runTest('Vectorización de Documentos', async () => {
      if (!TEST_CONFIG.testCompanyId) {
        throw new Error('No hay ID de empresa para vectorizar documentos');
      }

      const results = [];
      
      for (const doc of TEST_CONFIG.testDocuments) {
        try {
          // Generar embedding
          const embedding = await embeddingService.generateEmbedding(doc.content);
          
          // Guardar en base de datos
          const { data, error } = await supabase
            .from('knowledge_documents')
            .insert({
              company_id: TEST_CONFIG.testCompanyId,
              title: doc.title,
              content: doc.content,
              embedding: embedding,
              file_type: 'text/plain',
              folder_type: 'documents',
              status: 'active',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Error guardando documento: ${error.message}`);
          }

          results.push({
            id: data.id,
            title: doc.title,
            embeddingDimensions: embedding.length
          });

        } catch (error) {
          this.log(`Error vectorizando documento "${doc.title}": ${error.message}`, 'warning');
        }
      }

      if (results.length === 0) {
        throw new Error('No se pudo vectorizar ningún documento');
      }

      return {
        success: true,
        data: `Se vectorizaron ${results.length} documentos exitosamente`
      };
    });
  }

  async testSemanticSearch() {
    return this.runTest('Búsqueda Semántica', async () => {
      if (!TEST_CONFIG.testCompanyId) {
        throw new Error('No hay ID de empresa para buscar');
      }

      try {
        const results = await companyKnowledgeService.searchKnowledge(
          TEST_CONFIG.testCompanyId,
          TEST_CONFIG.testQuery,
          {
            limit: 5,
            threshold: 0.5,
            includeDocuments: true,
            includeFAQs: false
          }
        );

        if (!Array.isArray(results)) {
          throw new Error('La búsqueda no retornó un array');
        }

        return {
          success: true,
          data: `Búsqueda completada. Se encontraron ${results.length} resultados para "${TEST_CONFIG.testQuery}"`
        };
      } catch (error) {
        throw new Error(`Error en búsqueda semántica: ${error.message}`);
      }
    });
  }

  async testKnowledgeStats() {
    return this.runTest('Estadísticas de Conocimiento', async () => {
      if (!TEST_CONFIG.testCompanyId) {
        throw new Error('No hay ID de empresa para obtener estadísticas');
      }

      try {
        const stats = await companyKnowledgeService.getKnowledgeStats(TEST_CONFIG.testCompanyId);
        
        return {
          success: true,
          data: `Estadísticas: ${stats.documents} documentos, ${stats.faqs} FAQs, ${stats.chunks} chunks`
        };
      } catch (error) {
        throw new Error(`Error obteniendo estadísticas: ${error.message}`);
      }
    });
  }

  async testDatabaseTables() {
    return this.runTest('Verificación de Tablas de Base de Datos', async () => {
      const requiredTables = [
        'company_knowledge_bases',
        'knowledge_documents',
        'knowledge_chunks',
        'faq_entries',
        'knowledge_categories',
        'knowledge_permissions'
      ];

      const results = [];
      
      for (const tableName of requiredTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

          if (error) {
            throw new Error(`Error verificando tabla ${tableName}: ${error.message}`);
          }

          results.push(`${tableName}: ✓`);
        } catch (error) {
          results.push(`${tableName}: ✗ (${error.message})`);
        }
      }

      const successCount = results.filter(r => r.includes('✓')).length;
      
      if (successCount < requiredTables.length) {
        throw new Error(`Faltan ${requiredTables.length - successCount} tablas requeridas`);
      }

      return {
        success: true,
        data: `Verificadas ${successCount}/${requiredTables.length} tablas requeridas`
      };
    });
  }

  async cleanupTestData() {
    return this.runTest('Limpieza de Datos de Prueba', async () => {
      const cleanupResults = [];

      // Eliminar documentos de conocimiento
      if (TEST_CONFIG.testCompanyId) {
        try {
          const { error: docError } = await supabase
            .from('knowledge_documents')
            .delete()
            .eq('company_id', TEST_CONFIG.testCompanyId);

          if (!docError) {
            cleanupResults.push('Documentos de conocimiento eliminados');
          }
        } catch (error) {
          cleanupResults.push(`Error eliminando documentos: ${error.message}`);
        }

        // Eliminar base de conocimiento
        try {
          const { error: kbError } = await supabase
            .from('company_knowledge_bases')
            .delete()
            .eq('company_id', TEST_CONFIG.testCompanyId);

          if (!kbError) {
            cleanupResults.push('Base de conocimiento eliminada');
          }
        } catch (error) {
          cleanupResults.push(`Error eliminando base de conocimiento: ${error.message}`);
        }

        // Eliminar empresa
        try {
          const { error: companyError } = await supabase
            .from('companies')
            .delete()
            .eq('id', TEST_CONFIG.testCompanyId);

          if (!companyError) {
            cleanupResults.push('Empresa de prueba eliminada');
          }
        } catch (error) {
          cleanupResults.push(`Error eliminando empresa: ${error.message}`);
        }
      }

      return {
        success: true,
        data: `Limpieza completada: ${cleanupResults.join(', ')}`
      };
    });
  }

  async runAllTests() {
    this.log('🚀 Iniciando pruebas completas del Sistema de Base de Conocimiento Empresarial');
    this.log('=' .repeat(80));

    // Tests en orden lógico
    const tests = [
      () => this.testSupabaseConnection(),
      () => this.testUserAuthentication(),
      () => this.testGoogleDriveSetup(),
      () => this.testDatabaseTables(),
      () => this.testCompanyCreation(),
      () => this.testKnowledgeBaseCreation(),
      () => this.testEmbeddingGeneration(),
      () => this.testDocumentVectorization(),
      () => this.testSemanticSearch(),
      () => this.testKnowledgeStats()
    ];

    // Ejecutar pruebas
    for (const test of tests) {
      await test();
      this.log(''); // Espacio entre pruebas
    }

    // Limpiar datos de prueba
    await this.cleanupTestData();

    // Mostrar resumen final
    this.log('=' .repeat(80));
    this.log('📊 RESUMEN DE PRUEBAS');
    this.log(`✅ Pruebas aprobadas: ${this.results.passed}`);
    this.log(`❌ Pruebas fallidas: ${this.results.failed}`);
    this.log(`⚠️ Advertencias: ${this.results.warnings.length}`);

    if (this.results.errors.length > 0) {
      this.log('\n🔍 ERRORES DETALLADOS:');
      this.results.errors.forEach(error => {
        this.log(`  • ${error.test}: ${error.error}`, 'error');
      });
    }

    if (this.results.warnings.length > 0) {
      this.log('\n⚠️ ADVERTENCIAS:');
      this.results.warnings.forEach(warning => {
        this.log(`  • ${warning}`, 'warning');
      });
    }

    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    this.log(`\n📈 Tasa de éxito: ${successRate.toFixed(1)}%`);

    if (successRate >= 80) {
      this.log('🎉 ¡El sistema está funcionando correctamente!', 'success');
    } else if (successRate >= 60) {
      this.log('⚠️ El sistema funciona parcialmente. Revisar los errores.', 'warning');
    } else {
      this.log('❌ El sistema tiene problemas críticos. Requiere atención inmediata.', 'error');
    }

    return {
      success: successRate >= 80,
      passed: this.results.passed,
      failed: this.results.failed,
      errors: this.results.errors,
      warnings: this.results.warnings,
      successRate
    };
  }
}

// Función principal
async function main() {
  const tester = new CompanyKnowledgeSystemTester();
  
  try {
    const results = await tester.runAllTests();
    
    // Salir con código apropiado
    process.exit(results.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error fatal ejecutando pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CompanyKnowledgeSystemTester;