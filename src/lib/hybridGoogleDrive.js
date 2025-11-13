/**
 * Hybrid Google Drive Service - REAL ONLY
 * Fuerza Google Drive real. Si falla, muestra error.
 * NO hay fallback a local.
 */

import googleDriveService from './googleDrive.js';
import logger from './logger.js';

class HybridGoogleDrive {
  constructor() {
    this.service = googleDriveService;
    this.syncErrors = [];
    this.lastSyncStatus = null;
  }

  /**
   * Obtiene el servicio de Google Drive real
   * Valida que haya credenciales válidas
   */
  getService() {
    const token = localStorage.getItem('google_drive_token');
    
    if (!token) {
      const error = 'Google Drive no está autenticado. Por favor, conecta tu cuenta de Google Drive.';
      logger.error('HybridGoogleDrive', error);
      this.recordSyncError(error);
      throw new Error(error);
    }

    return this.service;
  }

  /**
   * Crea una carpeta en Google Drive real
   */
  async createFolder(folderName, parentId = null) {
    try {
      const service = this.getService();
      const result = await service.createFolder(folderName, parentId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error creando carpeta en Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.createFolder', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Lista archivos en Google Drive real
   */
  async listFiles(folderId) {
    try {
      const service = this.getService();
      const result = await service.listFiles(folderId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error listando archivos en Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.listFiles', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Sube un archivo a Google Drive real
   */
  async uploadFile(file, folderId) {
    try {
      const service = this.getService();
      const result = await service.uploadFile(file, folderId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error subiendo archivo a Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.uploadFile', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Descarga un archivo de Google Drive real
   */
  async downloadFile(fileId) {
    try {
      const service = this.getService();
      const result = await service.downloadFile(fileId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error descargando archivo de Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.downloadFile', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Google Drive real
   */
  async deleteFile(fileId) {
    try {
      const service = this.getService();
      const result = await service.deleteFile(fileId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error eliminando archivo de Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.deleteFile', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Obtiene información de un archivo de Google Drive real
   */
  async getFileInfo(fileId) {
    try {
      const service = this.getService();
      const result = await service.getFileInfo(fileId);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error obteniendo información del archivo: ${error.message}`;
      logger.error('HybridGoogleDrive.getFileInfo', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Comparte una carpeta con un usuario
   */
  async shareFolder(folderId, email, role = 'writer') {
    try {
      const service = this.getService();
      const result = await service.shareFolder(folderId, email, role);
      this.lastSyncStatus = 'success';
      return result;
    } catch (error) {
      const errorMsg = `Error compartiendo carpeta en Google Drive: ${error.message}`;
      logger.error('HybridGoogleDrive.shareFolder', errorMsg);
      this.recordSyncError(errorMsg);
      throw error;
    }
  }

  /**
   * Registra errores de sincronización
   */
  recordSyncError(error) {
    this.syncErrors.push({
      timestamp: new Date().toISOString(),
      error: error,
      status: 'failed'
    });
    this.lastSyncStatus = 'error';
    
    // Mantener solo los últimos 50 errores
    if (this.syncErrors.length > 50) {
      this.syncErrors = this.syncErrors.slice(-50);
    }
  }

  /**
   * Obtiene el estado del último sincronización
   */
  getLastSyncStatus() {
    return this.lastSyncStatus;
  }

  /**
   * Obtiene los errores de sincronización
   */
  getSyncErrors() {
    return this.syncErrors;
  }

  /**
   * Limpia los errores de sincronización
   */
  clearSyncErrors() {
    this.syncErrors = [];
  }

  /**
   * Verifica si Google Drive está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('google_drive_token');
    return !!token;
  }

  /**
   * Obtiene el token de Google Drive
   */
  getToken() {
    return localStorage.getItem('google_drive_token');
  }

  /**
   * Establece el token de Google Drive
   */
  setToken(token) {
    if (token) {
      localStorage.setItem('google_drive_token', token);
    } else {
      localStorage.removeItem('google_drive_token');
    }
  }
}

export const hybridGoogleDrive = new HybridGoogleDrive();
