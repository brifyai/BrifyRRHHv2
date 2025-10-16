import { db, supabase } from '../lib/supabase';
import googleDriveService from '../lib/googleDrive';
import fileContentExtractor from './fileContentExtractor';
import embeddingService from './embeddingService';

/**
 * Servicio centralizado para manejar operaciones de archivos
 * Separa la lógica de negocio de los componentes UI
 */
class FileService {
  /**
   * Cargar carpetas del usuario
   */
  async loadFolders(userId) {
    try {
      // Cargar carpetas del administrador
      const { data: adminFolders, error: adminError } = await db.adminFolders.getByUser(userId);
      if (adminError) throw adminError;
      
      // Cargar carpetas de usuario
      const { data: userFolders, error: userError } = await db.userFolders.getByUser(userId);
      if (userError) throw userError;
      
      const allFolders = [
        ...(adminFolders || []).map(f => ({
          ...f,
          type: 'admin',
          google_folder_id: f.id_drive_carpeta
        })),
        ...(userFolders || []).map(f => ({
          ...f,
          type: 'user',
          google_folder_id: f.id_carpeta_drive
        }))
      ];
      
      return allFolders;
    } catch (error) {
      console.error('Error loading folders:', error);
      throw error;
    }
  }

  /**
   * Cargar archivos desde la base de datos
   */
  async loadFiles() {
    try {
      const { data, error } = await supabase
        .from('documentos_usuario_entrenador')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(file => ({
        id: file.id,
        created_at: file.created_at,
        metadata: {
          name: file.file_name,
          file_name: file.file_name,
          file_type: file.file_type,
          file_id: file.file_id,
          source: 'documentos_usuario_entrenador',
          correo: file.usuario
        },
        entrenador: file.entrenador,
        usuario: file.usuario,
        google_file_id: file.file_id
      }));
    } catch (error) {
      console.error('Error loading files:', error);
      throw error;
    }
  }

