# 🚀 Guía Completa: Configurar Google Drive API para BrifyRRHH v2

## 📋 Requisitos Previos

- Cuenta de Google (Gmail o Google Workspace)
- Acceso a la consola de Google Cloud
- Proyecto en Google Cloud Platform

---

## 🔧 PASO 1: Crear Proyecto en Google Cloud

### 1.1 Acceder a Google Cloud Console
1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, acepta los términos y condiciones

### 1.2 Crear Nuevo Proyecto
1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Haz clic en **"NUEVO PROYECTO"**
3. Nombre del proyecto: `BrifyRRHH-Drive`
4. Haz clic en **"CREAR"**

---

## 🔑 PASO 2: Habilitar APIs Necesarias

### 2.1 Habilitar Google Drive API
1. En el menú de navegación, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca: **"Google Drive API"**
3. Selecciona **"Google Drive API"** y haz clic en **"HABILITAR"**

### 2.2 Verificar APIs Habilitadas
Ve a **"APIs y servicios"** → **"APIs habilitadas"** para confirmar que tienes:
- ✅ Google Drive API

**Nota:** Google Picker API ya no está disponible como API separada. Las funcionalidades de selección de archivos están incluidas en Google Drive API.

---

## 🔐 PASO 3: Configurar Pantalla de Consentimiento OAuth

### 3.1 Configurar Pantalla de Consentimiento
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** y haz clic en **"CREAR"**

### 3.2 Información de la Aplicación
- **Nombre de la aplicación**: `BrifyRRHH Drive Integration`
- **Correo electrónico de asistencia de usuario**: tu-email@dominio.com
- **Dominios autorizados**: 
  - Agrega: `localhost`
  - Agrega: `127.0.0.1`
  - Agrega tu dominio de producción (ej: `brifyrrhh.com`)
- **Información del desarrollador**: Completa con tus datos
- **Información de contacto**: Completa con tus datos

### 3.3 Alcances (Scopes)
Agrega los siguientes alcances:
1. `https://www.googleapis.com/auth/drive` - Acceso completo a Google Drive
2. `https://www.googleapis.com/auth/drive.file` - Acceso a archivos creados por la app
3. `https://www.googleapis.com/auth/drive.metadata` - Acceso a metadatos

### 3.4 Usuarios de Prueba
Agrega tu correo electrónico como usuario de prueba mientras la app esté en modo de desarrollo.

### 3.5 Resumen y Publicación
1. Revisa toda la información
2. Vuelve a la pantalla de consentimiento y haz clic en **"PUBLICAR APLICACIÓN"** para modo de desarrollo

---

## 🔑 PASO 4: Crear Credenciales OAuth 2.0

### 4.1 Crear Credenciales
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**
4. Selecciona **"Aplicación web"**

### 4.2 Configurar ID de Cliente
- **Nombre**: `BrifyRRHH Drive Client`
- **URIs de redireccionamiento autorizados**:
  - `http://localhost:3000/auth/google/callback`
  - `http://127.0.0.1:3000/auth/google/callback`
  - `https://tu-dominio-netlify.app/auth/google/callback` (para producción)

### 4.3 Obtener Credenciales
1. Haz clic en **"CREAR"**
2. **COPIA Y GUARDA** el **ID de cliente** y el **Cliente secreto**
3. Descarga el archivo JSON si lo deseas

---

## 🛠️ PASO 5: Configurar Clave de API (Opcional)

### 5.1 Crear Clave de API
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"Clave de API"**
4. Selecciona **"Restricciones de clave"** → **"Claves de servidor"**
5. Copia y guarda la clave de API

---

## 🔧 PASO 6: Configurar BrifyRRHH v2

### 6.1 Variables de Entorno
Agrega las siguientes variables a tu archivo `.env`:

```env
# Google Drive Configuration
REACT_APP_GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_AQUI
REACT_APP_GOOGLE_API_KEY=TU_CLAVE_DE_API_AQUI
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Para producción en Netlify
REACT_APP_GOOGLE_CLIENT_ID_PROD=TU_ID_DE_CLIENTE_PRODUCCION
REACT_APP_GOOGLE_API_KEY_PROD=TU_CLAVE_API_PRODUCCION
REACT_APP_GOOGLE_REDIRECT_URI_PROD=https://tu-dominio.netlify.app/auth/google/callback
```

