import userGoogleDriveService from './userGoogleDriveService.js'

class UserSpecificGoogleDriveService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com'
  }

  // Obtener el servicio de Google Drive para un usuario específico
  async getUserDriveService(userId) {
    try {
      const isConnected = await userGoogleDriveService.isUserConnected(userId)
      if (!isConnected) {
        throw new Error('Usuario no tiene cuenta de Google Drive conectada')
      }

      const accessToken = await userGoogleDriveService.getValidAccessToken(userId)
      if (!accessToken) {
        throw new Error('No se pudo obtener token de acceso válido')
      }

      return {
        accessToken,
        userId,
        isConnected: true
      }
    } catch (error) {
      console.error('Error al obtener servicio de Drive para usuario:', error)
      throw error
    }
  }

  // Crear una carpeta en el Google Drive del usuario
  async createFolder(userId, folderName, parentFolderId = null) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al crear carpeta: ${error}`)
      }

      const folder = await response.json()
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        folder: {
          id: folder.id,
          name: folder.name,
          mimeType: folder.mimeType,
          createdTime: folder.createdTime
        }
      }
    } catch (error) {
      console.error('Error al crear carpeta:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Subir un archivo al Google Drive del usuario
  async uploadFile(userId, file, parentFolderId = null, onProgress = null) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const metadata = {
        name: file.name,
        parents: parentFolderId ? [parentFolderId] : undefined
      }

      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', file)

      // Crear XMLHttpRequest para manejar progreso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Manejar progreso
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100
              onProgress(percentComplete)
            }
          })
        }

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              const uploadedFile = JSON.parse(xhr.responseText)
              
              // Actualizar estado de sincronización
              await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
              
              resolve({
                success: true,
                file: {
                  id: uploadedFile.id,
                  name: uploadedFile.name,
                  mimeType: uploadedFile.mimeType,
                  size: uploadedFile.size,
                  createdTime: uploadedFile.createdTime
                }
              })
            } catch (parseError) {
              reject(new Error('Error al procesar respuesta del servidor'))
            }
          } else {
            const errorText = xhr.responseText
            reject(new Error(`Error al subir archivo: ${errorText}`))
          }
        })

        xhr.addEventListener('error', async () => {
          await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', 'Error de red')
          reject(new Error('Error de red al subir archivo'))
        })

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart')
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
        xhr.send(form)
      })
    } catch (error) {
      console.error('Error al subir archivo:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Listar archivos y carpetas del usuario
  async listFiles(userId, folderId = null, pageSize = 10, pageToken = null) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      let query = "trashed=false"
      if (folderId) {
        query += ` and '${folderId}' in parents`
      }

      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink)`
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al listar archivos: ${error}`)
      }

      const data = await response.json()
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        files: data.files || [],
        nextPageToken: data.nextPageToken,
        hasMore: !!data.nextPageToken
      }
    } catch (error) {
      console.error('Error al listar archivos:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message,
        files: [],
        nextPageToken: null,
        hasMore: false
      }
    }
  }

  // Buscar archivos en el Google Drive del usuario
  async searchFiles(userId, query, pageSize = 10, pageToken = null) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const searchQuery = `name contains '${query.replace(/'/g, "\\'")}' and trashed=false`
      
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink)`
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al buscar archivos: ${error}`)
      }

      const data = await response.json()
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        files: data.files || [],
        nextPageToken: data.nextPageToken,
        hasMore: !!data.nextPageToken,
        query
      }
    } catch (error) {
      console.error('Error al buscar archivos:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message,
        files: [],
        nextPageToken: null,
        hasMore: false,
        query
      }
    }
  }

  // Eliminar un archivo o carpeta
  async deleteFile(userId, fileId) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al eliminar archivo: ${error}`)
      }
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        message: 'Archivo eliminado exitosamente'
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obtener información de un archivo
  async getFileInfo(userId, fileId) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al obtener información del archivo: ${error}`)
      }

      const file = await response.json()
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        file
      }
    } catch (error) {
      console.error('Error al obtener información del archivo:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Descargar un archivo
  async downloadFile(userId, fileId) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      // Primero obtener información del archivo para obtener el webContentLink
      const fileInfoResult = await this.getFileInfo(userId, fileId)
      if (!fileInfoResult.success) {
        throw new Error(fileInfoResult.error)
      }

      const file = fileInfoResult.file
      
      if (!file.webContentLink) {
        throw new Error('El archivo no se puede descargar')
      }

      // Descargar el archivo usando el webContentLink
      const response = await fetch(file.webContentLink, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al descargar archivo: ${error}`)
      }

      const blob = await response.blob()
      
      // Crear URL temporal para descarga
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        message: 'Archivo descargado exitosamente',
        fileName: file.name
      }
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Compartir una carpeta (crear enlace público)
  async shareFolder(userId, folderId, role = 'reader') {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      // Primero hacer la carpeta pública
      const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role,
          type: 'anyone'
        })
      })

      if (!permissionResponse.ok) {
        const error = await permissionResponse.text()
        throw new Error(`Error al compartir carpeta: ${error}`)
      }

      // Obtener el enlace de visualización
      const fileInfoResult = await this.getFileInfo(userId, folderId)
      if (!fileInfoResult.success) {
        throw new Error(fileInfoResult.error)
      }

      const shareLink = fileInfoResult.file.webViewLink
      
      // Actualizar estado de sincronización
      await userGoogleDriveService.updateConnectionStatus(userId, true, 'success')
      
      return {
        success: true,
        shareLink,
        message: 'Carpeta compartida exitosamente'
      }
    } catch (error) {
      console.error('Error al compartir carpeta:', error)
      await userGoogleDriveService.updateConnectionStatus(userId, false, 'error', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obtener información de la cuenta del usuario
  async getUserInfo(userId) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al obtener información del usuario: ${error}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        user: data.user
      }
    } catch (error) {
      console.error('Error al obtener información del usuario:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obtener espacio de almacenamiento usado
  async getStorageInfo(userId) {
    try {
      const { accessToken } = await this.getUserDriveService(userId)
      
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Error al obtener información de almacenamiento: ${error}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        storage: data.storageQuota
      }
    } catch (error) {
      console.error('Error al obtener información de almacenamiento:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default new UserSpecificGoogleDriveService()