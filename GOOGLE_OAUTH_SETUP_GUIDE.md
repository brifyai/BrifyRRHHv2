# Guía Completa para Configurar Google OAuth - BrifyRRHH

## 📋 ¿Qué necesitas obtener?

Necesitas obtener dos datos clave de Google Cloud Console:

1. **`REACT_APP_GOOGLE_CLIENT_ID`** - Identificador de cliente OAuth 2.0
2. **`REACT_APP_GOOGLE_REDIRECT_URI`** - URL de redirección autorizada

## 🔧 Paso 1: Crear Proyecto en Google Cloud Console

### 1.1 Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Inicia sesión con tu cuenta de Google
3. Si no tienes un proyecto, crea uno:
   - Click en el selector de proyectos (arriba a la izquierda)
   - Click en **"NUEVO PROYECTO"**
   - **Nombre del proyecto**: `BrifyRRHH`
   - Click en **"CREAR"**

### 1.2 Habilitar APIs necesarias
1. En el menú de navegación (☰), ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca y habilita estas APIs:
   - **Google Drive API**
   - **Google Calendar API**
   - **Gmail API**
   - **Google Sheets API**
   - **Google People API**

## 🔐 Paso 2: Configurar OAuth 2.0

### 2.1 Crear Pantalla de consentimiento
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** y click en **"CREAR"**
3. Configura la pantalla de consentimiento:
   - **Nombre de la aplicación**: `BrifyRRHH`
   - **Correo electrónico de asistencia de usuario**: tu-email@gmail.com
   - **Logo de la aplicación** (opcional)
   - **Dominios autorizados**: deja vacío por ahora
4. Click en **"GUARDAR Y CONTINUAR"** en cada paso
5. En el paso "Usuarios de prueba":
   - Agrega tu correo electrónico como usuario de prueba
   - Click en **"GUARDAR Y CONTINUAR"**
6. Revisa y click en **"VOLVER AL PANEL"**

### 2.2 Crear Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Click en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**
3. Configura el cliente:
   - **Tipo de aplicación**: **"Aplicación web"**
   - **Nombre**: `BrifyRRHH Web Client`
   - **URIs de redirección autorizados**:
     ```
     http://localhost:3000/auth/google/callback
     https://tu-dominio.netlify.app/auth/google/callback
     ```
4. Click en **"CREAR"**

### 2.3 Obtener tus credenciales
Después de crear el cliente, Google mostrará:
- **ID de cliente**: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Secreto de cliente**: `xxxxxxxxxxxxxxxxxxxxxxxx`

**¡IMPORTANTE!** Copia y guarda estos datos en un lugar seguro.

## 🌐 Paso 3: Configurar URLs de Producción

### 3.1 Obtener tu URL de Netlify
1. Despliega tu sitio en Netlify primero (sin Google OAuth)
2. Netlify te asignará una URL como: `https://amazing-pasteur-123456.netlify.app`
3. Usa esta URL para configurar Google OAuth

### 3.2 Actualizar URLs en Google Cloud
1. Vuelve a **"APIs y servicios"** → **"Credenciales"**
2. Click en tu cliente OAuth creado
3. En **"URIs de redirección autorizados"**, agrega:
   ```
   https://tu-dominio-netlify-app.netlify.app/auth/google/callback
   ```
4. Click en **"GUARDAR"**

## 📝 Paso 4: Configurar Variables de Entorno

### Para Desarrollo (local)
```bash
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real_aqui
REACT_APP_GOOGLE_CLIENT_SECRET=tu_client_secret_real_aqui
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Para Producción (Netlify)
```bash
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real_aqui
REACT_APP_GOOGLE_CLIENT_SECRET=tu_client_secret_real_aqui
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio-netlify-app.netlify.app/auth/google/callback
```

## 🔍 Paso 5: Verificar Configuración

### 5.1 En Google Cloud Console
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Asegúrate de que la aplicación esté **"Publicada"**
3. Verifica que tu correo esté en **"Usuarios de prueba"** (si no está publicada)

### 5.2 En tu aplicación
1. Inicia tu aplicación localmente
2. Intenta iniciar sesión con Google
3. Deberías ver la pantalla de consentimiento de Google

## 🚨 Problemas Comunes y Soluciones

### Error: "redirect_uri_mismatch"
**Causa**: La URL de redirección no está configurada correctamente
**Solución**: 
1. Verifica que la URL exacta esté en Google Cloud Console
2. Asegúrate de que no haya barras adicionales
3. Revisa que el protocolo (http/https) sea correcto

### Error: "invalid_client"
**Causa**: El Client ID es incorrecto
**Solución**: 
1. Copia nuevamente el Client ID desde Google Cloud Console
2. Verifica que no haya espacios adicionales

### Error: "access_denied"
**Causa**: La aplicación no está publicada o no eres usuario de prueba
**Solución**: 
1. Publica la aplicación en Google Cloud Console
2. Agrega tu correo como usuario de prueba

## 📋 Resumen de URLs a Configurar

### Desarrollo
```
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Producción (reemplaza con tu URL real)
```
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio-real.netlify.app/auth/google/callback
```

## 🎯 Checklist Final

- [ ] Proyecto creado en Google Cloud Console
- [ ] APIs habilitadas (Drive, Calendar, Gmail, etc.)
- [ ] Pantalla de consentimiento configurada
- [ ] Cliente OAuth 2.0 creado
- [ ] URLs de redirección configuradas
- [ ] Credenciales guardadas
- [ ] Variables de entorno configuradas
- [ ] Prueba de inicio de sesión funcionando

## 📚 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com)
- [Configurar OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)

## 🆘 Ayuda

Si tienes problemas:
1. Verifica que todas las URLs estén configuradas correctamente
2. Asegúrate de que las APIs estén habilitadas
3. Revisa que la aplicación esté publicada o seas usuario de prueba
4. Limpia el caché del navegador y las cookies

Una vez que tengas tus credenciales reales, reemplaza los marcadores de posición en tu archivo `.env` y en las variables de entorno de Netlify.