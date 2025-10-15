# Guía Rápida - Conectar Google Drive en BrifyRRHH

## 🚀 Conexión Inmediata - 3 Pasos

### Paso 1: Habilitar Google Drive API
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto `BrifyRRHH`
3. **APIs y servicios** → **Biblioteca**
4. Busca y habilita: **Google Drive API**

### Paso 2: Verificar URLs en OAuth
Asegúrate de que en **APIs y servicios** → **Credenciales** → **Tu cliente OAuth** tengas:

**JavaScript origins:**
```
https://brifyrrhhapp.netlify.app
```

**URIs de redireccionamiento autorizados:**
```
https://brifyrrhhapp.netlify.app/auth/google/callback
http://localhost:3000/auth/google/callback
```

### Paso 3: Conectar en la Aplicación
1. Inicia sesión en `https://brifyrrhhapp.netlify.app`
2. Ve al **Dashboard** o **Profile**
3. Click en **"Conectar Google Drive"**
4. Autoriza los permisos solicitados

## ✅ Funcionalidades Disponibles

### 📁 Gestión de Archivos
- **Crear carpetas** en Google Drive
- **Subir archivos** desde la aplicación
- **Compartir carpetas** con otros usuarios
- **Sincronización** automática

### 📂 Componentes con Google Drive
- **Profile.js** - Conexión/desconexión
- **Dashboard.js** - Estado de conexión
- **Folders.js** - Gestión de carpetas
- **Files.js** - Subida de archivos
- **RoutineUpload.js** - Subida de rutinas

### 🔔 Notificaciones en Tiempo Real
- **Watch channels** para cambios en carpetas
- **Webhooks** configurados para n8n
- **Base de datos** con canales activos

## 🎯 Flujo de Conexión

### 1. Iniciar Conexión
```javascript
// En Profile.js o Dashboard.js
const authUrl = await googleDriveService.generateAuthUrl()
window.location.href = authUrl
```

### 2. Callback de Google
```javascript
// En GoogleAuthCallback.js
const tokens = await googleDriveService.exchangeCodeForTokens(code)
// Guardar tokens en base de datos
```

### 3. Usar Google Drive
```javascript
// Configurar tokens
await googleDriveService.setTokens(tokens)

// Crear carpeta
const folder = await googleDriveService.createFolder('Mi Carpeta')

// Subir archivo
const file = await googleDriveService.uploadFile(file, folderId)
```

## 📊 Estructura de Datos

### Tabla: `user_credentials`
```sql
- user_id: UUID
- google_access_token: TEXT
- google_refresh_token: TEXT
- expires_at: TIMESTAMP
```

### Tabla: `drive_watch_channels`
```sql
- user_id: UUID
- folder_id: TEXT
- channel_id: TEXT
- resource_id: TEXT
- is_active: BOOLEAN
```

## 🔍 Verificar Conexión

### En el Dashboard
- **Estado verde**: Conectado ✅
- **Estado rojo**: No conectado ❌

### En la Consola
```javascript
// Verificar tokens del usuario
console.log(userProfile?.google_refresh_token)
```

## 🚨 Problemas Comunes

### Error: "redirect_uri_mismatch"
**Solución**: Verifica que la URL en Google Cloud Console coincida exactamente

### Error: "insufficient authentication scopes"
**Solución**: Asegúrate de que los scopes incluyan:
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/drive.file`

### Error: "API key not valid"
**Solución**: Verifica las variables de entorno en Netlify

## 🎉 ¡Listo para Usar!

Una vez conectado, podrás:
- ✅ Crear carpetas en Google Drive desde la app
- ✅ Subir archivos y sincronizarlos
- ✅ Compartir carpetas con otros usuarios
- ✅ Recibir notificaciones de cambios
- ✅ Gestionar todo desde un solo lugar

## 📚 Documentación Completa
Para más detalles, consulta: [`GOOGLE_DRIVE_SETUP_GUIDE.md`](GOOGLE_DRIVE_SETUP_GUIDE.md)

---

**Tu aplicación BrifyRRHH ya está completamente integrada con Google Drive! 🚀**