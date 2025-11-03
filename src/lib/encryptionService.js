/**
 * Encryption Service
 * Servicio de encriptación End-to-End con AES-256-GCM
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import crypto from 'crypto'

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.keyLength = 32 // 256 bits
    this.ivLength = 16 // 128 bits
    this.saltLength = 16 // 128 bits
    this.tagLength = 16 // 128 bits
  }

  /**
   * Generar clave derivada desde contraseña
   * @param {string} password - Contraseña
   * @param {Buffer} salt - Salt (se genera si no se proporciona)
   * @returns {Object} { key, salt }
   */
  deriveKey(password, salt = null) {
    try {
      if (!salt) {
        salt = crypto.randomBytes(this.saltLength)
      }

      // PBKDF2 con 100,000 iteraciones
      const key = crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        this.keyLength,
        'sha256'
      )

      return { key, salt }
    } catch (error) {
      console.error('Error deriving key:', error)
      throw new Error('Failed to derive encryption key')
    }
  }

  /**
   * Encriptar datos
   * @param {string|Object} data - Datos a encriptar
   * @param {string|Buffer} key - Clave de encriptación
   * @returns {string} Datos encriptados en formato base64
   */
  encrypt(data, key) {
    try {
      // Convertir datos a string si es necesario
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data)

      // Convertir clave si es string
      if (typeof key === 'string') {
        key = Buffer.from(key, 'base64')
      }

      // Generar IV aleatorio
      const iv = crypto.randomBytes(this.ivLength)

      // Crear cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv)

      // Encriptar
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Obtener auth tag
      const authTag = cipher.getAuthTag()

      // Combinar: iv + authTag + encrypted
      const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')])

      // Retornar en base64
      return combined.toString('base64')
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Desencriptar datos
   * @param {string} encryptedData - Datos encriptados en base64
   * @param {string|Buffer} key - Clave de desencriptación
   * @param {boolean} parseJSON - Parsear resultado como JSON
   * @returns {string|Object} Datos desencriptados
   */
  decrypt(encryptedData, key, parseJSON = false) {
    try {
      // Convertir clave si es string
      if (typeof key === 'string') {
        key = Buffer.from(key, 'base64')
      }

      // Convertir de base64
      const combined = Buffer.from(encryptedData, 'base64')

      // Extraer componentes
      const iv = combined.slice(0, this.ivLength)
      const authTag = combined.slice(this.ivLength, this.ivLength + this.tagLength)
      const encrypted = combined.slice(this.ivLength + this.tagLength)

      // Crear decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
      decipher.setAuthTag(authTag)

      // Desencriptar
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      // Parsear JSON si es necesario
      if (parseJSON) {
        try {
          return JSON.parse(decrypted)
        } catch (e) {
          return decrypted
        }
      }

      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Generar clave aleatoria
   * @returns {Buffer} Clave aleatoria de 256 bits
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength)
  }

  /**
   * Generar clave en base64
   * @returns {string} Clave en base64
   */
  generateKeyBase64() {
    return this.generateKey().toString('base64')
  }

  /**
   * Generar IV aleatorio
   * @returns {Buffer} IV aleatorio
   */
  generateIV() {
    return crypto.randomBytes(this.ivLength)
  }

  /**
   * Generar salt aleatorio
   * @returns {Buffer} Salt aleatorio
   */
  generateSalt() {
    return crypto.randomBytes(this.saltLength)
  }

  /**
   * Crear hash HMAC para autenticación
   * @param {string|Buffer} data - Datos a hashear
   * @param {string|Buffer} key - Clave HMAC
   * @returns {string} Hash en hexadecimal
   */
  createHMAC(data, key) {
    try {
      if (typeof key === 'string') {
        key = Buffer.from(key, 'base64')
      }

      const hmac = crypto.createHmac('sha256', key)
      hmac.update(typeof data === 'string' ? data : JSON.stringify(data))
      return hmac.digest('hex')
    } catch (error) {
      console.error('HMAC creation error:', error)
      throw new Error('Failed to create HMAC')
    }
  }

  /**
   * Verificar HMAC
   * @param {string|Buffer} data - Datos originales
   * @param {string} hmac - HMAC a verificar
   * @param {string|Buffer} key - Clave HMAC
   * @returns {boolean} True si es válido
   */
  verifyHMAC(data, hmac, key) {
    try {
      const computed = this.createHMAC(data, key)
      // Comparación segura contra timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(hmac)
      )
    } catch (error) {
      console.error('HMAC verification error:', error)
      return false
    }
  }

  /**
   * Encriptar con contraseña
   * @param {string|Object} data - Datos a encriptar
   * @param {string} password - Contraseña
   * @returns {string} Datos encriptados con salt incluido
   */
  encryptWithPassword(data, password) {
    try {
      const { key, salt } = this.deriveKey(password)
      const encrypted = this.encrypt(data, key)
      
      // Combinar salt + encrypted
      const combined = Buffer.concat([salt, Buffer.from(encrypted, 'base64')])
      return combined.toString('base64')
    } catch (error) {
      console.error('Password encryption error:', error)
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
  decryptWithPassword(encryptedData, password, parseJSON = false) {
    try {
      const combined = Buffer.from(encryptedData, 'base64')
      
      // Extraer salt
      const salt = combined.slice(0, this.saltLength)
      const encrypted = combined.slice(this.saltLength).toString('base64')
      
      // Derivar clave con salt
      const { key } = this.deriveKey(password, salt)
      
      // Desencriptar
      return this.decrypt(encrypted, key, parseJSON)
    } catch (error) {
      console.error('Password decryption error:', error)
      throw new Error('Failed to decrypt with password')
    }
  }

  /**
   * Generar hash seguro (para contraseñas)
   * @param {string} data - Datos a hashear
   * @param {number} rounds - Rondas de bcrypt (default: 10)
   * @returns {string} Hash
   */
  hashPassword(data, rounds = 10) {
    try {
      // Usar PBKDF2 como alternativa a bcrypt
      const salt = crypto.randomBytes(this.saltLength)
      const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha256')
      
      // Formato: salt:hash
      return `${salt.toString('base64')}:${hash.toString('base64')}`
    } catch (error) {
      console.error('Password hashing error:', error)
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verificar hash de contraseña
   * @param {string} data - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @returns {boolean} True si coincide
   */
  verifyPassword(data, hash) {
    try {
      const [saltStr, hashStr] = hash.split(':')
      const salt = Buffer.from(saltStr, 'base64')
      const computed = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha256')
      
      return crypto.timingSafeEqual(
        computed,
        Buffer.from(hashStr, 'base64')
      )
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  /**
   * Obtener estadísticas de encriptación
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      ivLength: this.ivLength,
      saltLength: this.saltLength,
      tagLength: this.tagLength,
      pbkdf2Iterations: 100000,
      hashAlgorithm: 'sha256'
    }
  }
}

// Crear instancia singleton
const encryptionService = new EncryptionService()

export default encryptionService
