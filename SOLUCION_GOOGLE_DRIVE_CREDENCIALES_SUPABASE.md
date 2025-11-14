# Solución: Guardar Credenciales de Google Drive en Supabase

## Problema Identificado

El usuario reportaba el error **"❌ Google Drive no autenticado"** incluso después de conectar Google Drive en Integraciones. El diagnóstico reveló que:

1. **No había credenciales guardadas en Supabase** - El script `diagnose_google_drive_credentials.mjs` confirmó que la tabla `user_google_drive_credentials` estaba vacía
2. **Arquitectura fragmentada** - Existían múltiples servicios manejando tokens de forma inconsistente:
   - `googleDriveAuthService.js` - Guardaba tokens en localStorage
   - `userGoogleDriveService.js` - Intentaba guardar en Supabase
   - `googleDriveCallbackHandler.js` - Usaba `googleDrivePersistenceService`
3. **Token bridge sin datos** - El `googleDriveTokenBridge.js` intentaba sincronizar desde Supabase, pero no había nada que sincronizar

## Raíz del Problema

**`googleDriveAuthService.exchangeCodeForTokens()` solo guardaba tokens en localStorage, NO en Supabase.**

Cuando el usuario autorizaba Google Drive:
1. ✅ Se intercambiaba el código por tokens
2. ✅ Se guardaban en localStorage
3. ❌ NO se guardaban en Supabase
4. ❌ El token bridge no encontraba credenciales en Supabase
5. ❌ `EmployeeFolders.js` no podía sincronizar

## Solución Implementada

### 1. Extender `googleDriveAuthService.js`

**Agregar inicialización de Supabase:**
```javascript
constructor() {
  // ... código existente ...
  this.supabase = null
  this.currentUserId = null
}

initializeSupabase(supabaseClient, userId) {
  this.supabase = supabaseClient
  this.currentUserId = userId
  logger.info('GoogleDriveAuthService', `🔗 Supabase inicializado para usuario ${userId}`)
}
```

**Agregar método para guardar en Supabase:**
```javascript
async saveCredentialsToSupabase(tokens) {
  try {
    if (!this.supabase || !this.currentUserId) {
      logger.warn('GoogleDriveAuthService', '⚠️ Supabase no inicializado')
      return false
    }

    const credentialsData = {
      user_id: this.currentUserId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokens.expires_at || new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      is_connected: true,
      is_active: true
    }

    const { data, error } = await this.supabase
      .from('user_google_drive_credentials')
      .upsert(credentialsData, { onConflict: 'user_id' })

    if (error) {
      logger.error('GoogleDriveAuthService', `❌ Error guardando en Supabase: ${error.message}`)
      return false
    }

    logger.info('GoogleDriveAuthService', `✅ Credenciales guardadas en Supabase`)
    return true
  } catch (error) {
    logger.error('GoogleDriveAuthService', `❌ Error: ${error.message}`)
    return false
  }
}
```

**Modificar `exchangeCodeForTokens()` para guardar en Supabase:**
```javascript
async exchangeCodeForTokens(code) {
  try {
    // ... código existente de intercambio ...
    
    this.setTokens(tokens)
    logger.info('GoogleDriveAuthService', '✅ Tokens obtenidos exitosamente')
    
    // ✨ NUEVO: Guardar en Supabase
    await this.saveCredentialsToSupabase(tokens)
    
    return tokens
  } catch (error) {
    // ... manejo de errores ...
  }
}
```

### 2. Actualizar `GoogleAuthCallback.js`

**Importar `googleDriveAuthService` y `supabase`:**
```javascript
import googleDriveAuthService from '../../lib/googleDriveAuthService.js'
import { auth, supabase } from '../../lib/supabase.js'
```

**Inicializar `googleDriveAuthService` con Supabase antes del callback:**
```javascript
// Inicializar googleDriveAuthService con Supabase
googleDriveAuthService.initializeSupabase(supabase, activeUser.id)
console.log('GoogleAuthCallback - googleDriveAuthService inicializado con Supabase')

setMessage('Procesando autorización de Google Drive...')
```

### 3. Mejorar Logging en `googleDriveTokenBridge.js`

Agregar logging detallado para debugging:
```javascript
logger.info('GoogleDriveTokenBridge', `📋 Credenciales encontradas:`)
logger.info('GoogleDriveTokenBridge', `  - is_active: ${credentials.is_active}`)
logger.info('GoogleDriveTokenBridge', `  - is_connected: ${credentials.is_connected}`)
logger.info('GoogleDriveTokenBridge', `  - has_access_token: ${!!credentials.access_token}`)
logger.info('GoogleDriveTokenBridge', `  - has_refresh_token: ${!!credentials.refresh_token}`)
logger.info('GoogleDriveTokenBridge', `  - expires_at: ${credentials.token_expires_at}`)
```

### 4. Crear Script de Diagnóstico

