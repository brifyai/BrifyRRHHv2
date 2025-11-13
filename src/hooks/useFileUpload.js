import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import employeeFolderService from '../services/employeeFolderService.js';
import fileContentExtractor from '../services/fileContentExtractor.js';
import embeddingService from '../services/embeddingService.js';
import googleDriveService from '../lib/googleDrive.js';
import { db, supabase } from '../lib/supabase.js';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para gestionar la lógica de upload de archivos
 * Extrae la complejidad del componente Files
 */
export const useFileUpload = () => {
  const { user, userProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Tipos de archivo permitidos
  const allowedFileTypes = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt'
  };

  // Extensiones bloqueadas
  const blockedExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.msi', '.dll',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
    '.js', '.vbs', '.ps1', '.sh'
  ];

  // Validar tipo de archivo
  const validateFileType = useCallback((file) => {
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
  }, []);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((event) => {
    const files = Array.isArray(event) ? event : Array.from(event.target.files);
    
    // Validar cada archivo
    const validationResults = files.map(validateFileType);
    const invalidFiles = validationResults.filter(result => !result.valid);
    
    if (invalidFiles.length > 0) {
      // Mostrar errores para archivos no válidos
      invalidFiles.forEach(result => {
        toast.error(result.reason);
      });
      
      // Solo mantener archivos válidos
      const validFiles = files.filter((file, index) => validationResults[index].valid);
      
      if (validFiles.length === 0) {
        event.target.value = '';
        return;
      }
      
      setSelectedFiles(validFiles);
      toast.success(`${validFiles.length} archivo(s) válido(s) seleccionado(s)`);
    } else {
      setSelectedFiles(files);
      toast.success(`${files.length} archivo(s) seleccionado(s)`);
    }
  }, [validateFileType]);

  // Subir archivo a Google Drive
  const uploadToGoogleDrive = useCallback(async (file, folderId, onProgress) => {
    if (!userProfile?.google_refresh_token) {
      throw new Error('Google Drive no está conectado');
    }

    await googleDriveService.setTokens({
      refresh_token: userProfile.google_refresh_token
    });

    return await googleDriveService.uploadFile(file, folderId, onProgress);
  }, [userProfile]);

  // Procesar contenido del archivo
  const processFileContent = useCallback(async (file) => {
    if (!fileContentExtractor.isSupported(file)) {
      throw new Error(`Formato de archivo no compatible: ${file.type}. Solo se permiten documentos de texto, PDF, Word y Excel.`);
    }

    const processed = await embeddingService.processFile(file, fileContentExtractor);
    const tokensUsed = Math.ceil(processed.content.length / 4);

    // Registrar uso de tokens
    const embeddingsServiceLib = await import('../lib/embeddings');
    await embeddingsServiceLib.default.trackTokenUsage(user.id, tokensUsed, 'file_embedding');

    return {
      content: processed.content,
      embedding: processed.embedding,
      tokensUsed
    };
  }, [user.id]);

  // Crear chunks para contenido largo
  const createContentChunks = useCallback(async (content, file, folder, googleFileId, embedding, selectedFolder) => {
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
      entrenador: user.email,
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
        const chunkEmbeddingResult = await embeddingsServiceLib.default.generateEmbedding(chunks[i], user.id);
        
        const chunkData = {
          entrenador: user.email,
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
          await embeddingsServiceLib.default.trackTokenUsage(user.id, chunkEmbeddingResult.tokens_used, 'file_embedding');
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
  }, [user.email]);

  // Subir archivos
  const handleUpload = useCallback(async (selectedFolder, folders) => {
    if (!selectedFolder) {
      toast.error('Selecciona una carpeta para subir los archivos');
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }

    setUploading(true);
    const newUploadProgress = {};
    
    try {
      // Obtener información de la carpeta
      const folder = folders.find(f => f.id === selectedFolder);
      if (!folder) {
        toast.error('Carpeta no encontrada');
        return;
      }
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = `file-${i}`;
        
        try {
          newUploadProgress[fileId] = 0;
          setUploadProgress({ ...newUploadProgress });
          
          let googleFileId = null;
          
          // Subir a Google Drive si está conectado
          if (userProfile?.google_refresh_token && folder.google_folder_id) {
            const driveFile = await uploadToGoogleDrive(
              file,
              folder.google_folder_id,
              (progress) => {
                newUploadProgress[fileId] = progress;
                setUploadProgress({ ...newUploadProgress });
              }
            );
            googleFileId = driveFile.id;
          } else {
            googleFileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Procesar contenido
          const { content, embedding, tokensUsed } = await processFileContent(file);
          newUploadProgress[fileId] = 20;
          setUploadProgress({ ...newUploadProgress });
          
          // Verificar si necesita chunking
          const MAX_CONTENT_LENGTH = 10240;
          let contentToStore = content;
          
          if (content.length > MAX_CONTENT_LENGTH) {
            // Crear chunks
            const chunkResult = await createContentChunks(
              content, 
              file, 
              folder, 
              googleFileId, 
              embedding, 
              selectedFolder
            );
            
            if (chunkResult) {
              // Registrar en documentos_usuario_entrenador
              const userTrainerDocData = {
                file_id: googleFileId,
                file_type: file.type,
                file_name: file.name,
                usuario: folder.correo || folder.folder_name,
                entrenador: user.email
              };
              
              await db.userTrainerDocuments.create(userTrainerDocData);
              
              // Actualizar estadísticas del usuario
              const embeddingSize = embedding.length * 4;
              await db.users.update(user.id, {
                used_storage_bytes: (userProfile.used_storage_bytes || 0) + embeddingSize
              });
              
              newUploadProgress[fileId] = 100;
              setUploadProgress({ ...newUploadProgress });
              continue;
            }
          }
          
          // Guardar documento normal (sin chunking)
          const fileData = {
            entrenador: user.email,
            folder_id: selectedFolder,
            content: contentToStore,
            metadata: {
              name: file.name,
              correo: folder.correo || folder.folder_name,
              source: 'web_upload',
              file_id: googleFileId,
              file_type: file.type,
              file_size: file.size,
              upload_date: new Date().toISOString(),
              blobType: file.type,
              is_chunked: content.length > MAX_CONTENT_LENGTH,
              original_length: content.length,
              chunks_count: content.length > MAX_CONTENT_LENGTH ? Math.ceil(content.length / 8000) : 1
            },
            embedding: embedding
          };
          
          await db.trainerDocuments.create(fileData);
          
          // Registrar en documentos_usuario_entrenador
          const userTrainerDocData = {
            file_id: googleFileId,
            file_type: file.type,
            file_name: file.name,
            usuario: folder.correo || folder.folder_name,
            entrenador: user.email
          };
          
          await db.userTrainerDocuments.create(userTrainerDocData);
          
          // Actualizar estadísticas
          const embeddingSize = embedding.length * 4;
          await db.users.update(user.id, {
            used_storage_bytes: (userProfile.used_storage_bytes || 0) + embeddingSize
          });
          
          newUploadProgress[fileId] = 100;
          setUploadProgress({ ...newUploadProgress });
          
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          
          if (error.message.includes('No se pudo procesar el archivo') || 
              error.message.includes('Formato de archivo no compatible')) {
            toast.error(`${file.name}: ${error.message}`);
          } else {
            toast.error(`Error subiendo ${file.name}: ${error.message}`);
          }
          
          newUploadProgress[fileId] = -1; // -1 indica error
          setUploadProgress({ ...newUploadProgress });
        }
      }
      
      // Contar archivos exitosos y fallidos
      const successfulFiles = Object.values(newUploadProgress).filter(progress => progress === 100).length;
      const failedFiles = Object.values(newUploadProgress).filter(progress => progress === -1).length;
      
      if (successfulFiles > 0 && failedFiles === 0) {
        toast.success(`${successfulFiles} archivo(s) subido(s) exitosamente`);
      } else if (successfulFiles > 0 && failedFiles > 0) {
        toast.success(`${successfulFiles} archivo(s) subido(s) exitosamente. ${failedFiles} archivo(s) fallaron.`);
      } else if (failedFiles > 0) {
        toast.error(`Todos los archivos fallaron al subirse`);
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error subiendo los archivos');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, userProfile, uploadToGoogleDrive, processFileContent, createContentChunks, user.id, user.email]);

  // Limpiar estado
  const clearUploadState = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress({});
    setUploading(false);
  }, []);

  return {
    // Estado
    uploading,
    uploadProgress,
    selectedFiles,
    allowedFileTypes,
    blockedExtensions,
    
    // Acciones
    handleFileSelect,
    handleUpload,
    clearUploadState,
    setSelectedFiles,
    
    // Utilidades
    validateFileType
  };
};

export default useFileUpload;