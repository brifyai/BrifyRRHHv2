/**
 * MFA Utilities
 * Utilidades para Autenticación Multi-Factor
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import mfaService from '../lib/mfaService'

/**
 * Generar secreto TOTP para usuario
 * @param {string} email - Email del usuario
 * @param {string} issuer - Nombre de la aplicación
 * @returns {Object} { secret, qrCodeUrl, backupCodes }
 */
export const generateTOTPSecret = (email = 'user@example.com', issuer = 'BrifyRRHH') => {
  try {
    const result = mfaService.generateTOTPSecret()
    const qrCodeUrl = mfaService.generateQRCodeURL(result.secret, email, issuer)
    
    return {
      ...result,
      qrCodeUrl
    }
  } catch (error) {
    console.error('Error generating TOTP secret:', error)
    throw new Error('Failed to generate TOTP secret')
  }
}

/**
 * Verificar código TOTP
 * @param {string} secret - Secreto TOTP
 * @param {string} token - Token a verificar
 * @returns {boolean} True si es válido
 */
export const verifyTOTP = (secret, token) => {
  try {
    return mfaService.verifyTOTP(secret, token)
  } catch (error) {
    console.error('Error verifying TOTP:', error)
    return false
  }
}

/**
 * Generar OTP por SMS
 * @param {string} userId - ID del usuario
 * @param {string} phoneNumber - Número de teléfono
 * @returns {Object} { otp, expiresAt, maskedPhone }
 */