**`diagnose_google_drive_credentials.mjs`** - Verifica si las credenciales están guardadas en Supabase:
```bash
node diagnose_google_drive_credentials.mjs
```

Salida esperada después de la solución:
```
✅ Tabla existe
✅ Encontradas 1 credenciales
📌 Credencial 1:
   - user_id: [user-id]
   - is_active: true
   - is_connected: true
   - has_access_token: true
   - has_refresh_token: true
   - token_expires_at: [timestamp]
✅ Hay 1 credencial(es) activa(s) y conectada(s)
🎉 Las credenciales están correctamente guardadas en Supabase
```

## Flujo Completo Después de la Solución

```
1. Usuario hace clic en "Conectar Google Drive" (Integraciones)
   ↓
2. Se abre ventana de autorización de Google
   ↓
3. Usuario autoriza acceso
   ↓
4. Google redirige a /auth/google/callback con código
   ↓
5. GoogleAuthCallback.js procesa el callback
   ↓
6. Inicializa googleDriveAuthService con Supabase
   ↓
7. googleDriveCallbackHandler.handleAuthorizationCode(code, userId)
   ↓
8. exchangeCodeForTokens(code) intercambia código por tokens
   ↓
9. ✨ saveCredentialsToSupabase(tokens) guarda en BD
   ↓
10. googleDrivePersistenceService.saveCredentials() también guarda
   ↓
11. Usuario redirigido a /panel-principal
   ↓
12. EmployeeFolders.js inicializa googleDriveTokenBridge
   ↓
13. Token bridge sincroniza desde Supabase a localStorage
   ↓
14. googleDriveAuthService.isAuthenticated() retorna true
   ↓
15. ✅ "Sincronizar con Drive" funciona correctamente
```

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| [`src/lib/googleDriveAuthService.js`](src/lib/googleDriveAuthService.js) | +Supabase initialization, +saveCredentialsToSupabase(), +auto-save en exchangeCodeForTokens() |
| [`src/components/auth/GoogleAuthCallback.js`](src/components/auth/GoogleAuthCallback.js) | +Import googleDriveAuthService, +Initialize with Supabase |
| [`src/lib/googleDriveTokenBridge.js`](src/lib/googleDriveTokenBridge.js) | +Detailed logging for debugging |
| [`diagnose_google_drive_credentials.mjs`](diagnose_google_drive_credentials.mjs) | +New diagnostic script |

## Cómo Verificar la Solución

### 1. Ejecutar el Script de Diagnóstico
```bash
node diagnose_google_drive_credentials.mjs
```

### 2. Conectar Google Drive
- Ve a Integraciones
- Haz clic en "Conectar Google Drive"
- Autoriza el acceso a tu cuenta de Google
- Verifica que se muestre "✅ Conexión Exitosa"

### 3. Verificar Credenciales en Supabase
```bash
node diagnose_google_drive_credentials.mjs
```

Debería mostrar las credenciales guardadas.

### 4. Probar Sincronización
- Ve a Comunicación → Carpetas de Empleados
- Haz clic en "Sincronizar con Drive"
- Debería funcionar sin error "Google Drive no autenticado"

## Commits Relacionados

- `0c438e4` - fix: Guardar credenciales de Google Drive en Supabase durante OAuth callback
- `7b6bbbb` - refactor: Arquitectura completa de Google Drive
- `4095502` - feat: Token bridge para sincronizar credenciales
- `684de1c` - feat: Centralizar autenticación de Google Drive

## Próximos Pasos

1. ✅ Verificar que el build en Netlify sea exitoso
2. ✅ Probar flujo completo en producción
3. ✅ Monitorear logs para detectar problemas
4. ✅ Validar que las carpetas se crean correctamente en Google Drive

## Notas Técnicas

- **Token Storage**: Ahora hay dos fuentes de verdad:
  - **Supabase**: Fuente primaria (persistente)
  - **localStorage**: Caché local (para acceso rápido)
  
- **Token Bridge**: Sincroniza cada 5 minutos desde Supabase a localStorage

- **Refresh Automático**: Se ejecuta 5 minutos antes de que expire el token

- **Logging**: Todos los pasos están registrados en la consola del navegador para debugging

## Troubleshooting

Si aún ves "Google Drive no autenticado":

1. **Verificar credenciales en Supabase:**
   ```bash
   node diagnose_google_drive_credentials.mjs
   ```

2. **Revisar logs en la consola del navegador** (F12):
   - Buscar "GoogleDriveAuthService"
   - Buscar "GoogleDriveTokenBridge"
   - Buscar "GoogleAuthCallback"

3. **Limpiar localStorage:**
   ```javascript
   localStorage.removeItem('google_drive_auth')
   ```

4. **Reconectar Google Drive:**
   - Ve a Integraciones
   - Desconecta Google Drive
   - Vuelve a conectar

5. **Verificar variables de entorno:**
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_CLIENT_SECRET`
   - `REACT_APP_GOOGLE_REDIRECT_URI`
