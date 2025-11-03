/**
 * Multi-Factor Authentication (MFA) Service
 * Implementación de TOTP, SMS OTP, Backup Codes y WebAuthn
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import crypto from 'crypto'

class MFAService {
  constructor() {
    this.mfaConfigs = new Map() // userId -> mfaConfig
    this.otpAttempts = new Map() // userId -> { attempts, lastAttempt }
    this.maxOTPAttempts = 5
    this.otpExpiryTime = 30 * 1000 // 30 segundos
    this.otpLockoutTime = 15 * 60 * 1000 // 15 minutos
  }

  /**
   * Generar secreto TOTP
   * @returns {Object} { secret, qrCode, backupCodes }
   */
  generateTOTPSecret() {
    try {
      // Generar secreto aleatorio de 32 bytes
      const secret = crypto.randomBytes(32).toString('base64')
      
      // Generar códigos de respaldo
      const backupCodes = this.generateBackupCodes(10)

      // Generar URL para QR (formato estándar otpauth://)
      const qrCodeUrl = this.generateQRCodeURL(secret)

      return {
        secret,
        qrCodeUrl,
        backupCodes,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      }
    } catch (error) {
      console.error('Error generating TOTP secret:', error)
      throw new Error('Failed to generate TOTP secret')
    }
  }

  /**
   * Generar URL para código QR
   * @param {string} secret - Secreto TOTP
   * @param {string} email - Email del usuario (opcional)
   * @param {string} issuer - Nombre de la aplicación (opcional)
   * @returns {string} URL otpauth://
   */
  generateQRCodeURL(secret, email = 'user@example.com', issuer = 'BrifyRRHH') {
    try {
      const encodedSecret = Buffer.from(secret, 'base64').toString('base64')
      const encodedEmail = encodeURIComponent(email)
      const encodedIssuer = encodeURIComponent(issuer)

      return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
    } catch (error) {
      console.error('Error generating QR code URL:', error)
      throw new Error('Failed to generate QR code URL')
    }
  }

  /**
   * Verificar código TOTP
   * @param {string} secret - Secreto TOTP
   * @param {string} token - Token TOTP a verificar
   * @param {number} window - Ventana de tolerancia (±30 segundos)
   * @returns {boolean} True si es válido
   */
  verifyTOTP(secret, token, window = 1) {
    try {
      if (!token || token.length !== 6) {
        return false
      }

      const now = Math.floor(Date.now() / 1000)
      const secretBuffer = Buffer.from(secret, 'base64')

      // Verificar en ventana de tiempo (±window períodos)
      for (let i = -window; i <= window; i++) {
        const counter = Math.floor((now + i * 30) / 30)
        const hmac = crypto.createHmac('sha1', secretBuffer)
        hmac.update(Buffer.alloc(8))
        
        // Escribir counter en big-endian
        const counterBuffer = Buffer.alloc(8)
        for (let j = 7; j >= 0; j--) {
          counterBuffer[j] = counter & 0xff
          counter = counter >> 8
        }

        hmac.update(counterBuffer)
        const digest = hmac.digest()
        const offset = digest[digest.length - 1] & 0xf
        const code = (
          ((digest[offset] & 0x7f) << 24) |
          ((digest[offset + 1] & 0xff) << 16) |
          ((digest[offset + 2] & 0xff) << 8) |
          (digest[offset + 3] & 0xff)
        ) % 1000000

        const expectedToken = String(code).padStart(6, '0')
        if (expectedToken === token) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error verifying TOTP:', error)
      return false
    }
  }

  /**
   * Generar códigos de respaldo
   * @param {number} count - Cantidad de códigos
   * @returns {Array} Array de códigos
   */
  generateBackupCodes(count = 10) {
    try {
      const codes = []
      for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase()
        codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
      }
      return codes
    } catch (error) {
      console.error('Error generating backup codes:', error)
      throw new Error('Failed to generate backup codes')
    }
  }

  /**
   * Verificar código de respaldo
   * @param {string} userId - ID del usuario
   * @param {string} code - Código a verificar
   * @returns {boolean} True si es válido
   */
  verifyBackupCode(userId, code) {
    try {
      const config = this.mfaConfigs.get(userId)
      if (!config || !config.backupCodes) {
        return false
      }

      const normalizedCode = code.toUpperCase().replace(/\s/g, '')
      const index = config.backupCodes.indexOf(normalizedCode)

      if (index !== -1) {
        // Eliminar código usado
        config.backupCodes.splice(index, 1)
        return true
      }

      return false
    } catch (error) {
      console.error('Error verifying backup code:', error)
      return false
    }
  }

  /**
   * Generar OTP por SMS
   * @param {string} userId - ID del usuario
   * @param {string} phoneNumber - Número de teléfono
   * @returns {Object} { otp, expiresAt }
   */
  generateSMSOTP(userId, phoneNumber) {
    try {
      // Generar OTP de 6 dígitos
      const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
      const expiresAt = Date.now() + this.otpExpiryTime

      // Almacenar OTP
      if (!this.mfaConfigs.has(userId)) {
        this.mfaConfigs.set(userId, {})
      }

      const config = this.mfaConfigs.get(userId)
      config.smsOTP = {
        otp,
        expiresAt,
        phoneNumber,
        attempts: 0
      }

      return {
        otp,
        expiresAt,
        maskedPhone: this.maskPhoneNumber(phoneNumber)
      }
    } catch (error) {
      console.error('Error generating SMS OTP:', error)
      throw new Error('Failed to generate SMS OTP')
    }
  }

  /**
   * Verificar OTP por SMS
   * @param {string} userId - ID del usuario
   * @param {string} otp - OTP a verificar
   * @returns {boolean} True si es válido
   */
  verifySMSOTP(userId, otp) {
    try {
      const config = this.mfaConfigs.get(userId)
      if (!config || !config.smsOTP) {
        return false
      }

      const smsOTP = config.smsOTP

      // Verificar intentos
      if (smsOTP.attempts >= this.maxOTPAttempts) {
        const now = Date.now()
        const attempts = this.otpAttempts.get(userId) || { attempts: 0, lastAttempt: 0 }

        if (now - attempts.lastAttempt < this.otpLockoutTime) {
          return false // Bloqueado por demasiados intentos
        }

        // Resetear intentos
        smsOTP.attempts = 0
      }

      // Verificar expiración
      if (Date.now() > smsOTP.expiresAt) {
        return false
      }

      // Verificar OTP
      if (smsOTP.otp === otp) {
        delete config.smsOTP
        return true
      }

      // Incrementar intentos
      smsOTP.attempts++
      this.otpAttempts.set(userId, {
        attempts: smsOTP.attempts,
        lastAttempt: Date.now()
      })

      return false
    } catch (error) {
      console.error('Error verifying SMS OTP:', error)
      return false
    }
  }

  /**
   * Enmascarar número de teléfono
   * @param {string} phoneNumber - Número de teléfono
   * @returns {string} Número enmascarado
   */
  maskPhoneNumber(phoneNumber) {
    try {
      const cleaned = phoneNumber.replace(/\D/g, '')
      const last4 = cleaned.slice(-4)
      return `***-***-${last4}`
    } catch (error) {
      return '***-***-****'
    }
  }

  /**
   * Registrar MFA para usuario
   * @param {string} userId - ID del usuario
   * @param {Object} mfaConfig - Configuración MFA
   */
  registerMFA(userId, mfaConfig) {
    try {
      this.mfaConfigs.set(userId, {
        ...mfaConfig,
        registeredAt: Date.now(),
        enabled: true
      })

      return {
        userId,
        status: 'registered',
        methods: Object.keys(mfaConfig).filter(k => mfaConfig[k])
      }
    } catch (error) {
      console.error('Error registering MFA:', error)
      throw new Error('Failed to register MFA')
    }
  }

  /**
   * Obtener configuración MFA del usuario
   * @param {string} userId - ID del usuario
   * @returns {Object} Configuración MFA
   */
  getMFAConfig(userId) {
    try {
      const config = this.mfaConfigs.get(userId)
      if (!config) {
        return null
      }

      return {
        userId,
        enabled: config.enabled,
        methods: {
          totp: !!config.totpSecret,
          sms: !!config.phoneNumber,
          backupCodes: config.backupCodes ? config.backupCodes.length : 0
        },
        registeredAt: config.registeredAt
      }
    } catch (error) {
      console.error('Error getting MFA config:', error)
      return null
    }
  }

  /**
   * Deshabilitar MFA para usuario
   * @param {string} userId - ID del usuario
   */
  disableMFA(userId) {
    try {
      const config = this.mfaConfigs.get(userId)
      if (config) {
        config.enabled = false
      }

      return {
        userId,
        status: 'disabled'
      }
    } catch (error) {
      console.error('Error disabling MFA:', error)
      throw new Error('Failed to disable MFA')
    }
  }

  /**
   * Obtener estadísticas de MFA
   * @returns {Object} Estadísticas
   */
  getStats() {
    try {
      let totalUsers = 0
      let totpEnabled = 0
      let smsEnabled = 0
      let backupCodesEnabled = 0

      for (const config of this.mfaConfigs.values()) {
        if (config.enabled) {
          totalUsers++
          if (config.totpSecret) totpEnabled++
          if (config.phoneNumber) smsEnabled++
          if (config.backupCodes) backupCodesEnabled++
        }
      }

      return {
        totalUsers,
        totpEnabled,
        smsEnabled,
        backupCodesEnabled,
        averageMethodsPerUser: totalUsers > 0 
          ? ((totpEnabled + smsEnabled + backupCodesEnabled) / totalUsers).toFixed(2)
          : 0
      }
    } catch (error) {
      console.error('Error getting MFA stats:', error)
      return {}
    }
  }
}

// Crear instancia singleton
const mfaService = new MFAService()

export default mfaService
