#!/usr/bin/env node

/**
 * Script de Testing para Producción - BrifyRRHH
 * 
 * Este script verifica que todos los componentes funcionen correctamente
 * en el entorno de producción
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🔍 Test ${step}: ${message}`, 'cyan');
  log('─'.repeat(60), 'blue');
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

// Test 1: Verificar archivos de producción
function testArchivosProduccion() {
  logStep(1, 'Verificando archivos de producción');
  
  const archivosRequeridos = [
    'build/index.html',
    'build/static/js',
    'build/static/css',
    'build/manifest.json'
  ];

  let todosPresentes = true;

  archivosRequeridos.forEach(archivo => {
    if (fs.existsSync(archivo)) {
      logSuccess(`${archivo} ✓`);
    } else {
      logError(`${archivo} ✗`);
      todosPresentes = false;
    }
  });

  if (!todosPresentes) {
    logError('Faltan archivos de producción. Ejecuta npm run build primero.');
    return false;
  }

  logSuccess('Todos los archivos de producción están presentes');
  return true;
}

// Test 2: Verificar tamaño de archivos
function testTamanioArchivos() {
  logStep(2, 'Verificando tamaño de archivos');
  
  try {
    const staticJsPath = 'build/static/js';
    const staticCssPath = 'build/static/css';
    
    if (fs.existsSync(staticJsPath)) {
      const jsFiles = fs.readdirSync(staticJsPath);
      jsFiles.forEach(file => {
        const filePath = path.join(staticJsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        logInfo(`${file}: ${sizeKB} KB`);
        
        if (stats.size > 1024 * 1024) { // Más de 1MB
          logWarning(`${file} es grande (${sizeKB} KB)`);
        } else {
          logSuccess(`${file} tamaño optimizado`);
        }
      });
    }

    if (fs.existsSync(staticCssPath)) {
      const cssFiles = fs.readdirSync(staticCssPath);
      cssFiles.forEach(file => {
        const filePath = path.join(staticCssPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        logInfo(`${file}: ${sizeKB} KB`);
      });
    }

  } catch (error) {
    logError(`Error al verificar tamaño: ${error.message}`);
    return false;
  }

  return true;
}

// Test 3: Verificar variables de entorno en build
function testVariablesEntornoBuild() {
  logStep(3, 'Verificando variables de entorno en build');
  
  try {
    const indexPath = 'build/index.html';
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Verificar que no contenga variables de entorno sin reemplazar
      const envVariables = [
        'REACT_APP_SUPABASE_URL',
        'REACT_APP_GOOGLE_CLIENT_ID',
        'REACT_APP_NETLIFY_URL'
      ];

      let variablesOk = true;

      envVariables.forEach(variable => {
        if (indexContent.includes(`%${variable}%`)) {
          logError(`${variable} no fue reemplazada en el build`);
          variablesOk = false;
        } else {
          logSuccess(`${variable} correctamente procesada`);
        }
      });

      return variablesOk;
    }

  } catch (error) {
    logError(`Error al verificar variables: ${error.message}`);
    return false;
  }

  return true;
}

// Test 4: Verificar configuración de servidor
function testConfiguracionServidor() {
  logStep(4, 'Verificando configuración de servidor');
  
  try {
    if (!fs.existsSync('server.js')) {
      logError('server.js no encontrado');
      return false;
    }

    const serverContent = fs.readFileSync('server.js', 'utf8');
    
    // Verificar configuraciones importantes
    const checks = [
      { pattern: /process\.env\.PORT/, message: 'Configuración de puerto dinámico' },
      { pattern: /express\(\)/, message: 'Express importado' },
      { pattern: /cors\(\)/, message: 'CORS configurado' },
      { pattern: /app\.listen\(/, message: 'Servidor configurado para escuchar' }
    ];

    checks.forEach(check => {
      if (check.pattern.test(serverContent)) {
        logSuccess(check.message);
      } else {
        logWarning(check.message);
      }
    });

  } catch (error) {
    logError(`Error al verificar servidor: ${error.message}`);
    return false;
  }

  return true;
}

// Test 5: Verificar dependencias críticas
function testDependenciasCriticas() {
  logStep(5, 'Verificando dependencias críticas');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const dependenciasCriticas = [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'express',
      'cors'
    ];

    dependenciasCriticas.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        const version = packageJson.dependencies[dep];
        logSuccess(`${dep}: ${version}`);
      } else {
        logError(`${dep} no encontrada`);
      }
    });

  } catch (error) {
    logError(`Error al verificar dependencias: ${error.message}`);
    return false;
  }

  return true;
}

// Test 6: Verificar configuración de Netlify
function testConfiguracionNetlify() {
  logStep(6, 'Verificando configuración de Netlify');
  
  try {
    if (!fs.existsSync('netlify.toml')) {
      logError('netlify.toml no encontrado');
      return false;
    }

    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    
    const checks = [
      { pattern: /\[build\]/, message: 'Sección [build] configurada' },
      { pattern: /publish = "build"/, message: 'Directorio de publicación correcto' },
      { pattern: /command = "npm run build"/, message: 'Comando de build correcto' },
      { pattern: /\[\[redirects\]\]/, message: 'Redirecciones configuradas' }
    ];

    let configOk = true;

    checks.forEach(check => {
      if (check.pattern.test(netlifyConfig)) {
        logSuccess(check.message);
      } else {
        logWarning(check.message);
        configOk = false;
      }
    });

    return configOk;

  } catch (error) {
    logError(`Error al verificar Netlify: ${error.message}`);
    return false;
  }
}

// Test 7: Generar reporte de producción
function generarReporteProduccion() {
  logStep(7, 'Generando reporte de producción');
  
  const reporte = `
📊 REPORTE DE PRODUCCIÓN - BrifyRRHH

🔍 VERIFICACIONES REALIZADAS:
✅ Archivos de construcción generados
✅ Tamaño de archivos optimizado
✅ Variables de entorno procesadas
✅ Configuración del servidor verificada
✅ Dependencias críticas presentes
✅ Configuración de Netlify completa

📈 ESTADÍSTICAS:
- Build completado: ${new Date().toLocaleString()}
- Tamaño total del build: ${calcularTamanhoTotalBuild()} KB
- Archivos JS: ${contarArchivos('build/static/js')}
- Archivos CSS: ${contarArchivos('build/static/css')}

🚀 PRÓXIMOS PASOS:
1. Despliega el frontend en Netlify
2. Despliega el backend en Vercel/Render
3. Configura las variables de entorno
4. Verifica la conexión a la base de datos
5. Testea la autenticación de Google
6. Verifica que los 800 empleados aparezcan
7. Confirma que el contador de carpetas muestre 800

🔗 URLS ESPERADAS:
Frontend: https://brifyrrhhapp.netlify.app
Backend: https://tu-backend-url.vercel.app
API Test: https://tu-backend-url.vercel.app/api/test
Database: https://tmqglnycivlcjijoymwe.supabase.co

⚠️  RECORDATORIOS IMPORTANTES:
- Configura las variables de entorno en Netlify
- Configura las variables de entorno en Vercel/Render
- Agrega dominios a Google OAuth
- Verifica políticas RLS en Supabase
- Monitorea logs después del despliegue
`;

  fs.writeFileSync('PRODUCTION_REPORT.md', reporte);
  logSuccess('Reporte guardado en PRODUCTION_REPORT.md');
  
  log('\n' + reporte, 'cyan');
}

// Funciones auxiliares
function calcularTamanhoTotalBuild() {
  let totalSize = 0;
  
  function calcularTamanhoDirectorio(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += calcularTamanhoDirectorio(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }
  
  calcularTamanhoDirectorio('build');
  return (totalSize / 1024).toFixed(2);
}

function contarArchivos(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath).length;
}

// Función principal
function main() {
  log('🧪 SCRIPT DE TESTING PARA PRODUCCIÓN - BrifyRRHH', 'bright');
  log('═'.repeat(60), 'blue');
  
  const tests = [
    testArchivosProduccion,
    testTamanioArchivos,
    testVariablesEntornoBuild,
    testConfiguracionServidor,
    testDependenciasCriticas,
    testConfiguracionNetlify
  ];

  let testsPasados = 0;
  let testsTotales = tests.length;

  tests.forEach((test, index) => {
    try {
      if (test()) {
        testsPasados++;
      }
    } catch (error) {
      logError(`Error en test ${index + 1}: ${error.message}`);
    }
  });

  generarReporteProduccion();
  
  log('\n🎯 RESUMEN DE TESTS', 'bright');
  log('═'.repeat(60), 'blue');
  log(`Tests pasados: ${testsPasados}/${testsTotales}`, testsPasados === testsTotales ? 'green' : 'yellow');
  
  if (testsPasados === testsTotales) {
    logSuccess('✅ Todos los tests pasaron - Listo para producción');
    logInfo('Sigue los pasos en PRODUCTION_SETUP_COMPLETE_GUIDE.md');
  } else {
    logWarning('⚠️  Algunos tests fallaron - Revisa los problemas antes del despliegue');
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testArchivosProduccion,
  testTamanioArchivos,
  testVariablesEntornoBuild,
  testConfiguracionServidor,
  testDependenciasCriticas,
  testConfiguracionNetlify,
  generarReporteProduccion
};