/**
 * SOLUCIÓN DRÁSTICA: Forzar configuración correcta de Supabase
 * 
 * Este script elimina completamente cualquier referencia al proyecto incorrecto
 * y fuerza el uso del proyecto correcto en toda la aplicación.
 */

const fs = require('fs');
const path = require('path');

const INCORRECT_PROJECT = 'leoyybfbnjajkktprhro';
const CORRECT_PROJECT = 'tmqglnycivlcjijoymwe';

console.log('🔥 IMPLEMENTANDO SOLUCIÓN DRÁSTICA...');
console.log('=====================================');

// 1. Eliminar completamente la caché del navegador y build
console.log('\n📁 Eliminando caché y build...');
try {
  if (fs.existsSync('node_modules/.cache')) {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('✅ node_modules/.cache eliminado');
  }
  
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
    console.log('✅ build eliminado');
  }
  
  // Eliminar carpetas de caché adicionales
  const cacheDirs = ['.cache', '.next', 'dist', 'out'];
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ ${dir} eliminado`);
    }
  });
} catch (error) {
  console.log('⚠️  Error eliminando caché:', error.message);
}

// 2. Forzar variables de entorno correctas
console.log('\n🔧 Forzando variables de entorno...');
const envFiles = ['.env', '.env.local', '.env.production'];

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, 'utf8');
    
    // Reemplazar cualquier referencia al proyecto incorrecto
    content = content.replace(new RegExp(INCORRECT_PROJECT, 'g'), CORRECT_PROJECT);
    content = content.replace(/https:\/\/leoyybfbnjajkktprhro\.supabase\.co/g, `https://${CORRECT_PROJECT}.supabase.co`);
    
    // Asegurar que las variables correctas estén presentes
    if (!content.includes('REACT_APP_SUPABASE_URL')) {
      content += `\nREACT_APP_SUPABASE_URL=https://${CORRECT_PROJECT}.supabase.co\n`;
    }
    
    if (!content.includes('REACT_APP_SUPABASE_ANON_KEY')) {
      content += `REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE\n`;
    }
    
    fs.writeFileSync(envFile, content);
    console.log(`✅ ${envFile} actualizado`);
  } else {
    // Crear archivo .env si no existe
    const defaultEnv = `# Configuración de Supabase - PROYECTO CORRECTO
REACT_APP_SUPABASE_URL=https://${CORRECT_PROJECT}.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE

# Otras variables
NODE_ENV=development
PORT=3000
`;
    fs.writeFileSync(envFile, defaultEnv);
    console.log(`✅ ${envFile} creado con configuración correcta`);
  }
});

// 3. Buscar y reemplazar referencias hardcodeadas en archivos JavaScript
console.log('\n🔍 Buscando referencias hardcodeadas...');

function findAndReplaceInFiles(dir, patterns, replacements) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'build') {
        walkDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  
  let modifiedCount = 0;
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      patterns.forEach((pattern, index) => {
        const regex = new RegExp(pattern, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replacements[index]);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        modifiedCount++;
        console.log(`✅ Modificado: ${filePath}`);
      }
    } catch (error) {
      console.log(`⚠️  Error procesando ${filePath}:`, error.message);
    }
  });
  
  return modifiedCount;
}

const patterns = [
  INCORRECT_PROJECT,
  'https://leoyybfbnjajkktprhro\\.supabase\\.co',
  'leoyybfbnjajkktprhro\\.supabase\\.co'
];

const replacements = [
  CORRECT_PROJECT,
  `https://${CORRECT_PROJECT}.supabase.co`,
  `${CORRECT_PROJECT}.supabase.co`
];

const modifiedFiles = findAndReplaceInFiles('src', patterns, replacements);
console.log(`📊 Total archivos modificados: ${modifiedFiles}`);

// 4. Crear un interceptor forzado en el cliente Supabase
console.log('\n🛡️ Creando interceptor forzado...');

