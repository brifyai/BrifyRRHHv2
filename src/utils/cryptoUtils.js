/**
 * Crypto Utilities
 * Utilidades criptográficas para encriptación End-to-End
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import encryptionService from '../lib/encryptionService.js'
import keyManagement from '../lib/keyManagement.js'

/**
 * Encriptar datos sensibles
 * @param {string|Object} data - Datos a encriptar
 * @param {string} keyId - ID de clave (opcional, usa la activa si no se proporciona)
 * @returns {string} Datos encriptados en base64
 */
export const encryptData = (data, keyId = null) => {
  try {
    let key
    if (keyId) {
      key = keyManagement.getKey(keyId)
    } else {
      const activeKey = keyManagement.getActiveKey()
      key = activeKey.key
    }

    return encryptionService.encrypt(data, key)
  } catch (error) {
    console.error('Error encrypting data:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Desencriptar datos
 * @param {string} encryptedData - Datos encriptados
 * @param {string} keyId - ID de clave (opcional, intenta todas las activas)
 * @param {boolean} parseJSON - Parsear como JSON
 * @returns {string|Object} Datos desencriptados
 */
export const decryptData = (encryptedData, keyId = null, parseJSON = false) => {
  try {
    if (keyId) {
      const key = keyManagement.getKey(keyId)
      return encryptionService.decrypt(encryptedData, key, parseJSON)
    }

    // Intentar con todas las claves activas
    const activeKeys = keyManagement.getActiveKeys()
    for (const { keyId: kid } of activeKeys) {
      try {
        const key = keyManagement.getKey(kid)
        return encryptionService.decrypt(encryptedData, key, parseJSON)
      } catch (e) {
        // Continuar con la siguiente clave
        continue
      }
    }

    throw new Error('Failed to decrypt with any available key')
  } catch (error) {
    console.error('Error decrypting data:', error)
    throw error
  }
}

/**
 * Encriptar con contraseña
 * @param {string|Object} data - Datos a encriptar
 * @param {string} password - Contraseña
 * @returns {string} Datos encriptados
 */
export const encryptWithPassword = (data, password) => {
  try {
    return encryptionService.encryptWithPassword(data, password)
  } catch (error) {
    console.error('Error encrypting with password:', error)
    throw new Error('Failed to encrypt with password')
  }
}

/**
 * Desencriptar con contraseña
 * @param {string} encryptedData - Datos encriptados
 * @param {string} password - Contraseña
 * @param {boolean} parseJSON - Parsear como JSON
 * @returns {string|Object} Datos desencriptados
 */
export const decryptWithPassword = (encryptedData, password, parseJSON = false) => {
  try {
    return encryptionService.decryptWithPassword(encryptedData, password, parseJSON)
  } catch (error) {
    console.error('Error decrypting with password:', error)
    throw new Error('Failed to decrypt with password')
  }
}

/**
 * Generar clave maestra
 * @param {string} password - Contraseña
 * @returns {Object} { keyId, key, salt, metadata }
 */
export const generateMasterKey = (password) => {
  try {
    return keyManagement.generateMasterKey(password)
  } catch (error) {
    console.error('Error generating master key:', error)
    throw new Error('Failed to generate master key')
  }
}

/**
 * Obtener clave activa
 * @returns {Object} { keyId, key, metadata }
 */
export const getActiveKey = () => {
  try {
    return keyManagement.getActiveKey()
  } catch (error) {
    console.error('Error getting active key:', error)
    throw error
  }
}

/**
 * Rotar clave
 * @param {string} oldKeyId - ID de clave antigua
 * @param {string} password - Contraseña para nueva clave
 * @returns {Object} Nueva clave
 */
export const rotateKey = (oldKeyId, password) => {
  try {
    return keyManagement.rotateKey(oldKeyId, password)
  } catch (error) {
    console.error('Error rotating key:', error)
    throw new Error('Failed to rotate key')
  }
}

/**
 * Revocar clave
 * @param {string} keyId - ID de clave
 * @param {string} reason - Razón de revocación
 */
export const revokeKey = (keyId, reason = 'Manual revocation') => {
  try {
    return keyManagement.revokeKey(keyId, reason)
  } catch (error) {
    console.error('Error revoking key:', error)
    throw error
  }
}

/**
 * Crear hash HMAC
 * @param {string|Object} data - Datos
 * @param {string|Buffer} key - Clave HMAC
 * @returns {string} Hash
 */
export const createHMAC = (data, key) => {
  try {
    return encryptionService.createHMAC(data, key)
  } catch (error) {
    console.error('Error creating HMAC:', error)
    throw new Error('Failed to create HMAC')
  }
}

/**
 * Verificar HMAC
 * @param {string|Object} data - Datos
 * @param {string} hmac - HMAC a verificar
 * @param {string|Buffer} key - Clave HMAC
 * @returns {boolean} True si es válido
 */
export const verifyHMAC = (data, hmac, key) => {
  try {
    return encryptionService.verifyHMAC(data, hmac, key)
  } catch (error) {
    console.error('Error verifying HMAC:', error)
    return false
  }
}

/**
 * Hash seguro de contraseña
 * @param {string} password - Contraseña
 * @returns {string} Hash
 */
export const hashPassword = (password) => {
  try {
    return encryptionService.hashPassword(password)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verificar contraseña
 * @param {string} password - Contraseña a verificar
 * @param {string} hash - Hash almacenado
 * @returns {boolean} True si coincide
 */
export const verifyPassword = (password, hash) => {
  try {
    return encryptionService.verifyPassword(password, hash)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Generar clave aleatoria
 * @returns {string} Clave en base64
 */
export const generateRandomKey = () => {
  try {
    return encryptionService.generateKeyBase64()
  } catch (error) {
    console.error('Error generating random key:', error)
    throw new Error('Failed to generate random key')
  }
}

/**
 * Generar IV aleatorio
 * @returns {string} IV en base64
 */
export const generateRandomIV = () => {
  try {
    return encryptionService.generateIV().toString('base64')
  } catch (error) {
    console.error('Error generating random IV:', error)
    throw new Error('Failed to generate random IV')
  }
}

/**
 * Generar salt aleatorio
 * @returns {string} Salt en base64
 */
export const generateRandomSalt = () => {
  try {
    return encryptionService.generateSalt().toString('base64')
  } catch (error) {
    console.error('Error generating random salt:', error)
    throw new Error('Failed to generate random salt')
  }
}

/**
 * Exportar clave encriptada
 * @param {string} keyId - ID de clave
 * @param {string} exportPassword - Contraseña para exportación
 * @returns {string} Clave encriptada
 */
export const exportKey = (keyId, exportPassword) => {
  try {
    return keyManagement.exportKey(keyId, exportPassword)
  } catch (error) {
    console.error('Error exporting key:', error)
    throw new Error('Failed to export key')
  }
}

/**
 * Importar clave encriptada
 * @param {string} encryptedKey - Clave encriptada
 * @param {string} importPassword - Contraseña para importación
 * @returns {Object} { keyId, metadata }
 */
export const importKey = (encryptedKey, importPassword) => {
  try {
    return keyManagement.importKey(encryptedKey, importPassword)
  } catch (error) {
    console.error('Error importing key:', error)
    throw new Error('Failed to import key')
  }
}

/**
 * Obtener estadísticas de encriptación
 * @returns {Object} Estadísticas
 */
export const getEncryptionStats = () => {
  try {
    return {
      encryption: encryptionService.getStats(),
      keyManagement: keyManagement.getStats()
    }
  } catch (error) {
    console.error('Error getting encryption stats:', error)
    return {}
  }
}

/**
 * Obtener metadatos de clave
 * @param {string} keyId - ID de clave
 * @returns {Object} Metadatos
 */
export const getKeyMetadata = (keyId) => {
  try {
    return keyManagement.getKeyMetadata(keyId)
  } catch (error) {
    console.error('Error getting key metadata:', error)
    throw error
  }
}

/**
 * Obtener todas las claves activas
 * @returns {Array} Claves activas
 */
export const getActiveKeys = () => {
  try {
    return keyManagement.getActiveKeys()
  } catch (error) {
    console.error('Error getting active keys:', error)
    return []
  }
}

/**
 * Limpiar claves expiradas
 * @returns {number} Número de claves eliminadas
 */
export const cleanupExpiredKeys = () => {
  try {
    return keyManagement.cleanupExpiredKeys()
  } catch (error) {
    console.error('Error cleaning up expired keys:', error)
    return 0
  }
}

/**
 * Verificar si clave necesita rotación
 * @param {string} keyId - ID de clave
 * @returns {boolean} True si necesita rotación
 */
export const needsKeyRotation = (keyId) => {
  try {
    return keyManagement.needsRotation(keyId)
  } catch (error) {
    console.error('Error checking key rotation:', error)
    return false
  }
}

/**
 * Verificar si clave está expirada
 * @param {string} keyId - ID de clave
 * @returns {boolean} True si está expirada
 */
export const isKeyExpired = (keyId) => {
  try {
    return keyManagement.isExpired(keyId)
  } catch (error) {
    console.error('Error checking key expiration:', error)
    return true
  }
}

/**
 * Encriptar objeto completo
 * @param {Object} obj - Objeto a encriptar
 * @param {string} keyId - ID de clave (opcional)
 * @returns {Object} Objeto con datos encriptados
 */
export const encryptObject = (obj, keyId = null) => {
  try {
    const encrypted = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        encrypted[key] = encryptData(value, keyId)
      } else {
        encrypted[key] = value
      }
    }
    return encrypted
  } catch (error) {
    console.error('Error encrypting object:', error)
    throw new Error('Failed to encrypt object')
  }
}

/**
 * Desencriptar objeto completo
 * @param {Object} obj - Objeto con datos encriptados
 * @param {string} keyId - ID de clave (opcional)
 * @returns {Object} Objeto desencriptado
 */
export const decryptObject = (obj, keyId = null) => {
  try {
    const decrypted = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 0) {
        try {
          decrypted[key] = decryptData(value, keyId, true)
        } catch (e) {
          decrypted[key] = value
        }
      } else {
        decrypted[key] = value
      }
    }
    return decrypted
  } catch (error) {
    console.error('Error decrypting object:', error)
    throw new Error('Failed to decrypt object')
  }
}

export default {
  encryptData,
  decryptData,
  encryptWithPassword,
  decryptWithPassword,
  generateMasterKey,
  getActiveKey,
  rotateKey,
  revokeKey,
  createHMAC,
  verifyHMAC,
  hashPassword,
  verifyPassword,
  generateRandomKey,
  generateRandomIV,
  generateRandomSalt,
  exportKey,
  importKey,
  getEncryptionStats,
  getKeyMetadata,
  getActiveKeys,
  cleanupExpiredKeys,
  needsKeyRotation,
  isKeyExpired,
  encryptObject,
  decryptObject
}
