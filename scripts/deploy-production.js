#!/usr/bin/env node

/**
 * Script de Despliegue Automatizado para Producción - BrifyRRHH
 * 
 * Este script prepara y verifica el despliegue en producción
 * para Netlify (frontend) y Vercel/Render (backend)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n📍 Paso ${step}: ${message}`, 'cyan');
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

// Verificar archivos necesarios
function verificarArchivosRequeridos() {
  logStep(1, 'Verificando archivos requeridos');
  
  const archivosRequeridos = [
    'package.json',
    'server.js',
    'src/App.js',
    'netlify.toml',
    '.env.example'
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
    logError('Faltan archivos requeridos. Por favor, verifica la estructura del proyecto.');
    process.exit(1);
  }

  logSuccess('Todos los archivos requeridos están presentes');
}

// Verificar dependencias
function verificarDependencias() {
  logStep(2, 'Verificando dependencias');
  
  try {
    // Verificar si node_modules existe
    if (!fs.existsSync('node_modules')) {
      logInfo('Instalando dependencias...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      logSuccess('Dependencias ya instaladas');
    }

    // Verificar dependencias críticas
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependenciasCriticas = [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'express',
      'cors'
    ];

    dependenciasCriticas.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        logSuccess(`${dep} ✓`);
      } else {
        logWarning(`${dep} no encontrada`);
      }
    });

  } catch (error) {
    logError(`Error al verificar dependencias: ${error.message}`);
    process.exit(1);
  }
}

// Verificar variables de entorno
function verificarVariablesEntorno() {
  logStep(3, 'Verificando variables de entorno');
  
  try {
    // Verificar .env.example
    if (fs.existsSync('.env.example')) {
      logSuccess('.env.example encontrado');
    } else {
      logError('.env.example no encontrado');
      return;
    }

    // Leer variables requeridas
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const variablesRequeridas = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_GOOGLE_CLIENT_ID',
      'REACT_APP_NETLIFY_URL'
    ];

    variablesRequeridas.forEach(variable => {
      if (envExample.includes(variable)) {
        logSuccess(`${variable} configurada en .env.example`);
      } else {
        logWarning(`${variable} no encontrada en .env.example`);
      }
    });

  } catch (error) {
    logError(`Error al verificar variables de entorno: ${error.message}`);
  }
}

// Verificar configuración de Netlify
function verificarConfiguracionNetlify() {
  logStep(4, 'Verificando configuración de Netlify');
  
  try {
    if (!fs.existsSync('netlify.toml')) {
      logError('netlify.toml no encontrado');
      return;
    }

    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    
    // Verificar configuración básica
    const checks = [
      { pattern: /\[build\]/, message: 'Sección [build] encontrada' },
      { pattern: /publish = "build"/, message: 'Directorio de publicación configurado' },
      { pattern: /command = "npm run build"/, message: 'Comando de build configurado' },
      { pattern: /\[\[redirects\]\]/, message: 'Redirecciones configuradas' }
    ];

    checks.forEach(check => {
      if (check.pattern.test(netlifyConfig)) {
        logSuccess(check.message);
      } else {
        logWarning(check.message);
      }
    });

  } catch (error) {
    logError(`Error al verificar configuración de Netlify: ${error.message}`);
  }
}

// Realizar build de prueba
function realizarBuildPrueba() {
  logStep(5, 'Realizando build de prueba');
  
  try {
    logInfo('Ejecutando npm run build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    if (fs.existsSync('build')) {
      logSuccess('Build completado exitosamente');
      
      // Verificar archivos críticos en build
      const archivosBuild = [
        'build/index.html',
        'build/static/js/main.*.js',
        'build/static/css/main.*.css'
      ];

      archivosBuild.forEach(archivo => {
        const archivosEncontrados = fs.readdirSync(path.dirname(archivo))
          .filter(file => file.includes(path.basename(archivo).split('.')[0]));
        
        if (archivosEncontrados.length > 0) {
          logSuccess(`${path.basename(archivo)} generado`);
        } else {
          logWarning(`${archivo} no encontrado`);
        }
      });
    } else {
      logError('Directorio build no generado');
    }
    
  } catch (error) {
    logError(`Error en el build: ${error.message}`);
    process.exit(1);
  }
}

// Verificar configuración de producción
function verificarConfiguracionProduccion() {
  logStep(6, 'Verificando configuración de producción');
  
  // Verificar package.json scripts
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      logSuccess('Script build configurado');
    } else {
      logWarning('Script build no encontrado');
    }

    if (packageJson.scripts && packageJson.scripts.start) {
      logSuccess('Script start configurado');
    } else {
      logWarning('Script start no encontrado');
    }

  } catch (error) {
    logError(`Error al verificar package.json: ${error.message}`);
  }

  // Verificar server.js
  if (fs.existsSync('server.js')) {
    logSuccess('server.js encontrado');
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      if (serverContent.includes('process.env.PORT')) {
        logSuccess('Configuración de puerto dinámico encontrada');
      } else {
        logWarning('Configuración de puerto dinámico no encontrada');
      }
      
    } catch (error) {
      logError(`Error al verificar server.js: ${error.message}`);
    }
  }
}

// Generar checklist de despliegue
function generarChecklistDespliegue() {
  logStep(7, 'Generando checklist de despliegue');
  
  const checklist = `
🚀 CHECKLIST DE DESPLIEGUE EN PRODUCCIÓN - BrifyRRHH

📋 ANTES DEL DESPLIEGUE:
□ Todas las pruebas locales pasan
□ Variables de entorno configuradas
□ Build de prueba exitoso
□ Código subido a GitHub
□ Branch principal actualizada

🌐 NETLIFY (Frontend):
□ Cuenta creada y conectada a GitHub
□ Variables de entorno configuradas:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY
  - REACT_APP_GOOGLE_CLIENT_ID
  - REACT_APP_NETLIFY_URL
□ netlify.toml configurado correctamente
□ Dominio configurado (si aplica)

🔧 VERCEL/RENDER (Backend):
□ Cuenta creada y conectada a GitHub
□ Variables de entorno configuradas:
  - NODE_ENV=production
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY
  - REACT_APP_GOOGLE_CLIENT_ID
  - REACT_APP_GOOGLE_CLIENT_SECRET
□ Comando de inicio: node server.js
□ URL del backend anotada

🔐 GOOGLE OAUTH:
□ Dominios de producción agregados:
  - https://brifyrrhhapp.netlify.app
  - https://tu-backend-url.vercel.app
□ Redirect URIs configuradas
□ Client ID y Secret verificados

✅ DESPUÉS DEL DESPLIEGUE:
□ Frontend accesible en Netlify
□ Backend respondiendo en Vercel/Render
□ API test funcionando
□ Autenticación de Google funcionando
□ Base de datos conectada
□ 800 empleados visibles
□ Contador de carpetas mostrando 800

🔥 URLS FINALES:
Frontend: https://brifyrrhhapp.netlify.app
Backend: https://tu-backend-url.vercel.app
API Test: https://tu-backend-url.vercel.app/api/test
Database: https://tmqglnycivlcjijoymwe.supabase.co
`;

  // Guardar checklist en archivo
  fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
  logSuccess('Checklist guardado en DEPLOYMENT_CHECKLIST.md');
  
  log('\n' + checklist, 'cyan');
}

// Función principal
async function main() {
  log('🚀 SCRIPT DE DESPLIEGUE EN PRODUCCIÓN - BrifyRRHH', 'bright');
  log('═'.repeat(60), 'blue');
  
  try {
    verificarArchivosRequeridos();
    verificarDependencias();
    verificarVariablesEntorno();
    verificarConfiguracionNetlify();
    realizarBuildPrueba();
    verificarConfiguracionProduccion();
    generarChecklistDespliegue();
    
    log('\n🎉 VERIFICACIÓN COMPLETADA', 'bright');
    log('═'.repeat(60), 'green');
    logSuccess('Tu proyecto está listo para despliegue en producción');
    logInfo('Revisa el checklist generado en DEPLOYMENT_CHECKLIST.md');
    logInfo('Sigue los pasos en PRODUCTION_SETUP_COMPLETE_GUIDE.md');
    
  } catch (error) {
    logError(`Error en la verificación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  verificarArchivosRequeridos,
  verificarDependencias,
  verificarVariablesEntorno,
  verificarConfiguracionNetlify,
  realizarBuildPrueba,
  verificarConfiguracionProduccion,
  generarChecklistDespliegue
};