# Configuración de URLs en Google Cloud Console - BrifyRRHH

## 📍 ¿Dónde Configurar las URLs?

Ve a [Google Cloud Console](https://console.cloud.google.com) → **APIs y servicios** → **Credenciales** → **Editar tu cliente OAuth**

Verás dos secciones que necesitas configurar:

## 🔗 1. Orígenes Autorizados de JavaScript (JavaScript origins)

### ¿Qué es?
URLs desde donde tu aplicación puede hacer solicitudes a Google OAuth desde el navegador.

### ¿Qué agregar?
```
https://tu-dominio-real.netlify.app
```

**Importante**: Sin `/auth/google/callback` al final, solo la URL base de tu aplicación.

## 🔄 2. URIs de Redireccionamiento Autorizados (Authorized redirect URIs)

### ¿Qué es?
URLs a las que Google puede redirigir después del authentication.

### ¿Qué agregar?
```
http://localhost:3000/auth/google/callback
https://tu-dominio-real.netlify.app/auth/google/callback
```

**Importante**: Con `/auth/google/callback` al final, esta es la ruta completa de redirección.

## 📋 Ejemplo Completo:

Si tu URL de Netlify es `https://amazing-pasteur-123456.netlify.app`, entonces configurarías:

### JavaScript origins:
```
https://amazing-pasteur-123456.netlify.app
```

### Authorized redirect URIs:
```
http://localhost:3000/auth/google/callback
https://amazing-pasteur-123456.netlify.app/auth/google/callback
```

## 🚀 Flujo de Configuración Paso a Paso:

### Paso 1: Desplegar en Netlify primero
1. Despliega tu aplicación en Netlify
2. Obtén tu URL asignada (ej: `https://amazing-pasteur-123456.netlify.app`)

### Paso 2: Configurar Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. **APIs y servicios** → **Credenciales**
3. Click en tu cliente OAuth: `341525707325-qkftt6ektjnqfko7iunqr7t03iepbr3q.apps.googleusercontent.com`
4. En **"Orígenes autorizados de JavaScript"**, agrega:
   - `https://tu-url-real.netlify.app`
5. En **"URIs de redireccionamiento autorizados"**, agrega:
   - `http://localhost:3000/auth/google/callback` (para desarrollo)
   - `https://tu-url-real.netlify.app/auth/google/callback` (para producción)

### Paso 3: Configurar Variables de Entorno en Netlify
1. En Netlify: **Site settings** → **Environment variables**
2. Configura:
   ```bash
   REACT_APP_GOOGLE_REDIRECT_URI=https://tu-url-real.netlify.app/auth/google/callback
   ```

## ⚠️ Errores Comunes y Soluciones:

### Error: "redirect_uri_mismatch"
**Causa**: La URL de redirección no coincide exactamente
**Solución**: 
- Verifica que la URL en las variables de entorno coincida exactamente con la configurada en Google Cloud Console
- Asegúrate de incluir `/auth/google/callback` al final

### Error: "origin_not_allowed"
**Causa**: El origen de JavaScript no está configurado
**Solución**: 
- Agrega tu URL base (sin `/auth/google/callback`) en "Orígenes autorizados de JavaScript"

### Error: "invalid_client"
**Causa**: El Client ID es incorrecto
**Solución**: 
- Verifica que estés usando: `341525707325-qkftt6ektjnqfko7iunqr7t03iepbr3q.apps.googleusercontent.com`

## 🎯 Resumen de Configuración:

### Para Desarrollo (local):
- **JavaScript origin**: `http://localhost:3000`
- **Redirect URI**: `http://localhost:3000/auth/google/callback`

### Para Producción (Netlify):
- **JavaScript origin**: `https://tu-url-real.netlify.app`
- **Redirect URI**: `https://tu-url-real.netlify.app/auth/google/callback`

## 📝 Checklist Final:

- [ ] Desplegar aplicación en Netlify
- [ ] Obtener URL real de Netlify
- [ ] Configurar JavaScript origins en Google Cloud Console
- [ ] Configurar Redirect URIs en Google Cloud Console
- [ ] Actualizar variables de entorno en Netlify
- [ ] Probar inicio de sesión con Google

## 🔗 Enlace Directo a tu Configuración:
[Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials)

Una vez que configures ambas secciones correctamente, tu autenticación de Google funcionará perfectamente tanto en desarrollo como en producción.