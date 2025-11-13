import { supabase } from '../lib/supabaseClient.js'
import { hybridGoogleDrive } from '../lib/hybridGoogleDrive.js'

class GoogleDriveSyncService {
  constructor() {
    this.syncIntervals = new Map()
    this.isInitialized = false
    this.syncErrors = []
  }

  async initialize() {
    try {
      console.log('🔄 Inicializando servicio de sincronización Google Drive...')
      
      // Verificar que Google Drive esté autenticado
      if (!hybridGoogleDrive.isAuthenticated()) {
        const error = '❌ Google Drive no está autenticado. Por favor, conecta tu cuenta de Google Drive primero.'
        console.error(error)
        this.recordError(error)
        throw new Error(error)
      }
      
      this.isInitialized = true
      console.log('✅ Servicio de sincronización inicializado')
      return true
    } catch (error) {
      console.error('❌ Error inicializando sincronización:', error.message)
      this.recordError(error.message)
      return false
    }
  }

  recordError(error) {
    this.syncErrors.push({
      timestamp: new Date().toISOString(),
      error: error
    })
    // Mantener solo los últimos 100 errores
    if (this.syncErrors.length > 100) {
      this.syncErrors = this.syncErrors.slice(-100)
    }
  }

  getSyncErrors() {
    return this.syncErrors
  }

  clearSyncErrors() {
    this.syncErrors = []
  }

