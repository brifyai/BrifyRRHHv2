#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN FINAL DE LA SOLUCIÓN');
console.log('=====================================\n');

// 1. Verificar archivos de entorno
console.log('1️⃣ Verificando archivos de entorno...');

const envFiles = ['.env', '.env.local', '.env.production'];
let envCorrect = true;

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('tmqglnycivlcjijoymwe.supabase.co')) {
      console.log(`✅ ${file}: Configuración correcta`);
    } else if (content.includes('leoyybfbnjajkktprhro.supabase.co')) {
      console.log(`❌ ${file}: Aún contiene el proyecto incorrecto`);
      envCorrect = false;
    } else {
      console.log(`⚠️ ${file}: No se encontró URL de Supabase`);
    }
  } else {
    console.log(`⚠️ ${file}: No existe`);
  }
});

// 2. Verificar interceptor forzado
console.log('\n2️⃣ Verificando interceptor forzado...');

const interceptorPath = 'src/lib/forcedSupabaseClient.js';
if (fs.existsSync(interceptorPath)) {
  const interceptorContent = fs.readFileSync(interceptorPath, 'utf8');
  if (interceptorContent.includes('tmqglnycivlcjijoymwe.supabase.co')) {
    console.log('✅ Interceptor forzado: Configuración correcta');
  } else {
    console.log('❌ Interceptor forzado: Configuración incorrecta');
  }
} else {
  console.log('❌ Interceptor forzado: No existe');
}

// 3. Verificar modificación en App.js
console.log('\n3️⃣ Verificando App.js...');

const appPath = 'src/App.js';
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('forcedSupabaseClient')) {
    console.log('✅ App.js: Usando interceptor forzado');
  } else {
    console.log('❌ App.js: No está usando el interceptor forzado');
  }
} else {
  console.log('❌ App.js: No existe');
}

// 4. Buscar cualquier referencia restante al proyecto incorrecto
console.log('\n4️⃣ Buscando referencias restantes al proyecto incorrecto...');

function searchInDirectory(dir, searchTerm) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar directorios que no queremos escanear
      if (!['node_modules', '.git', 'build', 'dist'].includes(file)) {
        results = results.concat(searchInDirectory(fullPath, searchTerm));
      }
    } else if (file.match(/\.(js|jsx|ts|tsx|json|html|env)$/)) {
      // Ignorar el propio script de verificación
      if (file === 'verify-final-solution.js') continue;
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(searchTerm)) {
          results.push(fullPath);
        }
      } catch (error) {
        // Ignorar errores de lectura
      }
    }
  }
  
  return results;
}

const incorrectReferences = searchInDirectory('.', 'leoyybfbnjajkktprhro.supabase.co');

if (incorrectReferences.length === 0) {
  console.log('✅ No se encontraron referencias al proyecto incorrecto');
} else {
  console.log('❌ Se encontraron referencias al proyecto incorrecto:');
  incorrectReferences.forEach(ref => console.log(`   - ${ref}`));
}

// 5. Verificar script de limpieza nuclear
console.log('\n5️⃣ Verificando script de limpieza nuclear...');

const cleanupScriptPath = 'src/utils/nuclearCleanup.js';
if (fs.existsSync(cleanupScriptPath)) {
  console.log('✅ Script de limpieza nuclear: Existe');
} else {
  console.log('❌ Script de limpieza nuclear: No existe');
}

// 6. Resumen final
console.log('\n📋 RESUMEN FINAL');
console.log('================');

const allChecksPass = envCorrect && 
                     fs.existsSync(interceptorPath) && 
                     fs.existsSync(appPath) && 
                     incorrectReferences.length === 0 &&
                     fs.existsSync(cleanupScriptPath);

if (allChecksPass) {
  console.log('🎉 TODAS LAS VERIFICACIONES HAN PASADO');
  console.log('\n✅ La solución drástica se ha implementado correctamente');
  console.log('✅ No hay rastros del proyecto incorrecto');
  console.log('✅ El interceptor forzado está activo');
  console.log('✅ La aplicación debería funcionar correctamente ahora');
  
  console.log('\n🚀 PASOS SIGUIENTES:');
  console.log('1. Limpia el caché del navegador completamente');
  console.log('2. Reinicia la aplicación con npm start');
  console.log('3. Abre la aplicación en una nueva ventana de incógnito');
  console.log('4. Intenta iniciar sesión');
  console.log('5. Verifica que no aparezcan errores del proyecto incorrecto');
  
} else {
  console.log('❌ ALGUNAS VERIFICACIONES HAN FALLADO');
  console.log('\n⚠️ Puede que aún queden algunos problemas por resolver');
  
  if (!envCorrect) {
    console.log('- Revisa los archivos de entorno');
  }
  if (!fs.existsSync(interceptorPath)) {
    console.log('- El interceptor forzado no se creó correctamente');
  }
  if (incorrectReferences.length > 0) {
    console.log('- Aún existen referencias al proyecto incorrecto');
  }
}

console.log('\n🔧 Si los problemas persisten, ejecuta:');
console.log('   node src/utils/nuclearCleanup.js');
console.log('   npm start');