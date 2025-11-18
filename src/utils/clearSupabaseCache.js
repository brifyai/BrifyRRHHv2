/**
 * Utilidad para limpiar caché de Supabase y localStorage
 * Esto resuelve problemas cuando se cambia la configuración del proyecto Supabase
 */

export const clearSupabaseCache = () => {
  try {
    console.log('🧹 Limpiando caché de Supabase y localStorage...')
    
    // Limpiar todas las claves relacionadas con Supabase en localStorage
    const keysToRemove = []
    
    // Buscar claves de Supabase en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('supabase') ||
        key.includes('sb-') ||
        key.includes('tmqglnycivlcjijoymwe') || // Proyecto incorrecto anterior
        key.includes('tmqglnycivlcjijoymwe') || // Proyecto correcto actual
        key.startsWith('sb-') ||
        key.includes('auth') ||
        key.includes('session')
      )) {
        keysToRemove.push(key)
      }
    }
    
    // Eliminar las claves encontradas
    keysToRemove.forEach(key => {
      console.log(`🗑️ Eliminando clave: ${key}`)
      localStorage.removeItem(key)
    })
    
    // También limpiar sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (
        key.includes('supabase') ||
        key.includes('sb-') ||
        key.includes('tmqglnycivlcjijoymwe') ||
        key.includes('tmqglnycivlcjijoymwe') ||
        key.startsWith('sb-') ||
        key.includes('auth') ||
        key.includes('session')
      )) {
        console.log(`🗑️ Eliminando clave de sessionStorage: ${key}`)
        sessionStorage.removeItem(key)
      }
    }
    
    // Limpiar también posibles cookies de Supabase
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name.includes('supabase') || name.includes('sb-')) {
        console.log(`🗑️ Eliminando cookie: ${name}`)
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`
      }
    })
    
    console.log('✅ Caché de Supabase limpiado exitosamente')
    console.log(`📊 Se eliminaron ${keysToRemove.length} claves de localStorage`)
    
    return {
      success: true,
      keysRemoved: keysToRemove.length,
      keys: keysToRemove
    }
    
  } catch (error) {
    console.error('❌ Error limpiando caché de Supabase:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica si hay configuración incorrecta cachada
 */
export const checkForIncorrectConfig = () => {
  const incorrectProject = 'tmqglnycivlcjijoymwe'
  const correctProject = 'tmqglnycivlcjijoymwe'
  
  let hasIncorrectConfig = false
  const foundKeys = []
  
  // Verificar localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    
    if (key && (
      key.includes(incorrectProject) ||
      (value && value.includes(incorrectProject))
    )) {
      hasIncorrectConfig = true
      foundKeys.push({ key, value: value?.substring(0, 50) + '...' })
    }
  }
  
  // Verificar sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    const value = sessionStorage.getItem(key)
    
    if (key && (
      key.includes(incorrectProject) ||
      (value && value.includes(incorrectProject))
    )) {
      hasIncorrectConfig = true
      foundKeys.push({ key, storage: 'sessionStorage', value: value?.substring(0, 50) + '...' })
    }
  }
  
  return {
    hasIncorrectConfig,
    foundKeys,
    incorrectProject,
    correctProject
  }
}

/**
 * Función principal que verifica y limpia si es necesario
 */
export const ensureCorrectSupabaseConfig = () => {
  const check = checkForIncorrectConfig()
  
  if (check.hasIncorrectConfig) {
    console.warn('⚠️ Se detectó configuración incorrecta de Supabase cachada:')
    console.log('Proyecto incorrecto:', check.incorrectProject)
    console.log('Proyecto correcto:', check.correctProject)
    console.log('Claves encontradas:', check.foundKeys)
    
    return clearSupabaseCache()
  } else {
    console.log('✅ No se detectó configuración incorrecta cachada')
    return { success: true, message: 'No se requiere limpieza' }
  }
}

const clearSupabaseCacheUtils = {
  clearSupabaseCache,
  checkForIncorrectConfig,
  ensureCorrectSupabaseConfig
};

export default clearSupabaseCacheUtils;