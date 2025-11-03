
/**
 * LIMPIEZA COMPLETA - Eliminar cualquier rastro del proyecto incorrecto
 */

// Función de limpieza nuclear
export function nuclearCleanup() {
  console.log('🔥 INICIANDO LIMPIEZA NUCLEAR...');
  
  // Limpiar localStorage
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (key.includes('leoyybfbnjajkktprhro') || key.includes('supabase'))) {
      console.log('🗑️ Eliminando localStorage key:', key);
      localStorage.removeItem(key);
    }
  }
  
  // Limpiar sessionStorage
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('leoyybfbnjajkktprhro') || key.includes('supabase'))) {
      console.log('🗑️ Eliminando sessionStorage key:', key);
      sessionStorage.removeItem(key);
    }
  }
  
  // Limpiar cookies
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.includes('leoyybfbnjajkktprhro') || name.includes('supabase')) {
      console.log('🗑️ Eliminando cookie:', name);
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  });
  
  // Limpiar IndexedDB
  if (window.indexedDB) {
    const databases = indexedDB.databases();
    databases.forEach(db => {
      if (db.name && db.name.includes('leoyybfbnjajkktprhro')) {
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
