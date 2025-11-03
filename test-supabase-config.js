/**
 * Script para verificar la configuración de Supabase
 * Ejecutar con: node test-supabase-config.js
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

const { SUPABASE_CONFIG } = require('./src/config/constants.js');

console.log('🔍 Verificando configuración de Supabase...');
console.log('===========================================');

// Verificar variables de entorno
const envUrl = process.env.REACT_APP_SUPABASE_URL;
const envKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('📋 Variables de entorno:');
console.log(`  REACT_APP_SUPABASE_URL: ${envUrl}`);
console.log(`  REACT_APP_SUPABASE_ANON_KEY: ${envKey ? envKey.substring(0, 20) + '...' : 'undefined'}`);

console.log('\n📋 Configuración desde constants.js:');
console.log(`  SUPABASE_CONFIG.URL: ${SUPABASE_CONFIG.URL}`);
console.log(`  SUPABASE_CONFIG.ANON_KEY: ${SUPABASE_CONFIG.ANON_KEY ? SUPABASE_CONFIG.ANON_KEY.substring(0, 20) + '...' : 'undefined'}`);

// Verificar proyecto correcto vs incorrecto
const correctProject = 'tmqglnycivlcjijoymwe';
const incorrectProject = 'leoyybfbnjajkktprhro';

console.log('\n🎯 Verificación de proyectos:');
console.log(`  Proyecto correcto: ${correctProject}`);
console.log(`  Proyecto incorrecto: ${incorrectProject}`);

const hasCorrectUrl = envUrl && envUrl.includes(correctProject);
const hasIncorrectUrl = envUrl && envUrl.includes(incorrectProject);

console.log(`  URL contiene proyecto correcto: ${hasCorrectUrl ? '✅ SÍ' : '❌ NO'}`);
console.log(`  URL contiene proyecto incorrecto: ${hasIncorrectUrl ? '❌ SÍ (PROBLEMA)' : '✅ NO'}`);

// Verificar consistencia
const isConsistent = envUrl === SUPABASE_CONFIG.URL;
console.log(`  Configuración consistente (.env == constants.js): ${isConsistent ? '✅ SÍ' : '❌ NO'}`);

// Resumen
console.log('\n📊 Resumen:');
if (hasCorrectUrl && !hasIncorrectUrl && isConsistent) {
  console.log('✅ Configuración de Supabase es CORRECTA');
  console.log('   - Usa el proyecto correcto');
  console.log('   - No hay残留 del proyecto incorrecto');
  console.log('   - La configuración es consistente');
} else {
  console.log('❌ Hay PROBLEMAS en la configuración:');
  if (!hasCorrectUrl) console.log('   - No usa el proyecto correcto');
  if (hasIncorrectUrl) console.log('   - Todavía hay残留 del proyecto incorrecto');
  if (!isConsistent) console.log('   - La configuración no es consistente entre .env y constants.js');
}

console.log('\n🔧 Acciones recomendadas:');
if (hasIncorrectUrl) {
  console.log('   - Limpiar caché del navegador (localStorage, sessionStorage, cookies)');
  console.log('   - Reiniciar el servidor de desarrollo');
}
if (!isConsistent) {
  console.log('   - Verificar que el archivo .env y constants.js tengan la misma configuración');
}

console.log('\n✨ Para limpiar caché manualmente en el navegador:');
console.log('   1. Abrir DevTools (F12)');
console.log('   2. Ir a Application tab');
console.log('   3. Local Storage -> borrar todo');
console.log('   4. Session Storage -> borrar todo');
console.log('   5. Cookies -> borrar todo');
console.log('   6. Recargar la página (Ctrl+F5)');