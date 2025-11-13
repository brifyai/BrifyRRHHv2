/**
 * Google Drive Sync Service - Refactorizado
 * Sincronización bidireccional Drive ↔ Supabase con logging detallado
 */

import { supabase } from '../lib/supabaseClient.js'
import googleDriveService from '../lib/googleDrive.js'
import googleDriveAuthService from '../lib/googleDriveAuthService.js'
import logger from '../lib/logger.js'

class GoogleDriveSyncService {
  constructor() {
    this.syncIntervals = new Map()
    this.isInitialized = false
    this.syncErrors = []
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    try {
      logger.info('GoogleDriveSyncService', '🔄 Inicializando servicio de sincronización...')
      
      // Inicializar servicio de Google Drive
      await googleDriveService.initialize()
      
      // Verificar que Google Drive esté autenticado
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = '❌ Google Drive no está autenticado. Por favor, conecta tu cuenta de Google Drive primero.'
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }
      
      this.isInitialized = true
      logger.info('GoogleDriveSyncService', '✅ Servicio de sincronización inicializado')
      return true
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error inicializando: ${error.message}`)
      this.recordError(error.message)
      return false
    }
  }

  /**
   * Registra un error de sincronización
   */
  recordError(error) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      error: error
    }
    this.syncErrors.push(errorRecord)
    
    // Mantener solo los últimos 100 errores
    if (this.syncErrors.length > 100) {
      this.syncErrors = this.syncErrors.slice(-100)
    }
    
    logger.error('GoogleDriveSyncService', `📊 Error registrado: ${error}`)
  }

  /**
   * Obtiene los errores de sincronización
   */
  getSyncErrors() {
    return this.syncErrors
  }

  /**
   * Limpia los errores de sincronización
   */
  clearSyncErrors() {
    this.syncErrors = []
    logger.info('GoogleDriveSyncService', '🧹 Errores limpiados')
  }

  /**
   * Crea una carpeta de empleado en Google Drive y Supabase
   */
  async createEmployeeFolderInDrive(employeeEmail, employeeName, companyName, employeeData = {}) {
    try {
      logger.info('GoogleDriveSyncService', `📁 Creando carpeta para ${employeeEmail}...`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede crear carpeta para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Crear carpeta principal de la empresa
      const parentFolderName = `Empleados - ${companyName}`
      logger.info('GoogleDriveSyncService', `🔍 Buscando/creando carpeta padre: ${parentFolderName}`)
      let parentFolder = await this.findOrCreateParentFolder(parentFolderName)

      // Crear carpeta del empleado en Google Drive
      const folderName = `${employeeName} (${employeeEmail})`
      logger.info('GoogleDriveSyncService', `📁 Creando carpeta del empleado: ${folderName}`)
      const employeeFolder = await googleDriveService.createFolder(folderName, parentFolder.id)

      if (!employeeFolder || !employeeFolder.id) {
        throw new Error('No se pudo crear carpeta en Google Drive')
      }

      logger.info('GoogleDriveSyncService', `✅ Carpeta creada en Google Drive: ${employeeFolder.id}`)

      // Compartir carpeta con el empleado
      logger.info('GoogleDriveSyncService', `🔗 Compartiendo carpeta con ${employeeEmail}...`)
      await googleDriveService.shareFolder(employeeFolder.id, employeeEmail, 'writer')
      logger.info('GoogleDriveSyncService', `✅ Carpeta compartida con ${employeeEmail}`)

      // Obtener información de la empresa
      let companyId = null
      if (employeeData.company_id) {
        companyId = employeeData.company_id
      }

      // Crear registro en Supabase
      logger.info('GoogleDriveSyncService', `💾 Registrando carpeta en Supabase...`)
      const { data: supabaseFolder, error: supabaseError } = await supabase
        .from('employee_folders')
        .insert({
          employee_email: employeeEmail,
          employee_id: employeeData.id,
          employee_name: employeeName,
          employee_position: employeeData.position,
          employee_department: employeeData.department,
          employee_phone: employeeData.phone,
          employee_region: employeeData.region,
          employee_level: employeeData.level,
          employee_work_mode: employeeData.work_mode,
          employee_contract_type: employeeData.contract_type,
          company_id: companyId,
          company_name: companyName,
          drive_folder_id: employeeFolder.id,
          drive_folder_url: `https://drive.google.com/drive/folders/${employeeFolder.id}`,
          folder_status: 'active',
          settings: {
            notificationPreferences: {
              whatsapp: true,
              telegram: true,
              email: true
            },
            responseLanguage: 'es',
            timezone: 'America/Santiago'
          }
        })
        .select()
        .maybeSingle()

      if (supabaseError) {
        logger.warn('GoogleDriveSyncService', `⚠️ Error registrando en Supabase: ${supabaseError.message}`)
        // No lanzar error, la carpeta en Drive ya fue creada
      } else {
        logger.info('GoogleDriveSyncService', `✅ Carpeta registrada en Supabase: ${supabaseFolder.id}`)
      }

      return {
        driveFolder: employeeFolder,
        supabaseFolder: supabaseFolder,
        syncStatus: 'created_in_both'
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error creando carpeta para ${employeeEmail}: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Busca o crea la carpeta principal de la empresa
   */
  async findOrCreateParentFolder(folderName) {
    try {
      logger.info('GoogleDriveSyncService', `🔍 Buscando carpeta: ${folderName}`)
      
      const folders = await googleDriveService.listFiles()
      const parentFolder = folders.find(folder =>
        folder.name === folderName &&
        folder.mimeType === 'application/vnd.google-apps.folder'
      )

      if (parentFolder) {
        logger.info('GoogleDriveSyncService', `✅ Carpeta encontrada: ${parentFolder.id}`)
        return parentFolder
      }

      logger.info('GoogleDriveSyncService', `📁 Creando nueva carpeta: ${folderName}`)
      return await googleDriveService.createFolder(folderName)
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error buscando/creando carpeta ${folderName}: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Sincroniza archivos de Google Drive a Supabase
   */
  async syncFilesFromDrive(folderId, employeeEmail) {
    try {
      logger.info('GoogleDriveSyncService', `🔄 Sincronizando archivos de Drive para ${employeeEmail}...`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede sincronizar archivos para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Obtener archivos de la carpeta en Google Drive
      logger.info('GoogleDriveSyncService', `📂 Listando archivos de ${folderId}...`)
      const files = await googleDriveService.listFiles(folderId)

      if (!files || files.length === 0) {
        logger.info('GoogleDriveSyncService', `ℹ️ No hay archivos para sincronizar en ${employeeEmail}`)
        return { synced: 0, errors: 0 }
      }

      logger.info('GoogleDriveSyncService', `📊 ${files.length} archivos encontrados`)

      let synced = 0
      let errors = 0

      // Sincronizar cada archivo
      for (const file of files) {
        try {
          logger.info('GoogleDriveSyncService', `📄 Procesando archivo: ${file.name}`)
          
          // Verificar si el archivo ya existe en Supabase
          const { data: existing } = await supabase
            .from('employee_documents')
            .select('id')
            .eq('google_file_id', file.id)
            .maybeSingle()

          if (!existing) {
            // Obtener carpeta del empleado
            const { data: folder } = await supabase
              .from('employee_folders')
              .select('id')
              .eq('employee_email', employeeEmail)
              .maybeSingle()

            if (folder) {
              // Insertar documento en Supabase
              const { error } = await supabase
                .from('employee_documents')
                .insert({
                  folder_id: folder.id,
                  document_name: file.name,
                  document_type: file.mimeType,
                  file_size: file.size || 0,
                  google_file_id: file.id,
                  file_url: `https://drive.google.com/file/d/${file.id}/view`,
                  status: 'active'
                })

              if (error) {
                logger.warn('GoogleDriveSyncService', `⚠️ Error sincronizando ${file.name}: ${error.message}`)
                errors++
              } else {
                synced++
                logger.info('GoogleDriveSyncService', `✅ Archivo sincronizado: ${file.name}`)
              }
            }
          } else {
            logger.info('GoogleDriveSyncService', `ℹ️ Archivo ya existe: ${file.name}`)
          }
        } catch (error) {
          logger.error('GoogleDriveSyncService', `❌ Error procesando archivo ${file.name}: ${error.message}`)
          this.recordError(error.message)
          errors++
        }
      }

      logger.info('GoogleDriveSyncService', `📊 Sincronización completada: ${synced} sincronizados, ${errors} errores`)
      return { synced, errors }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error sincronizando archivos para ${employeeEmail}: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Inicia sincronización periódica
   */
  startPeriodicSync(employeeEmail, folderId, intervalMinutes = 5) {
    try {
      logger.info('GoogleDriveSyncService', `⏰ Iniciando sincronización periódica para ${employeeEmail} (cada ${intervalMinutes} minutos)`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede iniciar sincronización periódica para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Evitar sincronizaciones duplicadas
      if (this.syncIntervals.has(employeeEmail)) {
        logger.info('GoogleDriveSyncService', `ℹ️ Sincronización ya activa para ${employeeEmail}`)
        return
      }

      const interval = setInterval(async () => {
        try {
          logger.info('GoogleDriveSyncService', `🔄 Ejecutando sincronización periódica para ${employeeEmail}`)
          await this.syncFilesFromDrive(folderId, employeeEmail)
        } catch (error) {
          logger.error('GoogleDriveSyncService', `❌ Error en sincronización periódica de ${employeeEmail}: ${error.message}`)
          this.recordError(error.message)
        }
      }, intervalMinutes * 60 * 1000)

      this.syncIntervals.set(employeeEmail, interval)
      logger.info('GoogleDriveSyncService', `✅ Sincronización periódica iniciada para ${employeeEmail}`)
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error iniciando sincronización periódica: ${error.message}`)
      this.recordError(error.message)
    }
  }

  /**
   * Detiene sincronización periódica
   */
  stopPeriodicSync(employeeEmail) {
    try {
      logger.info('GoogleDriveSyncService', `⏹️ Deteniendo sincronización periódica para ${employeeEmail}`)
      
      const interval = this.syncIntervals.get(employeeEmail)
      if (interval) {
        clearInterval(interval)
        this.syncIntervals.delete(employeeEmail)
        logger.info('GoogleDriveSyncService', `✅ Sincronización periódica detenida para ${employeeEmail}`)
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error deteniendo sincronización: ${error.message}`)
      this.recordError(error.message)
    }
  }

  /**
   * Sincroniza un archivo subido por el usuario
   */
  async syncUploadedFile(file, employeeEmail, folderId) {
    try {
      logger.info('GoogleDriveSyncService', `📤 Sincronizando archivo subido: ${file.name}`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede sincronizar archivo para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Subir archivo a Google Drive
      logger.info('GoogleDriveSyncService', `📤 Subiendo archivo a Google Drive...`)
      const uploadedFile = await googleDriveService.uploadFile(file, folderId)

      if (!uploadedFile || !uploadedFile.id) {
        throw new Error('No se pudo subir archivo a Google Drive')
      }

      logger.info('GoogleDriveSyncService', `✅ Archivo subido a Google Drive: ${uploadedFile.id}`)

      // Registrar en Supabase
      logger.info('GoogleDriveSyncService', `💾 Registrando archivo en Supabase...`)
      const { data: folder } = await supabase
        .from('employee_folders')
        .select('id')
        .eq('employee_email', employeeEmail)
        .maybeSingle()

      if (folder) {
        const { error } = await supabase
          .from('employee_documents')
          .insert({
            folder_id: folder.id,
            document_name: uploadedFile.name,
            document_type: uploadedFile.mimeType,
            file_size: uploadedFile.size || 0,
            google_file_id: uploadedFile.id,
            file_url: `https://drive.google.com/file/d/${uploadedFile.id}/view`,
            status: 'active'
          })

        if (error) {
          logger.error('GoogleDriveSyncService', `❌ Error registrando archivo en Supabase: ${error.message}`)
          this.recordError(error.message)
          throw error
        }

        logger.info('GoogleDriveSyncService', `✅ Archivo registrado en Supabase`)
      }

      return uploadedFile
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error sincronizando archivo subido: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Obtiene el estado de sincronización
   */
  getSyncStatus() {
    return {
      initialized: this.isInitialized,
      authenticated: googleDriveAuthService.isAuthenticated(),
      activeSyncs: this.syncIntervals.size,
      employees: Array.from(this.syncIntervals.keys()),
      recentErrors: this.syncErrors.slice(-10),
      authInfo: googleDriveAuthService.getConfigInfo()
    }
  }

  /**
   * Detiene todas las sincronizaciones
   */
  stopAllSync() {
    try {
      logger.info('GoogleDriveSyncService', '⏹️ Deteniendo todas las sincronizaciones...')
      
      for (const [employeeEmail, interval] of this.syncIntervals.entries()) {
        clearInterval(interval)
        logger.info('GoogleDriveSyncService', `⏹️ Sincronización detenida para ${employeeEmail}`)
      }
      this.syncIntervals.clear()
      logger.info('GoogleDriveSyncService', `✅ Todas las sincronizaciones detenidas`)
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error deteniendo sincronizaciones: ${error.message}`)
      this.recordError(error.message)
    }
  }
}

const googleDriveSyncService = new GoogleDriveSyncService()
export default googleDriveSyncService