### 6.2 Configuración en la Aplicación
En la aplicación BrifyRRHH v2:

1. Ve a **Configuración** → **Integraciones** → **Google Drive**
2. Ingresa el **ID de cliente** y la **Clave de API**
3. Haz clic en **"Guardar configuración"**
4. Haz clic en **"Conectar con Google"**
5. Autoriza la aplicación cuando se redirija a Google

---

## 🧪 PASO 7: Probar la Conexión

### 7.1 Verificar Conexión
1. En la aplicación, ve a **Configuración** → **Integraciones**
2. Busca **Google Drive** y verifica que muestre **"Conectado"**
3. Prueba crear una carpeta de empleado
4. Verifica que la carpeta aparezca en tu Google Drive

### 7.2 Verificar Logs
Abre la consola del navegador y busca mensajes como:
- ✅ `Google Drive conectado exitosamente`
- ✅ `Carpeta creada: [nombre de carpeta]`
- ✅ `Token de acceso obtenido`

---

## 🚨 Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"
**Problema**: El URI de redireccionamiento no coincide
**Solución**: 
1. Ve a Google Cloud Console → Credenciales
2. Edita tu ID de cliente OAuth
3. Agrega el URI exacto que muestra el error
4. Guarda y vuelve a intentar

### Error: "access_denied"
**Problema**: Usuario denegó el acceso
**Solución**:
1. Asegúrate de estar usando tu cuenta como usuario de prueba
2. Verifica que los alcances estén configurados correctamente
3. Vuelve a autorizar la aplicación

### Error: "invalid_client"
**Problema**: ID de cliente incorrecto
**Solución**:
1. Verifica que el ID de cliente sea correcto
2. Asegúrate de no tener espacios extra
3. Copia directamente desde la consola de Google

### Error: "API key not valid"
**Problema**: Clave de API inválida o restringida
**Solución**:
1. Verifica que la clave de API sea correcta
2. Asegúrate de que las restricciones IP permitan tu dirección
3. Habilita la Google Drive API si no está activa

---

## 🌐 Configuración para Producción (Netlify)

### 1. Actualizar URIs de Redireccionamiento
1. Ve a Google Cloud Console → Credenciales
2. Edita tu ID de cliente OAuth
3. Agrega: `https://tu-dominio.netlify.app/auth/google/callback`
4. Guarda los cambios

### 2. Configurar Variables de Entorno en Netlify
1. Ve a tu sitio en Netlify
2. Ve a **Site settings** → **Environment variables**
3. Agrega las variables de producción:
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_API_KEY`
   - `REACT_APP_GOOGLE_REDIRECT_URI`

### 3. Verificar Dominio
1. Asegúrate de que tu dominio esté verificado en Google Search Console
2. Agrega el dominio a los dominios autorizados en la pantalla de consentimiento

---

## 📋 Checklist Final

Antes de terminar, verifica:

- [ ] ✅ Proyecto creado en Google Cloud Console
- [ ] ✅ Google Drive API habilitada
- [ ] ✅ Google Picker API habilitada (opcional)
- [ ] ✅ Pantalla de consentimiento OAuth configurada
- [ ] ✅ ID de cliente OAuth 2.0 creado
- [ ] ✅ Clave de API creada (opcional)
- [ ] ✅ Credenciales guardadas en la aplicación
- [ ] ✅ Conexión probada exitosamente
- [ ] ✅ Carpetas de empleados creándose en Google Drive
- [ ] ✅ Configuración de producción lista (si aplica)

---

## 🆘 Ayuda Adicional

### Documentación Oficial
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about)
- [OAuth 2.0 for Google APIs](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API File Picker](https://developers.google.com/drive/api/v3/reference/files/create)

### Soporte
Si encuentras problemas:
1. Revisa los logs de la consola del navegador
2. Verifica la configuración en Google Cloud Console
3. Asegúrate de que las APIs estén habilitadas
4. Contacta al soporte técnico de BrifyRRHH

---

**🎉 ¡Felicidades! Ahora tienes Google Drive completamente configurado para BrifyRRHH v2!**