import { supabase } from '../lib/supabaseClient.js'
import hybridGoogleDriveService from '../lib/hybridGoogleDrive.js'

class GoogleDriveSyncService {
  constructor() {
    this.syncIntervals = new Map()
    this.isInitialized = false
  }

  async initialize() {
    try {
      console.log('🔄 Inicializando servicio de sincronización Google Drive...')
      await hybridGoogleDriveService.initialize()
      this.isInitialized = true
      console.log('✅ Servicio de sincronización inicializado')
      return true
    } catch (error) {
      console.error('❌ Error inicializando sincronización:', error)
      return false
    }
  }

  // Crear carpeta en Google Drive Y en Supabase simultáneamente
  async createEmployeeFolderInDrive(employeeEmail, employeeName, companyName, employeeData = {}) {
    try {
      if (!hybridGoogleDriveService.isUsingRealGoogleDrive()) {
        throw new Error('Google Drive real no está disponible')
      }

      console.log(`📁 Creando carpeta en Google Drive y Supabase para ${employeeEmail}...`)

      // Crear carpeta principal de la empresa
      const parentFolderName = `Empleados - ${companyName}`
      let parentFolder = await this.findOrCreateParentFolder(parentFolderName)

      // Crear carpeta del empleado en Google Drive
      const folderName = `${employeeName} (${employeeEmail})`
      const employeeFolder = await hybridGoogleDriveService.createFolder(folderName, parentFolder.id)

      if (!employeeFolder || !employeeFolder.id) {
        throw new Error('No se pudo crear carpeta en Google Drive')
      }

      console.log(`✅ Carpeta creada en Google Drive: ${employeeFolder.id}`)

      // Compartir carpeta con el empleado
      await hybridGoogleDriveService.shareFolder(employeeFolder.id, employeeEmail, 'writer')
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
      console.error(`❌ Error creando carpeta para ${employeeEmail}:`, error)
      throw error
    }
  }

  // Buscar o crear carpeta principal
  async findOrCreateParentFolder(folderName) {
    try {
      const folders = await hybridGoogleDriveService.listFiles()
      const parentFolder = folders.find(folder =>
        folder.name === folderName &&
        folder.mimeType === 'application/vnd.google-apps.folder'
      )

      if (parentFolder) {
        return parentFolder
      }

      return await hybridGoogleDriveService.createFolder(folderName)
    } catch (error) {
      console.error(`❌ Error buscando/creando carpeta ${folderName}:`, error)
      throw error
    }
  }

  // Sincronizar archivos de Google Drive a Supabase
  async syncFilesFromDrive(folderId, employeeEmail) {
    try {
      console.log(`🔄 Sincronizando archivos de Drive para ${employeeEmail}...`)

      // Obtener archivos de la carpeta en Google Drive
      const files = await hybridGoogleDriveService.listFiles(folderId)

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
          console.error(`❌ Error procesando archivo ${file.name}:`, error)
          errors++
        }
      }

      console.log(`📊 Sincronización completada: ${synced} archivos sincronizados, ${errors} errores`)
      return { synced, errors }
    } catch (error) {
      console.error(`❌ Error sincronizando archivos para ${employeeEmail}:`, error)
      throw error
    }
  }

  // Iniciar sincronización periódica
  startPeriodicSync(employeeEmail, folderId, intervalMinutes = 5) {
    try {
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
          console.error(`❌ Error en sincronización periódica de ${employeeEmail}:`, error)
        }
      }, intervalMinutes * 60 * 1000)

      this.syncIntervals.set(employeeEmail, interval)
      console.log(`✅ Sincronización periódica iniciada para ${employeeEmail}`)
    } catch (error) {
      console.error(`❌ Error iniciando sincronización periódica:`, error)
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
      console.error(`❌ Error deteniendo sincronización:`, error)
    }
  }

  // Sincronizar archivo subido por usuario
  async syncUploadedFile(file, employeeEmail, folderId) {
    try {
      console.log(`📤 Sincronizando archivo subido: ${file.name}`)

      // Subir archivo a Google Drive
      const uploadedFile = await hybridGoogleDriveService.uploadFile(file, folderId)

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
          console.error(`❌ Error registrando archivo en Supabase:`, error)
          throw error
        }

        console.log(`✅ Archivo registrado en Supabase`)
      }

      return uploadedFile
    } catch (error) {
      console.error(`❌ Error sincronizando archivo subido:`, error)
      throw error
    }
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    return {
      initialized: this.isInitialized,
      activeSyncs: this.syncIntervals.size,
      employees: Array.from(this.syncIntervals.keys())
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
      console.error(`❌ Error deteniendo sincronizaciones:`, error)
    }
  }
}

const googleDriveSyncService = new GoogleDriveSyncService()
export default googleDriveSyncService
