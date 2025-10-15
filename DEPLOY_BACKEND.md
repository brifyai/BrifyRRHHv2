# Despliegue del Backend Webrify

## Opciones de Despliegue

### 1. Vercel (Recomendado)
1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel --prod`
3. Configura las variables de entorno en el dashboard de Vercel

### 2. Render
1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Render detectará automáticamente el archivo `render.yaml`
4. Configura las variables de entorno en el dashboard de Render

### 3. Railway
1. Instala Railway CLI: `npm install -g @railway/cli`
2. Ejecuta: `railway login`
3. Ejecuta: `railway init`
4. Ejecuta: `railway up`

## Variables de Entorno Requeridas

```bash
NODE_ENV=production
REACT_APP_SUPABASE_URL=tu_supabase_url
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key
REACT_APP_GROQ_API_KEY=tu_groq_api_key
```

## Verificación

Una vez desplegado, verifica que el backend esté funcionando:
- GET /api/test - Debe retornar un JSON con éxito
- GET / - Debe mostrar la página de información del servidor

## URLs de Producción

- Frontend (Netlify): https://webrify.netlify.app
- Backend (Vercel): https://webrify-backend.vercel.app
- Backend (Render): https://webrify-backend.onrender.com
