# Configurar API de Google Drive en Netlify - Guía Completa

## 🎯 Resumen Rápido

Para configurar Google Drive en Netlify necesitas:
1. **Configurar Google Cloud Console** con las credenciales OAuth
2. **Configurar variables de entorno** en Netlify
3. **Usar el URI de redirección correcto** para producción
4. **Verificar la configuración** con las herramientas de diagnóstico

---

## 📋 Paso 1: Configurar Google Cloud Console

### 1.1 Crear o Seleccionar Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Asegúrate de que el nombre del proyecto sea "BrifyRRHH" o similar

### 1.2 Habilitar APIs Necesarias
1. En el menú lateral → **APIs & Services** → **Library**
2. Busca y habilita estas APIs:
   - ✅ **Google Drive API**
   - ✅ **Google Picker API** (opcional)
   - ✅ **Google OAuth2 API**

### 1.3 Crear Credenciales OAuth 2.0
1. Ve a **APIs & Services** → **Credentials**
2. Click en **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Si te pide configurar consent screen:
   - **User Type**: External
   - **App name**: BrifyRRHH
   - **User support email**: tu-email@dominio.com
   - **Developer contact**: tu-email@dominio.com

### 1.4 Configurar OAuth 2.0 Client ID
1. **Application type**: Web application
2. **Name**: BrifyRRHH Netlify
3. **Authorized JavaScript origins**:
   ```
   https://brifyrrhhv2.netlify.app
   ```
4. **Authorized redirect URIs** (¡MUY IMPORTANTE!):
   ```
   https://brifyrrhhv2.netlify.app/auth/google/callback
   https://brifyrrhhv2.netlify.app
   ```
5. Click en **CREATE**

### 1.5 Obtener Credenciales
Una vez creadas, obtendrás:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxx`

**¡GUARDA ESTAS CREDENCIALES!**

---

## 🔧 Paso 2: Configurar Variables de Entorno en Netlify

### 2.1 Acceder a Configuración de Netlify
1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Selecciona tu sitio: `brifyrrhhv2`
3. Ve a **Site settings** → **Build & deploy** → **Environment**

### 2.2 Agregar Variables de Entorno
Click en **Edit variables** y agrega:

#### Variables de Google Drive
```
REACT_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxx
REACT_APP_GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
```

#### Variables de Producción
```
REACT_APP_ENVIRONMENT=production
REACT_APP_NETLIFY_URL=https://brifyrrhhv2.netlify.app
```

#### Variables de Supabase (si aplica)
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2.3 Importante
- **No uses comillas** en los valores
- **Verifica** que no haya espacios extras
- **Guarda** los cambios
- **Redespliega** el sitio automáticamente

---

## 🌐 Paso 3: Configurar URI de Redirección Correcto

### 3.1 Problema Común: redirect_uri_mismatch
El error `redirect_uri_mismatch` ocurre cuando el URI en Google Cloud no coincide con el URI usado en producción.

### 3.2 URI Correcto para Netlify
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

### 3.3 Verificar Configuración
1. En Google Cloud Console → **Credentials**
2. Editar tu OAuth 2.0 Client ID
3. Verificar que **Authorized redirect URIs** contenga:
   ```
   https://brifyrrhhv2.netlify.app/auth/google/callback
   ```

---

## 🔍 Paso 4: Verificar Configuración

### 4.1 Usar Herramienta de Diagnóstico
1. Ve a: `https://brifyrrhhv2.netlify.app/google-drive-production-diagnosis`
2. La herramienta verificará automáticamente:
   - ✅ Variables de entorno configuradas
   - ✅ URI de redirección correcto
   - ✅ Conexión con Google Drive
   - ✅ Estado del servicio híbrido

### 4.2 Si Hay Problemas
La herramienta mostrará:
- 🔴 **Problema detectado**: Descripción del error
- 🟡 **Advertencia**: Configuración subóptima
- ✅ **Correcto**: Todo funciona bien

### 4.3 Soluciones Comunes
| Error | Solución |
|-------|----------|
| `redirect_uri_mismatch` | Agregar URI correcto en Google Cloud |
| `Client ID inválido` | Verificar variable REACT_APP_GOOGLE_CLIENT_ID |
| `API Key inválida` | Verificar variable REACT_APP_GOOGLE_API_KEY |
| `CORS error` | Verificar Authorized JavaScript origins |

---

## 🚀 Paso 5: Probar Funcionalidad

### 5.1 Probar Conexión
1. Inicia sesión en: `https://brifyrrhhv2.netlify.app`
2. Ve a **Integraciones** → **Google Drive**
3. Click en **Conectar Google Drive**
4. Debería redirigir a Google y volver con éxito

### 5.2 Probar Operaciones
Una vez conectado, prueba:
- ✅ Crear carpetas
- ✅ Subir archivos
- ✅ Listar archivos
- ✅ Buscar documentos

### 5.3 Si Falla el Modo Real
El sistema automáticamente usará **Google Drive Local**:
- Todas las operaciones funcionan igual
- Los datos se guardan en localStorage
- No requiere configuración adicional

---

## 🛠️ Paso 6: Solución de Problemas Avanzada

### 6.1 Limpiar Cache y Cookies
Si tienes problemas de autenticación:
1. Limpia cookies del sitio en el navegador
2. Limpia localStorage: `localStorage.clear()`
3. Recarga la página y prueba nuevamente

### 6.2 Verificar Dominio Personalizado
Si usas dominio personalizado:
1. Agrega el dominio en **Authorized JavaScript origins**
2. Agrega el dominio en **Authorized redirect URIs**
3. Actualiza variables de entorno en Netlify

### 6.3 Debug Mode
Activa modo debug para ver errores detallados:
```javascript
// En consola del navegador
localStorage.setItem('debug_google_drive', 'true')
```

---

## 📋 Checklist Final

### ✅ Google Cloud Console
- [ ] Proyecto creado y seleccionado
- [ ] APIs habilitadas (Drive, OAuth2)
- [ ] OAuth 2.0 Client ID creado
- [ ] JavaScript origins configurados
- [ ] Redirect URIs configurados
- [ ] Credenciales guardadas

### ✅ Netlify
- [ ] Variables de entorno configuradas
- [ ] Sin comillas en los valores
- [ ] Sitio redeployed
- [ ] Dominio correcto

### ✅ Verificación
- [ ] Herramienta de diagnóstico funciona
- [ ] Conexión con Google Drive exitosa
- [ ] Operaciones básicas funcionando
- [ ] Fallback a modo local activo

---

## 🔗 Enlaces Útiles

- **Google Cloud Console**: https://console.cloud.google.com/
- **Netlify Dashboard**: https://app.netlify.com/
- **Diagnóstico Producción**: https://brifyrrhhv2.netlify.app/google-drive-production-diagnosis
- **Diagnóstico Local**: http://localhost:3000/test-google-drive-local

---

## 📞 Soporte

Si tienes problemas:
1. Usa la herramienta de diagnóstico integrada
2. Revisa este documento paso a paso
3. Verifica que todos los URIs coincidan exactamente
4. Asegúrate de que las variables de entorno no tengan errores

**El sistema está diseñado para funcionar incluso si Google Drive falla, usando el modo local automáticamente.**