export const generateSMSOTP = (userId, phoneNumber) => {
  try {
    return mfaService.generateSMSOTP(userId, phoneNumber)
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
export const verifySMSOTP = (userId, otp) => {
  try {
    return mfaService.verifySMSOTP(userId, otp)
  } catch (error) {
    console.error('Error verifying SMS OTP:', error)
    return false
  }
}

/**
 * Generar códigos de respaldo
 * @param {number} count - Cantidad de códigos
 * @returns {Array} Array de códigos
 */
export const generateBackupCodes = (count = 10) => {
  try {
    return mfaService.generateBackupCodes(count)
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
export const verifyBackupCode = (userId, code) => {
  try {
    return mfaService.verifyBackupCode(userId, code)
  } catch (error) {
    console.error('Error verifying backup code:', error)
    return false
  }
}

/**
 * Registrar MFA para usuario
 * @param {string} userId - ID del usuario
 * @param {Object} mfaConfig - Configuración MFA
 * @returns {Object} Resultado del registro
 */
export const registerMFA = (userId, mfaConfig) => {
  try {
    return mfaService.registerMFA(userId, mfaConfig)
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
export const getMFAConfig = (userId) => {
  try {
    return mfaService.getMFAConfig(userId)
  } catch (error) {
    console.error('Error getting MFA config:', error)
    return null
  }
}

/**
 * Deshabilitar MFA para usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Resultado
 */
export const disableMFA = (userId) => {
  try {
    return mfaService.disableMFA(userId)
  } catch (error) {
    console.error('Error disabling MFA:', error)
    throw new Error('Failed to disable MFA')
  }
}

/**
 * Obtener estadísticas de MFA
 * @returns {Object} Estadísticas
 */
export const getMFAStats = () => {
  try {
    return mfaService.getStats()
  } catch (error) {
    console.error('Error getting MFA stats:', error)
    return {}
  }
}

/**
 * Configurar MFA completo para usuario (TOTP + SMS + Backup Codes)
 * @param {string} userId - ID del usuario
 * @param {string} email - Email del usuario
 * @param {string} phoneNumber - Número de teléfono
 * @returns {Object} Configuración completa
 */
export const setupCompleteMFA = (userId, email, phoneNumber) => {
  try {
    // Generar TOTP
    const totp = generateTOTPSecret(email)
    
    // Generar SMS OTP
    const smsOTP = generateSMSOTP(userId, phoneNumber)
    
    // Generar códigos de respaldo
    const backupCodes = generateBackupCodes(10)

    // Registrar MFA
    const mfaConfig = {
      totpSecret: totp.secret,
      phoneNumber,
      backupCodes
    }

    const result = registerMFA(userId, mfaConfig)

    return {
      userId,
      status: 'configured',
      totp: {
        secret: totp.secret,
        qrCodeUrl: totp.qrCodeUrl
      },
      sms: {
        maskedPhone: smsOTP.maskedPhone,
        expiresAt: smsOTP.expiresAt
      },
      backupCodes,
      methods: result.methods
    }
  } catch (error) {
    console.error('Error setting up complete MFA:', error)
    throw new Error('Failed to setup complete MFA')
  }
}

/**
 * Verificar MFA (intenta todos los métodos disponibles)
 * @param {string} userId - ID del usuario
 * @param {string} token - Token a verificar (TOTP, SMS OTP o Backup Code)
 * @param {string} secret - Secreto TOTP (si se verifica TOTP)
 * @returns {Object} { success, method, message }
 */
export const verifyMFA = (userId, token, secret = null) => {
  try {
    const config = getMFAConfig(userId)
    
    if (!config || !config.enabled) {
      return {
        success: false,
        method: null,
        message: 'MFA not enabled for this user'
      }
    }

    // Intentar verificar como TOTP
    if (config.methods.totp && secret) {
      if (verifyTOTP(secret, token)) {
        return {
          success: true,
          method: 'totp',
          message: 'TOTP verified successfully'
        }
      }
    }

    // Intentar verificar como SMS OTP
    if (config.methods.sms) {
      if (verifySMSOTP(userId, token)) {
        return {
          success: true,
          method: 'sms',
          message: 'SMS OTP verified successfully'
        }
      }
    }

    // Intentar verificar como Backup Code
    if (config.methods.backupCodes > 0) {
      if (verifyBackupCode(userId, token)) {
        return {
          success: true,
          method: 'backup_code',
          message: 'Backup code verified successfully'
        }
      }
    }

    return {
      success: false,
      method: null,
      message: 'Invalid token'
    }
  } catch (error) {
    console.error('Error verifying MFA:', error)
    return {
      success: false,
      method: null,
      message: 'Error verifying MFA'
    }
  }
}

/**
 * Obtener información de MFA para mostrar en UI
 * @param {string} userId - ID del usuario
 * @returns {Object} Información formateada
 */
export const getMFAInfo = (userId) => {
  try {
    const config = getMFAConfig(userId)
    
    if (!config) {
      return {
        enabled: false,
        methods: [],
        message: 'MFA not configured'
      }
    }

    const methods = []
    if (config.methods.totp) methods.push('Authenticator App (TOTP)')
    if (config.methods.sms) methods.push('SMS OTP')
    if (config.methods.backupCodes > 0) methods.push(`Backup Codes (${config.methods.backupCodes} remaining)`)

    return {
      enabled: config.enabled,
      methods,
      registeredAt: new Date(config.registeredAt).toLocaleString(),
      message: `MFA enabled with ${methods.length} method(s)`
    }
  } catch (error) {
    console.error('Error getting MFA info:', error)
    return {
      enabled: false,
      methods: [],
      message: 'Error retrieving MFA info'
    }
  }
}

/**
 * Formatear código de respaldo para mostrar
 * @param {string} code - Código sin formato
 * @returns {string} Código formateado
 */
export const formatBackupCode = (code) => {
  try {
    const cleaned = code.toUpperCase().replace(/\s/g, '')
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`
  } catch (error) {
    return code
  }
}

/**
 * Validar formato de código TOTP
 * @param {string} token - Token a validar
 * @returns {boolean} True si es válido
 */
export const isValidTOTPFormat = (token) => {
  try {
    return /^\d{6}$/.test(token)
  } catch (error) {
    return false
  }
}

/**
 * Validar formato de código de respaldo
 * @param {string} code - Código a validar
 * @returns {boolean} True si es válido
 */
export const isValidBackupCodeFormat = (code) => {
  try {
    const cleaned = code.toUpperCase().replace(/\s/g, '')
    return /^[A-F0-9]{8}$/.test(cleaned)
  } catch (error) {
    return false
  }
}

/**
 * Obtener tiempo restante para TOTP actual
 * @returns {number} Segundos restantes (0-30)
 */
export const getTOTPTimeRemaining = () => {
  try {
    const now = Math.floor(Date.now() / 1000)
    const period = 30
    return period - (now % period)
  } catch (error) {
    return 0
  }
}

export default {
  generateTOTPSecret,
  verifyTOTP,
  generateSMSOTP,
  verifySMSOTP,
  generateBackupCodes,
  verifyBackupCode,
  registerMFA,
  getMFAConfig,
  disableMFA,
  getMFAStats,
  setupCompleteMFA,
  verifyMFA,
  getMFAInfo,
  formatBackupCode,
  isValidTOTPFormat,
  isValidBackupCodeFormat,
  getTOTPTimeRemaining
}