  // Crear carpeta en Google Drive Y en Supabase simultáneamente
  async createEmployeeFolderInDrive(employeeEmail, employeeName, companyName, employeeData = {}) {
    try {
      // Verificar autenticación de Google Drive
      if (!hybridGoogleDrive.isAuthenticated()) {
        const error = `❌ No se puede crear carpeta para ${employeeEmail}: Google Drive no está autenticado`
        console.error(error)
        this.recordError(error)
        throw new Error(error)
      }

      console.log(`📁 Creando carpeta en Google Drive y Supabase para ${employeeEmail}...`)

      // Crear carpeta principal de la empresa
      const parentFolderName = `Empleados - ${companyName}`
      let parentFolder = await this.findOrCreateParentFolder(parentFolderName)

      // Crear carpeta del empleado en Google Drive
      const folderName = `${employeeName} (${employeeEmail})`
      const employeeFolder = await hybridGoogleDrive.createFolder(folderName, parentFolder.id)

      if (!employeeFolder || !employeeFolder.id) {
        throw new Error('No se pudo crear carpeta en Google Drive')
      }

      console.log(`✅ Carpeta creada en Google Drive: ${employeeFolder.id}`)

      // Compartir carpeta con el empleado
      await hybridGoogleDrive.shareFolder(employeeFolder.id, employeeEmail, 'writer')
      console.log(`📤 Carpeta compartida con ${employeeEmail}`)

      // Obtener información de la empresa
      let companyId = null
      if (employeeData.company_id) {
        companyId = employeeData.company_id
      }

      // Crear registro en Supabase
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
        console.error(`⚠️ Error creando carpeta en Supabase:`, supabaseError.message)
        // No lanzar error, la carpeta en Drive ya fue creada
      } else {
        console.log(`✅ Carpeta registrada en Supabase: ${supabaseFolder.id}`)
      }

      return {
        driveFolder: employeeFolder,
        supabaseFolder: supabaseFolder,
        syncStatus: 'created_in_both'
      }
    } catch (error) {
      console.error(`❌ Error creando carpeta para ${employeeEmail}:`, error.message)
      this.recordError(error.message)
      throw error
    }
  }

  // Buscar o crear carpeta principal
  async findOrCreateParentFolder(folderName) {
    try {
      const folders = await hybridGoogleDrive.listFiles()
      const parentFolder = folders.find(folder =>
        folder.name === folderName &&
        folder.mimeType === 'application/vnd.google-apps.folder'
      )

      if (parentFolder) {
        return parentFolder
      }

      return await hybridGoogleDrive.createFolder(folderName)
    } catch (error) {
      console.error(`❌ Error buscando/creando carpeta ${folderName}:`, error.message)
      this.recordError(error.message)
      throw error
    }
  }

  // Sincronizar archivos de Google Drive a Supabase
  async syncFilesFromDrive(folderId, employeeEmail) {
    try {
      // Verificar autenticación
      if (!hybridGoogleDrive.isAuthenticated()) {
        const error = `❌ No se puede sincronizar archivos para ${employeeEmail}: Google Drive no está autenticado`
        console.error(error)
        this.recordError(error)
        throw new Error(error)
      }

      console.log(`🔄 Sincronizando archivos de Drive para ${employeeEmail}...`)

      // Obtener archivos de la carpeta en Google Drive
      const files = await hybridGoogleDrive.listFiles(folderId)

      if (!files || files.length === 0) {
        console.log(`ℹ️ No hay archivos para sincronizar en ${employeeEmail}`)
        return { synced: 0, errors: 0 }
      }

      let synced = 0
      let errors = 0

      // Sincronizar cada archivo
      for (const file of files) {
        try {
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
                console.warn(`⚠️ Error sincronizando ${file.name}:`, error.message)
                errors++
              } else {
                synced++
                console.log(`✅ Archivo sincronizado: ${file.name}`)
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error procesando archivo ${file.name}:`, error.message)
          this.recordError(error.message)
          errors++
        }
      }

      console.log(`📊 Sincronización completada: ${synced} archivos sincronizados, ${errors} errores`)
      return { synced, errors }
    } catch (error) {
      console.error(`❌ Error sincronizando archivos para ${employeeEmail}:`, error.message)
      this.recordError(error.message)
      throw error
    }
  }

  // Iniciar sincronización periódica
  startPeriodicSync(employeeEmail, folderId, intervalMinutes = 5) {
    try {
      // Verificar autenticación
      if (!hybridGoogleDrive.isAuthenticated()) {
        const error = `❌ No se puede iniciar sincronización periódica para ${employeeEmail}: Google Drive no está autenticado`
        console.error(error)
        this.recordError(error)
        throw new Error(error)
      }

      // Evitar sincronizaciones duplicadas
      if (this.syncIntervals.has(employeeEmail)) {
        console.log(`ℹ️ Sincronización ya activa para ${employeeEmail}`)
        return
      }

      console.log(`🔄 Iniciando sincronización periódica para ${employeeEmail} (cada ${intervalMinutes} minutos)`)

      const interval = setInterval(async () => {
        try {
          await this.syncFilesFromDrive(folderId, employeeEmail)
        } catch (error) {
          console.error(`❌ Error en sincronización periódica de ${employeeEmail}:`, error.message)
          this.recordError(error.message)
        }
      }, intervalMinutes * 60 * 1000)

      this.syncIntervals.set(employeeEmail, interval)
      console.log(`✅ Sincronización periódica iniciada para ${employeeEmail}`)
    } catch (error) {
      console.error(`❌ Error iniciando sincronización periódica:`, error.message)
      this.recordError(error.message)
    }
  }

  // Detener sincronización periódica
  stopPeriodicSync(employeeEmail) {
    try {
      const interval = this.syncIntervals.get(employeeEmail)
      if (interval) {
        clearInterval(interval)
        this.syncIntervals.delete(employeeEmail)
        console.log(`⏹️ Sincronización periódica detenida para ${employeeEmail}`)
      }
    } catch (error) {
      console.error(`❌ Error deteniendo sincronización:`, error.message)
      this.recordError(error.message)
    }
  }

  // Sincronizar archivo subido por usuario
  async syncUploadedFile(file, employeeEmail, folderId) {
    try {
      // Verificar autenticación
      if (!hybridGoogleDrive.isAuthenticated()) {
        const error = `❌ No se puede sincronizar archivo para ${employeeEmail}: Google Drive no está autenticado`
        console.error(error)
        this.recordError(error)
        throw new Error(error)
      }

      console.log(`📤 Sincronizando archivo subido: ${file.name}`)

      // Subir archivo a Google Drive
      const uploadedFile = await hybridGoogleDrive.uploadFile(file, folderId)

      if (!uploadedFile || !uploadedFile.id) {
        throw new Error('No se pudo subir archivo a Google Drive')
      }

      console.log(`✅ Archivo subido a Google Drive: ${uploadedFile.id}`)

      // Registrar en Supabase
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
          console.error(`❌ Error registrando archivo en Supabase:`, error.message)
          this.recordError(error.message)
          throw error
        }

        console.log(`✅ Archivo registrado en Supabase`)
      }

      return uploadedFile
    } catch (error) {
      console.error(`❌ Error sincronizando archivo subido:`, error.message)
      this.recordError(error.message)
      throw error
    }
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    return {
      initialized: this.isInitialized,
      authenticated: hybridGoogleDrive.isAuthenticated(),
      activeSyncs: this.syncIntervals.size,
      employees: Array.from(this.syncIntervals.keys()),
      recentErrors: this.syncErrors.slice(-10)
    }
  }

  // Detener todas las sincronizaciones
  stopAllSync() {
    try {
      for (const [employeeEmail, interval] of this.syncIntervals.entries()) {
        clearInterval(interval)
        console.log(`⏹️ Sincronización detenida para ${employeeEmail}`)
      }
      this.syncIntervals.clear()
      console.log(`✅ Todas las sincronizaciones detenidas`)
    } catch (error) {
      console.error(`❌ Error deteniendo sincronizaciones:`, error.message)
      this.recordError(error.message)
    }
  }
}

const googleDriveSyncService = new GoogleDriveSyncService()
export default googleDriveSyncService
