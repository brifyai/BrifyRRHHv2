/**
 * Key Management Service
 * Gestión segura de claves de encriptación
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import encryptionService from './encryptionService'

class KeyManagement {
  constructor() {
    this.keys = new Map() // Almacenamiento en memoria
    this.keyMetadata = new Map() // Metadatos de claves
    this.rotationInterval = 30 * 24 * 60 * 60 * 1000 // 30 días
    this.maxKeyAge = 90 * 24 * 60 * 60 * 1000 // 90 días
  }

  /**
   * Generar nueva clave maestra
   * @param {string} password - Contraseña para derivar la clave
   * @returns {Object} { keyId, key, salt, metadata }
   */
  generateMasterKey(password) {
    try {
      const keyId = this.generateKeyId()
      const { key, salt } = encryptionService.deriveKey(password)

      const metadata = {
        keyId,
        createdAt: Date.now(),
        algorithm: 'aes-256-gcm',
        derivationMethod: 'pbkdf2',
        iterations: 100000,
        status: 'active',
        rotationDue: Date.now() + this.rotationInterval
      }

      this.keys.set(keyId, key)
      this.keyMetadata.set(keyId, metadata)

      return {
        keyId,
        key: key.toString('base64'),
        salt: salt.toString('base64'),
        metadata
      }
    } catch (error) {
      console.error('Error generating master key:', error)
      throw new Error('Failed to generate master key')
    }
  }

  /**
   * Generar ID único para clave
   * @returns {string} ID único
   */
  generateKeyId() {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Almacenar clave
   * @param {string} keyId - ID de la clave
   * @param {Buffer|string} key - Clave a almacenar
   * @param {Object} metadata - Metadatos opcionales
   */
  storeKey(keyId, key, metadata = {}) {
    try {
      if (typeof key === 'string') {
        key = Buffer.from(key, 'base64')
      }

      const defaultMetadata = {
        keyId,
        createdAt: Date.now(),
        algorithm: 'aes-256-gcm',
        status: 'active',
        rotationDue: Date.now() + this.rotationInterval,
        ...metadata
      }

      this.keys.set(keyId, key)
      this.keyMetadata.set(keyId, defaultMetadata)

      return defaultMetadata
    } catch (error) {
      console.error('Error storing key:', error)
      throw new Error('Failed to store key')
    }
  }

  /**
   * Obtener clave por ID
   * @param {string} keyId - ID de la clave
   * @returns {Buffer} Clave
   */
  getKey(keyId) {
    try {
      const key = this.keys.get(keyId)
      if (!key) {
        throw new Error(`Key not found: ${keyId}`)
      }

      const metadata = this.keyMetadata.get(keyId)
      if (metadata.status === 'revoked') {
        throw new Error(`Key is revoked: ${keyId}`)
      }

      return key
    } catch (error) {
      console.error('Error retrieving key:', error)
      throw error
    }
  }

  /**
   * Obtener clave activa más reciente
   * @returns {Object} { keyId, key, metadata }
   */
  getActiveKey() {
    try {
      let activeKey = null
      let latestTime = 0

      for (const [keyId, metadata] of this.keyMetadata.entries()) {
        if (metadata.status === 'active' && metadata.createdAt > latestTime) {
          activeKey = keyId
          latestTime = metadata.createdAt
        }
      }

      if (!activeKey) {
        throw new Error('No active key found')
      }

      return {
        keyId: activeKey,
        key: this.keys.get(activeKey),
        metadata: this.keyMetadata.get(activeKey)
      }
    } catch (error) {
      console.error('Error getting active key:', error)
      throw error
    }
  }

  /**
   * Rotar clave (crear nueva, marcar antigua como deprecated)
   * @param {string} oldKeyId - ID de clave antigua
   * @param {string} password - Contraseña para nueva clave
   * @returns {Object} Nueva clave
   */
  rotateKey(oldKeyId, password) {
    try {
      // Marcar clave antigua como deprecated
      const oldMetadata = this.keyMetadata.get(oldKeyId)
      if (oldMetadata) {
        oldMetadata.status = 'deprecated'
        oldMetadata.deprecatedAt = Date.now()
      }

      // Generar nueva clave
      return this.generateMasterKey(password)
    } catch (error) {
      console.error('Error rotating key:', error)
      throw new Error('Failed to rotate key')
    }
  }

  /**
   * Revocar clave
   * @param {string} keyId - ID de clave a revocar
   * @param {string} reason - Razón de revocación
   */
  revokeKey(keyId, reason = 'Manual revocation') {
    try {
      const metadata = this.keyMetadata.get(keyId)
      if (!metadata) {
        throw new Error(`Key not found: ${keyId}`)
      }

      metadata.status = 'revoked'
      metadata.revokedAt = Date.now()
      metadata.revocationReason = reason

      return metadata
    } catch (error) {
      console.error('Error revoking key:', error)
      throw error
    }
  }

  /**
   * Verificar si clave necesita rotación
   * @param {string} keyId - ID de clave
   * @returns {boolean} True si necesita rotación
   */
  needsRotation(keyId) {
    try {
      const metadata = this.keyMetadata.get(keyId)
      if (!metadata) return false

      const now = Date.now()
      return now > metadata.rotationDue
    } catch (error) {
      console.error('Error checking rotation:', error)
      return false
    }
  }

  /**
   * Verificar si clave está expirada
   * @param {string} keyId - ID de clave
   * @returns {boolean} True si está expirada
   */
  isExpired(keyId) {
    try {
      const metadata = this.keyMetadata.get(keyId)
      if (!metadata) return true

      const now = Date.now()
      const age = now - metadata.createdAt
      return age > this.maxKeyAge
    } catch (error) {
      console.error('Error checking expiration:', error)
      return true
    }
  }

  /**
   * Obtener todas las claves activas
   * @returns {Array} Array de claves activas
   */
  getActiveKeys() {
    try {
      const activeKeys = []

      for (const [keyId, metadata] of this.keyMetadata.entries()) {
        if (metadata.status === 'active' && !this.isExpired(keyId)) {
          activeKeys.push({
            keyId,
            metadata
          })
        }
      }

      return activeKeys
    } catch (error) {
      console.error('Error getting active keys:', error)
      return []
    }
  }

  /**
   * Obtener metadatos de clave
   * @param {string} keyId - ID de clave
   * @returns {Object} Metadatos
   */
  getKeyMetadata(keyId) {
    try {
      const metadata = this.keyMetadata.get(keyId)
      if (!metadata) {
        throw new Error(`Key not found: ${keyId}`)
      }

      return {
        ...metadata,
        needsRotation: this.needsRotation(keyId),
        isExpired: this.isExpired(keyId)
      }
    } catch (error) {
      console.error('Error getting key metadata:', error)
      throw error
    }
  }

  /**
   * Limpiar claves expiradas
   * @returns {number} Número de claves eliminadas
   */
  cleanupExpiredKeys() {
    try {
      let count = 0
      const keysToDelete = []

      for (const [keyId, metadata] of this.keyMetadata.entries()) {
        if (this.isExpired(keyId) && metadata.status !== 'active') {
          keysToDelete.push(keyId)
          count++
        }
      }

      keysToDelete.forEach(keyId => {
        this.keys.delete(keyId)
        this.keyMetadata.delete(keyId)
      })

      return count
    } catch (error) {
      console.error('Error cleaning up expired keys:', error)
      return 0
    }
  }

  /**
   * Exportar clave encriptada
   * @param {string} keyId - ID de clave
   * @param {string} exportPassword - Contraseña para encriptar exportación
   * @returns {string} Clave encriptada en base64
   */
  exportKey(keyId, exportPassword) {
    try {
      const key = this.getKey(keyId)
      const metadata = this.getKeyMetadata(keyId)

      const exportData = {
        key: key.toString('base64'),
        metadata
      }

      return encryptionService.encryptWithPassword(
        JSON.stringify(exportData),
        exportPassword
      )
    } catch (error) {
      console.error('Error exporting key:', error)
      throw new Error('Failed to export key')
    }
  }

  /**
   * Importar clave encriptada
   * @param {string} encryptedKey - Clave encriptada
   * @param {string} importPassword - Contraseña para desencriptar
   * @returns {Object} { keyId, metadata }
   */
  importKey(encryptedKey, importPassword) {
    try {
      const decrypted = encryptionService.decryptWithPassword(
        encryptedKey,
        importPassword,
        true
      )

      const { key, metadata } = decrypted
      const keyBuffer = Buffer.from(key, 'base64')

      this.storeKey(metadata.keyId, keyBuffer, metadata)

      return {
        keyId: metadata.keyId,
        metadata
      }
    } catch (error) {
      console.error('Error importing key:', error)
      throw new Error('Failed to import key')
    }
  }

  /**
   * Obtener estadísticas de claves
   * @returns {Object} Estadísticas
   */
  getStats() {
    try {
      const stats = {
        totalKeys: this.keys.size,
        activeKeys: 0,
        deprecatedKeys: 0,
        revokedKeys: 0,
        expiredKeys: 0,
        needsRotation: 0
      }

      for (const [keyId, metadata] of this.keyMetadata.entries()) {
        if (metadata.status === 'active') stats.activeKeys++
        if (metadata.status === 'deprecated') stats.deprecatedKeys++
        if (metadata.status === 'revoked') stats.revokedKeys++
        if (this.isExpired(keyId)) stats.expiredKeys++
        if (this.needsRotation(keyId)) stats.needsRotation++
      }

      return stats
    } catch (error) {
      console.error('Error getting stats:', error)
      return {}
    }
  }

  /**
   * Limpiar todas las claves (para testing)
   */
  clearAll() {
    this.keys.clear()
    this.keyMetadata.clear()
  }
}

// Crear instancia singleton
const keyManagement = new KeyManagement()

export default keyManagement
