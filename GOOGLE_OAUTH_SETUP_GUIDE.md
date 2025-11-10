# 🚀 Guía Completa: Configuración de Google OAuth para BrifyRRHH

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a Google Cloud Console
- Proyecto en Google Cloud (o crear uno nuevo)

## 🔧 Paso a Paso: Configuración en Google Cloud Console

### 1. Crear o Seleccionar Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el selector de proyectos (arriba a la izquierda)
4. Crea un nuevo proyecto o selecciona uno existente
5. **Nombre sugerido**: "BrifyRRHH Desarrollo"

### 2. Habilitar APIs Necesarias

1. En el menú izquierdo, ve a **APIs y servicios > Biblioteca**
2. Busca y habilita las siguientes APIs:
   - ✅ **Google Drive API**
   - ✅ **Gmail API** (opcional, para notificaciones)
   - ✅ **Google Sheets API** (opcional, para reportes)

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **APIs y servicios > Pantalla de consentimiento OAuth**
2. Selecciona **Externo** y haz clic en **Crear**
3. Completa la información:
   - **Nombre de la aplicación**: BrifyRRHH
   - **Email de soporte**: tu-email@dominio.com
   - **Nombres de dominio autorizados**: (dejar en blanco por ahora)
4. Haz clic en **Guardar y continuar** en todos los pasos
5. Añade tu email como usuario de prueba (mientras esté en modo de prueba)

### 4. Crear Credenciales OAuth 2.0

1. Ve a **APIs y servicios > Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES**
3. Selecciona **ID de cliente OAuth**
4. Configura lo siguiente:
   - **Tipo de aplicación**: Aplicación web
   - **Nombre**: BrifyRRHH Web Client
   - **URI de redirección autorizados**:
     ```
     http://localhost:3000/auth/google/callback
     http://localhost:3000
     ```
5. Haz clic en **Crear**
6. **¡IMPORTANTE!** Copia y guarda:
   - **ID de cliente** (Client ID)
   - **Secreto de cliente** (Client Secret)

## 📝 Configuración del Archivo .env

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# Google OAuth (reemplaza con tus credenciales reales)
REACT_APP_GOOGLE_CLIENT_ID=1051234567890-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=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45pq
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### ⚠️ **IMPORTANTE**: Formato de las Variables

- **Client ID**: Siempre termina en `.apps.googleusercontent.com`
- **Client Secret**: Empieza con `GOCSPX-` (nuevo formato) o es una cadena larga
- **Sin comillas** alrededor de los valores
- **Sin espacios** al final de cada línea

## 🔄 Reiniciar la Aplicación

Después de configurar el archivo `.env`:

1. Detén la aplicación (Ctrl+C en la terminal)
2. Reinicia con:
   ```bash
   npm start
   ```
3. Limpia el caché del navegador:
   - Abre DevTools (F12)
   - Pestaña Application/Storage
   - Haz clic en "Clear storage"

## 🧪 Verificación

1. Ve a la herramienta de verificación:
   ```
   http://localhost:3000/google-drive-connection-verifier
   ```

2. Haz clic en "Iniciar Verificación Completa"

3. Deberías ver:
   - ✅ Variables de entorno configuradas
   - ✅ Servicio OAuth 2.0 funcionando
   - ✅ Conexión con Google Drive establecida

## 🆘 Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"
- Verifica que el URI en Google Cloud coincida exactamente con `http://localhost:3000/auth/google/callback`
- Sin barra al final: `/auth/google/callback/` ❌
- Con barra al final: `/auth/google/callback` ✅

### Error: "invalid_client"
- Verifica que el Client ID esté completo y correcto
- Asegúrate de que el Client Secret sea el correcto
- Revisa que no haya espacios ni caracteres extraños

### Error: "access_denied"
- Asegúrate de que tu email esté en la lista de usuarios de prueba
- Verifica que la pantalla de consentimiento esté configurada

## 🚀 Modo Desarrollo (Alternativa)

Si no quieres configurar Google OAuth ahora, el sistema tiene un modo local:

1. El sistema detectará automáticamente que no hay credenciales reales
2. Usará un modo simulado para desarrollo
3. Podrás probar todas las funcionalidades sin conexión real

## 📞 Soporte

Si tienes problemas:
1. Usa la herramienta de verificación para diagnóstico detallado
2. Revisa la consola del navegador para errores específicos
3. Verifica que todas las variables estén configuradas correctamente

---

**🎯 Una vez configurado, podrás conectar Google Drive real y sincronizar archivos automáticamente.**