  /**
   * Enriquecer archivos con información de Google Drive
   */
  async enrichFilesWithGoogleDrive(files, userProfile) {
    if (!userProfile?.google_refresh_token) {
      return files.map(file => ({ ...file, synced: false }));
    }

    try {
      await googleDriveService.setTokens({
        refresh_token: userProfile.google_refresh_token
      });
      
      const enrichedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.google_file_id) {
            try {
              const driveInfo = await googleDriveService.getFileInfo(file.google_file_id);
              return {
                ...file,
                driveInfo,
                synced: true,
                size: driveInfo.size,
                downloadUrl: driveInfo.webContentLink
              };
            } catch (error) {
              console.error(`Error getting info for file ${file.google_file_id}:`, error);
              return { ...file, synced: false };
            }
          }
          return { ...file, synced: false };
        })
      );
      
      return enrichedFiles;
    } catch (error) {
      console.error('Error syncing with Google Drive:', error);
      return files.map(file => ({ ...file, synced: false }));
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(file, userProfile) {
    try {
      // Eliminar de Google Drive si existe
      if (file.google_file_id && userProfile?.google_refresh_token) {
        try {
          await googleDriveService.setTokens({
            refresh_token: userProfile.google_refresh_token
          });
          await googleDriveService.deleteFile(file.google_file_id);
          console.log('Archivo eliminado de Google Drive:', file.google_file_id);
        } catch (error) {
          console.error('Error deleting from Google Drive:', error);
        }
      }
      
      // Eliminar de documentos_usuario_entrenador
      const { error: userTrainerDeleteError } = await supabase
        .from('documentos_usuario_entrenador')
        .delete()
        .eq('id', file.id);
      
      if (userTrainerDeleteError) throw userTrainerDeleteError;
      
      // Eliminar chunks relacionados de documentos_entrenador
      if (file.google_file_id) {
        const { error: chunksDeleteError } = await supabase
          .from('documentos_entrenador')
          .delete()
          .eq('metadata->>file_id', file.google_file_id);
        
        if (chunksDeleteError) {
          console.error('Error eliminando chunks de documentos_entrenador:', chunksDeleteError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Validar tipo de archivo
   */
  validateFileType(file, allowedFileTypes, blockedExtensions) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    // Verificar extensiones bloqueadas
    const hasBlockedExtension = blockedExtensions.some(ext => fileName.endsWith(ext));
    if (hasBlockedExtension) {
      return {
        valid: false,
        reason: `Archivo ${file.name}: Tipo de archivo no permitido por seguridad`
      };
    }
    
    // Verificar tipos MIME permitidos
    if (fileType && allowedFileTypes[fileType]) {
      return { valid: true };
    }
    
    // Verificar por extensión si el MIME type no está disponible
    const allowedExtensions = Object.values(allowedFileTypes);
    const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasAllowedExtension) {
      return { valid: true };
    }
    
    return {
      valid: false,
      reason: `Archivo ${file.name}: Solo se permiten documentos PDF, Word, Excel, PowerPoint y archivos de texto`
    };
  }

  /**
   * Subir archivo a Google Drive
   */
  async uploadToGoogleDrive(file, folderId, userProfile, onProgress) {
    if (!userProfile?.google_refresh_token) {
      throw new Error('Google Drive no está conectado');
    }

    await googleDriveService.setTokens({
      refresh_token: userProfile.google_refresh_token
    });

    return await googleDriveService.uploadFile(file, folderId, onProgress);
  }

  /**
   * Procesar contenido del archivo
   */
  async processFileContent(file, userId) {
    if (!fileContentExtractor.isSupported(file)) {
      throw new Error(`Formato de archivo no compatible: ${file.type}. Solo se permiten documentos de texto, PDF, Word y Excel.`);
    }

    const processed = await embeddingService.processFile(file, fileContentExtractor);
    const tokensUsed = Math.ceil(processed.content.length / 4);

    // Registrar uso de tokens
    const embeddingsServiceLib = await import('../lib/embeddings');
    await embeddingsServiceLib.default.trackTokenUsage(userId, tokensUsed, 'file_embedding');

    return {
      content: processed.content,
      embedding: processed.embedding,
      tokensUsed
    };
  }

  /**
   * Crear chunks para contenido largo
   */
  async createContentChunks(content, file, folder, googleFileId, embedding, selectedFolder, userEmail) {
    const MAX_CONTENT_LENGTH = 10240;
    
    if (content.length <= MAX_CONTENT_LENGTH) {
      return null; // No necesita chunking
    }

    const embeddingsServiceLib = await import('../lib/embeddings');
    const chunks = embeddingsServiceLib.default.splitTextIntoChunks(content, 8000);
    
    // Crear documento principal (truncado)
    const contentToStore = content.substring(0, MAX_CONTENT_LENGTH - 200) + 
      `\n\n[DOCUMENTO DIVIDIDO EN CHUNKS: Este documento fue dividido en ${chunks.length} partes para optimizar la búsqueda. Contenido total: ${content.length} caracteres]`;

    const baseMetadata = {
      name: file.name,
      correo: folder.correo || folder.folder_name,
      source: 'web_upload',
      file_id: googleFileId,
      file_type: file.type,
      file_size: file.size,
      upload_date: new Date().toISOString(),
      blobType: file.type,
      is_chunked: true,
      original_length: content.length,
      chunks_count: chunks.length,
      chunk_type: 'main'
    };

    // Guardar documento principal
    const mainFileData = {
      entrenador: userEmail,
      folder_id: selectedFolder,
      content: contentToStore,
      metadata: baseMetadata,
      embedding: embedding
    };

    const { data: mainDoc, error: mainError } = await db.trainerDocuments.create(mainFileData);
    if (mainError) throw mainError;

    // Crear chunks
    let successfulChunks = 0;
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunkEmbeddingResult = await embeddingsServiceLib.default.generateEmbedding(chunks[i], userEmail);
        
        const chunkData = {
          entrenador: userEmail,
          folder_id: selectedFolder,
          content: chunks[i],
          metadata: {
            ...baseMetadata,
            chunk_type: 'chunk',
            chunk_index: i + 1,
            parent_file_id: googleFileId,
            chunk_of_total: `${i + 1}/${chunks.length}`,
            name: `${file.name} - Parte ${i + 1}`,
            source: 'chunk_from_web_upload'
          },
          embedding: chunkEmbeddingResult.embedding
        };
        
        const { error: chunkError } = await db.trainerDocuments.create(chunkData);
        if (!chunkError) {
          successfulChunks++;
          await embeddingsServiceLib.default.trackTokenUsage(userEmail, chunkEmbeddingResult.tokens_used, 'file_embedding');
        }
      } catch (chunkError) {
        console.error(`Error procesando chunk ${i + 1}:`, chunkError);
      }
    }

    // Actualizar metadata del documento principal
    await supabase
      .from('documentos_entrenador')
      .update({
        metadata: {
          ...baseMetadata,
          chunks_created: successfulChunks,
          chunks_failed: chunks.length - successfulChunks
        }
      })
      .eq('id', mainDoc.id);

    return { mainDoc, successfulChunks };
  }

  /**
   * Guardar documento en la base de datos
   */
  async saveDocument(fileData, userTrainerDocData, userProfile, userId) {
    try {
      // Guardar en documentos_entrenador
      const { error } = await db.trainerDocuments.create(fileData);
      if (error) throw error;
      
      // Registrar en documentos_usuario_entrenador
      const { data: userTrainerData, error: userTrainerError } = await db.userTrainerDocuments.create(userTrainerDocData);
      if (userTrainerError) {
        console.error('❌ Error registrando en documentos_usuario_entrenador:', userTrainerError);
        throw userTrainerError;
      }
      
      // Actualizar estadísticas del usuario
      const embeddingSize = fileData.embedding.length * 4;
      await db.users.update(userId, {
        used_storage_bytes: (userProfile.used_storage_bytes || 0) + embeddingSize
      });
      
      return userTrainerData;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  /**
   * Obtener ícono de archivo según tipo
   */
  getFileIcon(fileType) {
    const iconMap = {
      'image/': 'PhotoIcon',
      'video/': 'FilmIcon',
      'audio/': 'MusicalNoteIcon',
      'pdf': 'DocumentTextIcon',
      'document': 'DocumentTextIcon',
      'zip': 'ArchiveBoxIcon',
      'rar': 'ArchiveBoxIcon'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (fileType?.includes(key)) {
        return icon;
      }
    }

    return 'DocumentIcon';
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Crear y exportar una instancia única
const fileService = new FileService();
export default fileService;