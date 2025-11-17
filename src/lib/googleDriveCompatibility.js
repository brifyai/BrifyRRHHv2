/**
 * Alias de Compatibilidad para Google Drive
 * Permite que el servicio unificado reemplace automáticamente los servicios individuales
 */

// Importar el servicio unificado
import unifiedGoogleDriveService from './unifiedGoogleDriveService.js';

// Re-exportar como los nombres originales para compatibilidad
export const googleDriveService = unifiedGoogleDriveService;
export const googleDriveAuthService = unifiedGoogleDriveService.authService || unifiedGoogleDriveService;
export const googleDriveCallbackHandler = unifiedGoogleDriveService.callbackHandler || unifiedGoogleDriveService;
export const googleDriveTokenBridge = unifiedGoogleDriveService.tokenBridge || unifiedGoogleDriveService;

// Exportar también como default para imports tradicionales
export default unifiedGoogleDriveService;