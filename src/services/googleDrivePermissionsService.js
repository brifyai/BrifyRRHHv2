/**
 * Google Drive Permissions Service
 * Gestión de permisos de Google Drive vía API
 */

import logger from '../lib/logger.js'
import { createClient } from '@supabase/supabase-js'

class GoogleDrivePermissionsService {
  constructor() {
    this.supabase = null
    this.currentUserId = null
  }

  /**
   * Inicializa la conexión a Supabase
   */
  initializeSupabase(supabaseClient, userId) {
    this.supabase = supabaseClient
    this.currentUserId = userId
    logger.info('GoogleDrivePermissionsService', `🔗 Supabase inicializado para usuario ${userId}`)
  }

  /**
   * Obtiene la configuración de permisos para una empresa
   */
  async getCompanyPermissions(companyId) {
    try {
      const { data, error } = await this.supabase
        .from('google_drive_permissions')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('GoogleDrivePermissionsService', 'Error obteniendo permisos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('GoogleDrivePermissionsService', 'Error en getCompanyPermissions:', error)
      throw error
    }
  }

  /**
   * Guarda la configuración de permisos para una empresa
   */
  async saveCompanyPermissions(companyId, permissions) {
    try {
      // Eliminar permisos existentes
      await this.supabase
        .from('google_drive_permissions')
        .delete()
        .eq('company_id', companyId)

      // Insertar nuevos permisos
      const permissionsToInsert = permissions.map(permission => ({
        company_id: companyId,
        employee_email: permission.employeeEmail,
        permission_level: permission.permissionLevel,
        folder_path: permission.folderPath || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await this.supabase
        .from('google_drive_permissions')
        .insert(permissionsToInsert)
        .select()

      if (error) {
        logger.error('GoogleDrivePermissionsService', 'Error guardando permisos:', error)
        throw error
      }

      logger.info('GoogleDrivePermissionsService', `✅ Permisos guardados para empresa ${companyId}`)
      return data
    } catch (error) {
      logger.error('GoogleDrivePermissionsService', 'Error en saveCompanyPermissions:', error)
      throw error
    }
  }

  /**
   * Aplica permisos a Google Drive usando la API
   */
  async applyPermissionsToGoogleDrive(accessToken, folderId, permissions) {
    try {
      const results = []

      for (const permission of permissions) {
        try {
          const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: this.mapPermissionLevelToRole(permission.permissionLevel),
              type: 'user',
              emailAddress: permission.employeeEmail
            })
          })

          if (response.ok) {
            const result = await response.json()
            results.push({
              email: permission.employeeEmail,
              success: true,
              permissionId: result.id
            })
            logger.info('GoogleDrivePermissionsService', `✅ Permiso aplicado para ${permission.employeeEmail}`)
          } else {
            const error = await response.json()
            results.push({
              email: permission.employeeEmail,
              success: false,
              error: error.error?.message || 'Error desconocido'
            })
            logger.error('GoogleDrivePermissionsService', `❌ Error aplicando permiso para ${permission.employeeEmail}:`, error)
          }
        } catch (error) {
          results.push({
            email: permission.employeeEmail,
            success: false,
            error: error.message
          })
          logger.error('GoogleDrivePermissionsService', `❌ Error en solicitud para ${permission.employeeEmail}:`, error)
        }
      }

      return results
    } catch (error) {
      logger.error('GoogleDrivePermissionsService', 'Error aplicando permisos a Google Drive:', error)
      throw error
    }
  }

  /**
   * Mapea niveles de permiso a roles de Google Drive
   */
  mapPermissionLevelToRole(permissionLevel) {
    const mapping = {
      'viewer': 'reader',
      'commenter': 'commenter',
      'editor': 'writer',
      'manager': 'owner'
    }
    return mapping[permissionLevel] || 'reader'
  }

  /**
   * Obtiene plantillas predefinidas de permisos
   */
  getPermissionTemplates() {
    return {
      viewer: {
        name: 'Visualizador',
        description: 'Solo puede ver archivos y carpetas',
        level: 'viewer'
      },
      commenter: {
        name: 'Comentador',
        description: 'Puede ver y comentar en archivos',
        level: 'commenter'
      },
      editor: {
        name: 'Editor',
        description: 'Puede ver, editar y crear archivos',
        level: 'editor'
      },
      manager: {
        name: 'Administrador',
        description: 'Control total sobre archivos y permisos',
        level: 'manager'
      }
    }
  }

  /**
   * Valida configuración de permisos
   */
  validatePermissions(permissions) {
    const errors = []

    if (!Array.isArray(permissions)) {
      errors.push('Los permisos deben ser un array')
      return errors
    }

    const validLevels = ['viewer', 'commenter', 'editor', 'manager']

    permissions.forEach((permission, index) => {
      if (!permission.employeeEmail || !permission.permissionLevel) {
        errors.push(`Permiso ${index + 1}: Email y nivel de permiso son requeridos`)
      }

      if (permission.employeeEmail && !this.isValidEmail(permission.employeeEmail)) {
        errors.push(`Permiso ${index + 1}: Email inválido`)
      }

      if (permission.permissionLevel && !validLevels.includes(permission.permissionLevel)) {
        errors.push(`Permiso ${index + 1}: Nivel de permiso inválido`)
      }
    })

    return errors
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export default new GoogleDrivePermissionsService()