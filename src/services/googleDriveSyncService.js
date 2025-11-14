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
   * Verifica si Google Drive está autenticado
   * Basado en Google Drive API: https://developers.google.com/drive/api/guides/about-auth
   */
  isAuthenticated() {
    try {
      const isAuth = googleDriveAuthService.isAuthenticated()
      logger.info('GoogleDriveSyncService', `🔐 Estado de autenticación: ${isAuth ? '✅ Autenticado' : '❌ No autenticado'}`)
      return isAuth
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error verificando autenticación: ${error.message}`)
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
   * Ahora con verificación para evitar duplicaciones
   */
  async createEmployeeFolderInDrive(employeeEmail, employeeName, companyName, employeeData = {}) {
    try {
      logger.info('GoogleDriveSyncService', `📁 Procesando carpeta para ${employeeEmail}...`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede crear carpeta para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // PRIMERO: Verificar si ya existe en Supabase
      logger.info('GoogleDriveSyncService', `🔍 Verificando si la carpeta ya existe en Supabase...`)
      const { data: existingFolder, error: supabaseCheckError } = await supabase
        .from('employee_folders')
        .select('*')
        .eq('employee_email', employeeEmail)
        .maybeSingle()

      if (supabaseCheckError) {
        logger.warn('GoogleDriveSyncService', `⚠️ Error verificando carpeta en Supabase: ${supabaseCheckError.message}`)
      }

      if (existingFolder) {
        logger.info('GoogleDriveSyncService', `✅ Carpeta ya existe en Supabase: ${existingFolder.id}`)
        
        // Verificar si la carpeta de Drive todavía existe
        if (existingFolder.drive_folder_id) {
          try {
            const driveFolder = await googleDriveService.getFileInfo(existingFolder.drive_folder_id)
            if (driveFolder) {
              logger.info('GoogleDriveSyncService', `✅ Carpeta ya existe en Google Drive: ${existingFolder.drive_folder_id}`)
              return {
                driveFolder: driveFolder,
                supabaseFolder: existingFolder,
                syncStatus: 'already_exists'
              }
            } else {
              logger.warn('GoogleDriveSyncService', `⚠️ Carpeta existe en Supabase pero no en Drive, recreando...`)
            }
          } catch (driveError) {
            logger.warn('GoogleDriveSyncService', `⚠️ Error verificando carpeta en Drive: ${driveError.message}`)
          }
        }
      }

      // Crear carpeta principal de la empresa
      const parentFolderName = `Empleados - ${companyName}`
      logger.info('GoogleDriveSyncService', `🔍 Buscando/creando carpeta padre: ${parentFolderName}`)
      let parentFolder = await this.findOrCreateParentFolder(parentFolderName)

      // SEGUNDO: Verificar si la carpeta ya existe en Google Drive (antes de crear)
      const folderName = `${employeeName} (${employeeEmail})`
      logger.info('GoogleDriveSyncService', `🔍 Verificando si la carpeta ya existe en Google Drive...`)
      
      try {
        const existingFiles = await googleDriveService.listFiles(parentFolder.id)
        const existingDriveFolder = existingFiles.find(file =>
          file.name === folderName &&
          file.mimeType === 'application/vnd.google-apps.folder'
        )

        if (existingDriveFolder) {
          logger.info('GoogleDriveSyncService', `✅ Carpeta ya existe en Google Drive: ${existingDriveFolder.id}`)
          
          // Si existe en Drive pero no en Supabase, crear el registro
          if (!existingFolder) {
            logger.info('GoogleDriveSyncService', `📝 Creando registro en Supabase para carpeta existente en Drive...`)
            const newSupabaseFolder = await this.createSupabaseFolderRecord(
              employeeEmail, employeeName, companyName, employeeData, existingDriveFolder.id
            )
            
            return {
              driveFolder: existingDriveFolder,
              supabaseFolder: newSupabaseFolder,
              syncStatus: 'existed_in_drive_created_in_supabase'
            }
          } else {
            // Actualizar el registro de Supabase con el ID correcto de Drive si es diferente
            if (existingFolder.drive_folder_id !== existingDriveFolder.id) {
              logger.info('GoogleDriveSyncService', `🔄 Actualizando ID de Drive en Supabase...`)
              const { data: updatedFolder } = await supabase
                .from('employee_folders')
                .update({
                  drive_folder_id: existingDriveFolder.id,
                  drive_folder_url: `https://drive.google.com/drive/folders/${existingDriveFolder.id}`,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingFolder.id)
                .select()
                .single()

              return {
                driveFolder: existingDriveFolder,
                supabaseFolder: updatedFolder,
                syncStatus: 'updated_drive_id'
              }
            }

            return {
              driveFolder: existingDriveFolder,
              supabaseFolder: existingFolder,
              syncStatus: 'already_exists'
            }
          }
        }
      } catch (driveCheckError) {
        logger.warn('GoogleDriveSyncService', `⚠️ Error verificando carpeta existente en Drive: ${driveCheckError.message}`)
      }

      // TERCERO: Si no existe en ningún lugar, crear nueva carpeta
      logger.info('GoogleDriveSyncService', `📁 Creando nueva carpeta del empleado: ${folderName}`)
      const employeeFolder = await googleDriveService.createFolder(folderName, parentFolder.id)

      if (!employeeFolder || !employeeFolder.id) {
        throw new Error('No se pudo crear carpeta en Google Drive')
      }

      logger.info('GoogleDriveSyncService', `✅ Nueva carpeta creada en Google Drive: ${employeeFolder.id}`)

      // NOTA: No compartimos la carpeta con el empleado
      // Las carpetas son solo para organización interna del sistema
      logger.info('GoogleDriveSyncService', `ℹ️ Carpeta NO compartida con ${employeeEmail} (uso interno del sistema)`)

      // Crear registro en Supabase
      const supabaseFolder = await this.createSupabaseFolderRecord(
        employeeEmail, employeeName, companyName, employeeData, employeeFolder.id
      )

      return {
        driveFolder: employeeFolder,
        supabaseFolder: supabaseFolder,
        syncStatus: 'created_in_both'
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error procesando carpeta para ${employeeEmail}: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Crea un registro de carpeta en Supabase
   * Método auxiliar para evitar duplicación de código
   */
  async createSupabaseFolderRecord(employeeEmail, employeeName, companyName, employeeData, driveFolderId) {
    try {
      logger.info('GoogleDriveSyncService', `💾 Creando registro en Supabase...`)
      
      // Obtener información de la empresa
      let companyId = null
      if (employeeData.company_id) {
        companyId = employeeData.company_id
      }

      const { data: supabaseFolder, error: supabaseError } = await supabase
        .from('employee_folders')
        .upsert({
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
          drive_folder_id: driveFolderId,
          drive_folder_url: `https://drive.google.com/drive/folders/${driveFolderId}`,
          folder_status: 'active',
          settings: {
            notificationPreferences: {
              whatsapp: true,
              telegram: true,
              email: true
            },
            responseLanguage: 'es',
            timezone: 'America/Santiago'
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_email',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (supabaseError) {
        logger.warn('GoogleDriveSyncService', `⚠️ Error creando registro en Supabase: ${supabaseError.message}`)
        throw supabaseError
      }

      logger.info('GoogleDriveSyncService', `✅ Registro creado/actualizado en Supabase: ${supabaseFolder.id}`)
      return supabaseFolder
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error creando registro en Supabase: ${error.message}`)
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

  /**
   * Elimina una carpeta de empleado de todas las plataformas
   * Implementa sincronización de eliminación
   */
  async deleteEmployeeFolder(employeeEmail, deleteFromDrive = true) {
    try {
      logger.info('GoogleDriveSyncService', `🗑️ Iniciando eliminación de carpeta para ${employeeEmail} (Drive: ${deleteFromDrive})`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = `❌ No se puede eliminar carpeta para ${employeeEmail}: Google Drive no está autenticado`
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Obtener información de la carpeta
      const { data: folder, error: fetchError } = await supabase
        .from('employee_folders')
        .select('*')
        .eq('employee_email', employeeEmail)
        .single()

      if (fetchError || !folder) {
        logger.warn('GoogleDriveSyncService', `⚠️ No se encontró carpeta para ${employeeEmail}`)
        return { success: true, message: 'Carpeta no encontrada, ya eliminada' }
      }

      // 1. Eliminar de Google Drive (si se solicita)
      if (deleteFromDrive && folder.drive_folder_id) {
        try {
          logger.info('GoogleDriveSyncService', `🗑️ Eliminando carpeta de Google Drive: ${folder.drive_folder_id}`)
          await googleDriveService.deleteFile(folder.drive_folder_id)
          logger.info('GoogleDriveSyncService', `✅ Carpeta eliminada de Google Drive`)
        } catch (driveError) {
          logger.warn('GoogleDriveSyncService', `⚠️ Error eliminando de Google Drive: ${driveError.message}`)
          // Continuar con eliminación de Supabase aunque falle en Drive
        }
      }

      // 2. Soft delete en Supabase (marcar como eliminada)
      logger.info('GoogleDriveSyncService', `🗑️ Marcando carpeta como eliminada en Supabase`)
      const { error: updateError } = await supabase
        .from('employee_folders')
        .update({
          folder_status: 'deleted',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('employee_email', employeeEmail)

      if (updateError) {
        logger.error('GoogleDriveSyncService', `❌ Error actualizando estado en Supabase: ${updateError.message}`)
        throw updateError
      }

      // 3. Detener sincronización periódica si existe
      this.stopPeriodicSync(employeeEmail)

      logger.info('GoogleDriveSyncService', `✅ Carpeta eliminada exitosamente para ${employeeEmail}`)
      
      return {
        success: true,
        message: 'Carpeta eliminada correctamente',
        deletedFromDrive: deleteFromDrive && folder.drive_folder_id ? true : false
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error eliminando carpeta para ${employeeEmail}: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Audita la consistencia entre Supabase y Google Drive
   * Detecta carpetas huérfanas e inconsistencias
   */
  async auditConsistency() {
    try {
      logger.info('GoogleDriveSyncService', `🔍 Iniciando auditoría de consistencia...`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = '❌ No se puede auditar consistencia: Google Drive no está autenticado'
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      const auditResults = {
        totalSupabaseFolders: 0,
        totalDriveFolders: 0,
        inconsistencies: [],
        orphanedInDrive: [],
        orphanedInSupabase: [],
        timestamp: new Date().toISOString()
      }

      // 1. Obtener todas las carpetas de Supabase
      const { data: supabaseFolders, error: supabaseError } = await supabase
        .from('employee_folders')
        .select('*')
        .neq('folder_status', 'deleted')

      if (supabaseError) {
        logger.error('GoogleDriveSyncService', `❌ Error obteniendo carpetas de Supabase: ${supabaseError.message}`)
        throw supabaseError
      }

      auditResults.totalSupabaseFolders = supabaseFolders.length
      logger.info('GoogleDriveSyncService', `📊 Encontradas ${supabaseFolders.length} carpetas en Supabase`)

      // 2. Verificar existencia en Google Drive
      for (const folder of supabaseFolders) {
        if (folder.drive_folder_id) {
          try {
            const driveFolder = await googleDriveService.getFileInfo(folder.drive_folder_id)
            if (!driveFolder) {
              auditResults.inconsistencies.push({
                type: 'missing_in_drive',
                employeeEmail: folder.employee_email,
                supabaseId: folder.id,
                driveFolderId: folder.drive_folder_id,
                message: 'Carpeta existe en Supabase pero no en Google Drive'
              })
            }
          } catch (error) {
            auditResults.inconsistencies.push({
              type: 'error_checking_drive',
              employeeEmail: folder.employee_email,
              supabaseId: folder.id,
              driveFolderId: folder.drive_folder_id,
              error: error.message,
              message: 'Error verificando carpeta en Google Drive'
            })
          }
        }
      }

      // 3. Buscar carpetas en Google Drive
      try {
        const driveFolders = await googleDriveService.listFiles()
        auditResults.totalDriveFolders = driveFolders.filter(f =>
          f.mimeType === 'application/vnd.google-apps.folder'
        ).length

        // Buscar carpetas de empleados (patrón: "Nombre (email@ejemplo.com)")
        const employeeDriveFolders = driveFolders.filter(folder =>
          folder.mimeType === 'application/vnd.google-apps.folder' &&
          folder.name.includes('(') && folder.name.includes(')')
        )

        logger.info('GoogleDriveSyncService', `📊 Encontradas ${employeeDriveFolders.length} carpetas de empleados en Drive`)

        // Encontrar carpetas huérfanas en Drive
        for (const driveFolder of employeeDriveFolders) {
          const existsInSupabase = supabaseFolders.some(sf =>
            sf.drive_folder_id === driveFolder.id
          )

          if (!existsInSupabase) {
            // Extraer email del nombre de la carpeta
            const emailMatch = driveFolder.name.match(/\(([^@]+@[^)]+)\)/)
            const email = emailMatch ? emailMatch[1] : null

            auditResults.orphanedInDrive.push({
              driveFolderId: driveFolder.id,
              driveFolderName: driveFolder.name,
              extractedEmail: email,
              message: email ? 'Carpeta huérfana en Drive (se puede recuperar)' : 'Carpeta huérfana sin email identificable'
            })
          }
        }
      } catch (driveError) {
        logger.error('GoogleDriveSyncService', `❌ Error listando carpetas de Drive: ${driveError.message}`)
      }

      // 4. Generar resumen
      const summary = {
        ...auditResults,
        summary: {
          totalInconsistencies: auditResults.inconsistencies.length,
          totalOrphanedInDrive: auditResults.orphanedInDrive.length,
          healthyFolders: auditResults.totalSupabaseFolders - auditResults.inconsistencies.length,
          needsAttention: auditResults.inconsistencies.length > 0 || auditResults.orphanedInDrive.length > 0
        }
      }

      logger.info('GoogleDriveSyncService', `📊 Auditoría completada: ${summary.summary.totalInconsistencies} inconsistencias, ${summary.summary.totalOrphanedInDrive} carpetas huérfanas`)
      
      return summary
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error en auditoría de consistencia: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Recupera carpetas huérfanas de Google Drive
   * Crea registros en Supabase para carpetas existentes en Drive
   */
  async recoverOrphanedFolders() {
    try {
      logger.info('GoogleDriveSyncService', `🔄 Iniciando recuperación de carpetas huérfanas...`)
      
      // Verificar autenticación
      if (!googleDriveAuthService.isAuthenticated()) {
        const error = '❌ No se puede recuperar carpetas: Google Drive no está autenticado'
        logger.error('GoogleDriveSyncService', error)
        this.recordError(error)
        throw new Error(error)
      }

      // Realizar auditoría para encontrar carpetas huérfanas
      const audit = await this.auditConsistency()
      const orphaned = audit.orphanedInDrive.filter(folder => folder.extractedEmail)

      if (orphaned.length === 0) {
        logger.info('GoogleDriveSyncService', `ℹ️ No hay carpetas huérfanas para recuperar`)
        return { recovered: 0, message: 'No hay carpetas huérfanas para recuperar' }
      }

      let recovered = 0
      const errors = []

      // Recuperar cada carpeta huérfana
      for (const orphan of orphaned) {
        try {
          logger.info('GoogleDriveSyncService', `🔄 Recuperando carpeta: ${orphan.driveFolderName}`)
          
          // Extraer información del nombre
          const nameMatch = orphan.driveFolderName.match(/^([^(]+)\(([^@]+@[^)]+)\)/)
          const employeeName = nameMatch ? nameMatch[1].trim() : 'Sin nombre'
          const employeeEmail = orphan.extractedEmail

          // Buscar información del empleado
          const { data: employee } = await supabase
            .from('employees')
            .select('*')
            .eq('email', employeeEmail)
            .single()

          // Crear registro en Supabase
          await this.createSupabaseFolderRecord(
            employeeEmail,
            employeeName,
            employee?.companies?.name || 'Empresa desconocida',
            employee || {},
            orphan.driveFolderId
          )

          recovered++
          logger.info('GoogleDriveSyncService', `✅ Carpeta recuperada: ${employeeEmail}`)
        } catch (error) {
          errors.push({
            folder: orphan.driveFolderName,
            error: error.message
          })
          logger.error('GoogleDriveSyncService', `❌ Error recuperando ${orphan.driveFolderName}: ${error.message}`)
        }
      }

      logger.info('GoogleDriveSyncService', `📊 Recuperación completada: ${recovered} recuperadas, ${errors.length} errores`)
      
      return {
        recovered,
        errors,
        totalOrphaned: orphaned.length,
        message: `Recuperadas ${recovered} de ${orphaned.length} carpetas huérfanas`
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error en recuperación de carpetas: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }

  /**
   * Limpia carpetas marcadas como eliminadas (hard delete)
   * Use con precaución - esta acción es irreversible
   */
  async cleanupDeletedFolders(olderThanDays = 30) {
    try {
      logger.info('GoogleDriveSyncService', `🧹 Iniciando limpieza de carpetas eliminadas (más antiguas que ${olderThanDays} días)...`)
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      // Eliminar registros marcados como eliminados
      const { data: deletedFolders, error } = await supabase
        .from('employee_folders')
        .delete()
        .eq('folder_status', 'deleted')
        .lt('deleted_at', cutoffDate.toISOString())
        .select()

      if (error) {
        logger.error('GoogleDriveSyncService', `❌ Error en limpieza: ${error.message}`)
        throw error
      }

      logger.info('GoogleDriveSyncService', `🧹 Limpieza completada: ${deletedFolders?.length || 0} registros eliminados permanentemente`)
      
      return {
        deleted: deletedFolders?.length || 0,
        cutoffDate: cutoffDate.toISOString(),
        message: `Eliminados ${deletedFolders?.length || 0} registros permanentemente`
      }
    } catch (error) {
      logger.error('GoogleDriveSyncService', `❌ Error en limpieza de carpetas eliminadas: ${error.message}`)
      this.recordError(error.message)
      throw error
    }
  }
}

const googleDriveSyncService = new GoogleDriveSyncService()
export default googleDriveSyncService
