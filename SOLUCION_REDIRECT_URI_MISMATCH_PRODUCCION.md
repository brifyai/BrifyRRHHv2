# Solución Completa: Error 400 redirect_uri_mismatch en Producción (Netlify)

## Problema Identificado

**Error:** `Acceso bloqueado: La solicitud de BrifyRRHH no es válida`
**Usuario afectado:** camiloalegriabarra@gmail.com
**Error técnico:** `Error 400: redirect_uri_mismatch`
**Ambiente:** Producción (Netlify)

## Causa Raíz

El error `redirect_uri_mismatch` ocurre cuando el URI de redirección configurado en Google Cloud Console no coincide con el URI que la aplicación está usando en producción.

## Solución Paso a Paso

### Paso 1: Identificar el URI de Redirección Correcto

Para producción en Netlify, el URI debe ser:
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

### Paso 2: Configurar Google Cloud Console

1. **Ve a Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Inicia sesión con la cuenta que tiene el proyecto

2. **Selecciona el Proyecto Correcto**
   - Busca el proyecto "BrifyRRHH" o similar
   - Si no tienes proyecto, crea uno nuevo

3. **Ve a APIs & Services → Credentials**
   - En el menú izquierdo, selecciona "APIs & Services"
   - Luego selecciona "Credentials"

4. **Encuentra tus Credenciales OAuth 2.0**
   - Busca "OAuth 2.0 Client IDs"
   - Identifica el Client ID que estás usando en producción

5. **Edita las Credenciales**
   - Haz clic en el nombre del Client ID para editarlo
   - Ve a la sección "Authorized redirect URIs"

6. **Agrega el URI de Producción**
   - Haz clic en "+ ADD URI"
   - Ingresa exactamente: `https://brifyrrhhv2.netlify.app/auth/google/callback`
   - Haz clic en "Save"

### Paso 3: Verificar Configuración Actual

Para verificar qué URI está usando la aplicación actualmente:

1. **Abre la consola del navegador** en producción
2. **Busca en la red** la solicitud a Google OAuth
3. **Verifica el parámetro `redirect_uri`** en la URL

### Paso 4: Actualizar Variables de Entorno (si es necesario)

Verifica que las variables de entorno en Netlify sean correctas:

1. **Ve a Netlify Dashboard**
   - URL: https://app.netlify.com/
   - Selecciona tu sitio "brifyrrhhv2"

2. **Ve a Site settings → Build & deploy → Environment**
   - Revisa las variables de entorno
   - Asegúrate de que `REACT_APP_GOOGLE_CLIENT_ID` sea el correcto

3. **Variables requeridas:**
   ```
   REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real.apps.googleusercontent.com
   REACT_APP_GOOGLE_CLIENT_SECRET=tu_client_secret_real
   REACT_APP_GOOGLE_REDIRECT_URI=https://brifyrrhhv2.netlify.app/auth/google/callback
   ```

### Paso 5: Esperar la Propagación

Los cambios en Google Cloud Console pueden tardar hasta 10 minutos en propagarse.

## Configuración Completa Requerida

### URIs de Redirección Autorizados (Todos los necesarios):

```
http://localhost:3000/auth/google/callback          (Desarrollo)
https://brifyrrhhv2.netlify.app/auth/google/callback (Producción)
```

### Orígenes JavaScript Autorizados:

```
http://localhost:3000                               (Desarrollo)
https://brifyrrhhv2.netlify.app                     (Producción)
```

## Diagnóstico y Verificación

### Herramienta de Diagnóstico

He creado una herramienta para diagnosticar este problema:

1. **Ve a:** https://brifyrrhhv2.netlify.app/test-google-drive-local
2. **Inicia sesión** en la aplicación
3. **Revisa la consola** para ver mensajes de diagnóstico

### Mensajes Esperados

**Configuración Correcta:**
```
✅ Usando Google Drive real
🔍 Inicializando Google Drive real...
✅ Google Drive real inicializado correctamente
```

**Configuración Incorrecta:**
```
🔧 No se encontraron credenciales válidas de Google OAuth, usando modo local
✅ Usando Google Drive local (modo sin conexión)
```

## Solución Alternativa: Modo Local

Si no puedes configurar las credenciales de Google inmediatamente, la aplicación funcionará perfectamente en modo local:

- ✅ **Todas las funcionalidades** disponibles
- ✅ **Almacenamiento persistente** en el navegador
- ✅ **Sin necesidad de configuración** de Google Cloud Console
- ✅ **Ideal para desarrollo y pruebas**

## Pasos para el Administrador

Si eres el administrador del sistema:

1. **Accede a Google Cloud Console**
2. **Configura los URIs** como se indicó arriba
3. **Actualiza las variables** de entorno en Netlify si es necesario
4. **Informa a los usuarios** cuando la configuración esté lista

## Pasos para el Usuario

Mientras se resuelve la configuración:

1. **Usa el modo local** de Google Drive
2. **Todas las funcionalidades** están disponibles
3. **Tus datos se guardan** en el navegador
4. **Cuando se configure Google Drive real**, podrás migrar si lo deseas

## Comprobación Final

Para verificar que todo funciona:

1. **Limpia el caché** del navegador
2. **Cierra y vuelve a abrir** la aplicación
3. **Intenta conectar Google Drive** nuevamente
4. **Debería funcionar** sin el error 400

## Contacto de Soporte

Si después de seguir estos pasos el problema persiste:

1. **Toma una captura de pantalla** del error
2. **Anota la URL exacta** que muestra el navegador
3. **Verifica la hora** del error (para descartar problemas de propagación)
4. **Comunica estos datos** al equipo de desarrollo

## Resumen Rápido

| Problema | Causa | Solución |
|---------|-------|----------|
| Error 400 redirect_uri_mismatch | URI de producción no configurado en Google Cloud Console | Agregar `https://brifyrrhhv2.netlify.app/auth/google/callback` en Google Cloud Console |
| Acceso bloqueado | Credenciales OAuth incorrectas | Verificar Client ID y Client Secret en Netlify |
| No funciona en producción | Variables de entorno incorrectas | Actualizar REACT_APP_GOOGLE_* en Netlify |

El problema es de configuración y se resuelve siguiendo los pasos anteriores. Mientras tanto, la aplicación funciona perfectamente en modo local.