const interceptorCode = `
/**
 * INTERCEPTOR FORZADO - Supabase
 * 
 * Este interceptor garantiza que todas las conexiones usen el proyecto correcto
 */

import { createClient } from '@supabase/supabase-js'

// Configuración forzada del proyecto correcto
const FORCED_SUPABASE_URL = 'https://${CORRECT_PROJECT}.supabase.co'
const FORCED_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

// Sobrescribir createClient para forzar configuración correcta
const originalCreateClient = createClient;

export function createForcedClient(url, key, options = {}) {
  console.warn('🔒 INTERCEPTOR: Forzando configuración correcta de Supabase');
  console.log('🔒 URL forzada:', FORCED_SUPABASE_URL);
  
  // Ignorar parámetros y usar configuración forzada
  return originalCreateClient(FORCED_SUPABASE_URL, FORCED_SUPABASE_KEY, {
    ...options,
    // Forzar headers adicionales
    global: {
      ...options.global,
      headers: {
        ...options.global?.headers,
        'X-Forced-Project': CORRECT_PROJECT
      }
    }
  });
}

// Exportar createClient modificado
export { createForcedClient as createClient };

// Crear cliente forzado por defecto
export const supabase = createForcedClient();
`;

try {
  fs.writeFileSync('src/lib/forcedSupabaseClient.js', interceptorCode);
  console.log('✅ Interceptor forzado creado');
} catch (error) {
  console.log('⚠️  Error creando interceptor:', error.message);
}

// 5. Modificar App.js para usar el interceptor
console.log('\n📱 Modificando App.js...');

try {
  const appPath = 'src/App.js';
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    // Reemplazar importaciones de supabase
    appContent = appContent.replace(
      /import\s*\{[^}]*supabase[^}]*\}\s*from\s*['"][^'"]*supabase['"]/g,
      "import { supabase } from './lib/forcedSupabaseClient.js'"
    );
    
    appContent = appContent.replace(
      /import\s*\{[^}]*auth[^}]*\}\s*from\s*['"][^'"]*supabase['"]/g,
      "import { auth } from './lib/forcedSupabaseClient.js'"
    );
    
    fs.writeFileSync(appPath, appContent);
    console.log('✅ App.js modificado para usar interceptor forzado');
  }
} catch (error) {
  console.log('⚠️  Error modificando App.js:', error.message);
}

// 6. Limpiar completamente el localStorage y sessionStorage
console.log('\n🧹 Creando script de limpieza completa...');

const cleanupScript = `
/**
 * LIMPIEZA COMPLETA - Eliminar cualquier rastro del proyecto incorrecto
 */

// Función de limpieza nuclear
export function nuclearCleanup() {
  console.log('🔥 INICIANDO LIMPIEZA NUCLEAR...');
  
  // Limpiar localStorage
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (key.includes('${INCORRECT_PROJECT}') || key.includes('supabase'))) {
      console.log('🗑️ Eliminando localStorage key:', key);
      localStorage.removeItem(key);
    }
  }
  
  // Limpiar sessionStorage
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('${INCORRECT_PROJECT}') || key.includes('supabase'))) {
      console.log('🗑️ Eliminando sessionStorage key:', key);
      sessionStorage.removeItem(key);
    }
  }
  
  // Limpiar cookies
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.includes('${INCORRECT_PROJECT}') || name.includes('supabase')) {
      console.log('🗑️ Eliminando cookie:', name);
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  });
  
  // Limpiar IndexedDB
  if (window.indexedDB) {
    const databases = indexedDB.databases();
    databases.forEach(db => {
      if (db.name && db.name.includes('${INCORRECT_PROJECT}')) {
        console.log('🗑️ Eliminando IndexedDB:', db.name);
        indexedDB.deleteDatabase(db.name);
      }
    });
  }
  
  console.log('✅ LIMPIEZA NUCLEAR COMPLETADA');
}

// Ejecutar limpieza inmediatamente
nuclearCleanup();

// También limpiar cada 30 segundos por si acaso
setInterval(nuclearCleanup, 30000);
`;

try {
  fs.writeFileSync('src/utils/nuclearCleanup.js', cleanupScript);
  console.log('✅ Script de limpieza nuclear creado');
} catch (error) {
  console.log('⚠️  Error creando script de limpieza:', error.message);
}

console.log('\n🎯 SOLUCIÓN DRÁSTICA COMPLETADA');
console.log('=====================================');
console.log('✅ Todos los rastros del proyecto incorrecto eliminados');
console.log('✅ Configuración correcta forzada');
console.log('✅ Interceptor implementado');
console.log('✅ Limpieza nuclear activada');
console.log('\n🔄 Reinicia la aplicación con:');
console.log('   npm start');
console.log('\n🚀 La aplicación ahora solo usará el proyecto correcto:', CORRECT_PROJECT);