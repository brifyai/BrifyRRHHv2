/**
 * Script de Diagnóstico de Error getUsers
 * Identifica problemas de exportación/importación
 */

import fs from 'fs';
import path from 'path';

class ErrorDiagnostic {
  constructor() {
    this.issues = [];
    this.exports = {};
    this.imports = {};
  }

  /**
   * Ejecutar diagnóstico completo
   */
  async runDiagnostic() {
    console.log('🔍 DIAGNÓSTICO DE ERROR getUsers');
    console.log('=' .repeat(40));

    try {
      await this.checkExports();
      await this.checkImports();
      await this.analyzeUserServiceFiles();
      await this.generateReport();
      
      console.log('✅ DIAGNÓSTICO COMPLETADO');
    } catch (error) {
      console.error('❌ Error durante diagnóstico:', error);
    }
  }

  /**
   * Verificar exportaciones
   */
  async checkExports() {
    console.log('\n📤 Verificando exportaciones...');
    
    const serviceFiles = [
      'src/services/inMemoryUserService.js',
      'src/lib/databaseAdapter.js',
      'src/services/organizedDatabaseService.js'
    ];

    for (const file of serviceFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const exports = this.extractExports(content);
        this.exports[file] = exports;
        
        console.log(`📁 ${file}:`);
        console.log(`  Exportaciones: ${exports.length}`);
        exports.forEach(exp => console.log(`    - ${exp}`));
        
        if (!exports.includes('getUsers')) {
          this.issues.push(`❌ ${file}: No exporta 'getUsers'`);
        } else {
          console.log(`  ✅ Exporta 'getUsers' correctamente`);
        }
      } else {
        this.issues.push(`❌ Archivo no encontrado: ${file}`);
      }
    }
  }

  /**
   * Extraer exportaciones de un archivo
   */
  extractExports(content) {
    const exports = [];
    
    // Export por defecto
    const defaultExport = content.match(/export\s+default\s+(\w+)/);
    if (defaultExport) {
      exports.push(`default: ${defaultExport[1]}`);
    }
    
    // Exportaciones nombradas
    const namedExports = content.match(/export\s+(?:async\s+)?(?:function|const|let|var)?\s*(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const match = exp.match(/export\s+(?:async\s+)?(?:function|const|let|var)?\s*(\w+)/);
        if (match) exports.push(match[1]);
      });
    }
    
    // Exportaciones al final del archivo
    const endExports = content.match(/export\s+\{([^}]+)\}/g);
    if (endExports) {
      endExports.forEach(exp => {
        const items = exp.match(/\{([^}]+)\}/)[1].split(',').map(s => s.trim());
        exports.push(...items);
      });
    }
    
    return [...new Set(exports)]; // Eliminar duplicados
  }

  /**
   * Verificar importaciones
   */
  async checkImports() {
    console.log('\n📥 Verificando importaciones...');
    
    const componentFiles = [
      'src/components/settings/UserManagement.js',
      'src/components/settings/Settings.js'
    ];

    for (const file of componentFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const imports = this.extractImports(content);
        this.imports[file] = imports;
        
        console.log(`📁 ${file}:`);
        console.log(`  Importaciones: ${imports.length}`);
        imports.forEach(imp => console.log(`    - ${imp}`));
        
        const userServiceImports = imports.filter(imp => 
          imp.includes('getUsers') || imp.includes('UserService')
        );
        
        if (userServiceImports.length === 0) {
          this.issues.push(`⚠️ ${file}: No importa servicios de usuario`);
        }
      }
    }
  }

  /**
   * Extraer importaciones de un archivo
   */
  extractImports(content) {
    const imports = [];
    
    const importStatements = content.match(/import\s+[^;]+;/g);
    if (importStatements) {
      importStatements.forEach(stmt => {
        imports.push(stmt.trim());
      });
    }
    
    return imports;
  }

  /**
   * Analizar archivos de servicio de usuario
   */
  async analyzeUserServiceFiles() {
    console.log('\n🔬 Analizando archivos de servicio...');
    
    const userServiceFiles = [
      'src/services/inMemoryUserService.js',
      'src/lib/databaseAdapter.js'
    ];

    for (const file of userServiceFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Verificar si getUsers está definido
        const getUsersDefined = content.includes('getUsers()') || content.includes('getUsers (');
        console.log(`📁 ${file}: getUsers definido: ${getUsersDefined}`);
        
        if (!getUsersDefined) {
          this.issues.push(`❌ ${file}: getUsers no está definido`);
        }
        
        // Verificar estructura de la clase
        const classMatch = content.match(/class\s+(\w+)/);
        if (classMatch) {
          console.log(`  Clase: ${classMatch[1]}`);
        }
        
        // Verificar si es una instancia o clase
        const isClass = content.includes('class ');
        const isInstance = content.includes('new ') || content.includes('= {');
        
        console.log(`  Tipo: ${isClass ? 'Clase' : isInstance ? 'Instancia' : 'Otro'}`);
      }
    }
  }

  /**
   * Generar reporte de diagnóstico
   */
  async generateReport() {
    console.log('\n📊 GENERANDO REPORTE...');
    
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      exports: this.exports,
      imports: this.imports,
      recommendations: this.getRecommendations()
    };
    
    // Guardar reporte
    fs.writeFileSync('ERROR_DIAGNOSTIC_REPORT.json', JSON.stringify(report, null, 2));
    
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
    if (this.issues.length === 0) {
      console.log('✅ No se encontraron problemas obvios');
    } else {
      this.issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    console.log(`\n💾 Reporte guardado en: ERROR_DIAGNOSTIC_REPORT.json`);
  }

  /**
   * Obtener recomendaciones
   */
  getRecommendations() {
    const recommendations = [];
    
    if (this.issues.some(issue => issue.includes('No exporta'))) {
      recommendations.push('Verificar exportaciones en archivos de servicio');
      recommendations.push('Asegurar que getUsers esté correctamente exportado');
    }
    
    if (this.issues.some(issue => issue.includes('no está definido'))) {
      recommendations.push('Verificar que getUsers esté definido en la clase/servicio');
      recommendations.push('Revisar sintaxis de métodos async');
    }
    
    recommendations.push('Verificar que las importaciones coincidan con las exportaciones');
    recommendations.push('Revisar configuración de webpack/bundler');
    recommendations.push('Limpiar cache de build y reconstruir');
    
    return recommendations;
  }
}

// Ejecutar diagnóstico si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostic = new ErrorDiagnostic();
  diagnostic.runDiagnostic().catch(console.error);
}

export default ErrorDiagnostic;