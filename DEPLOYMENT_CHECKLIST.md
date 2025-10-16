
🚀 CHECKLIST DE DESPLIEGUE EN PRODUCCIÓN - BrifyRRHH

📋 ANTES DEL DESPLIEGUE:
□ Todas las pruebas locales pasan
□ Variables de entorno configuradas
□ Build de prueba exitoso
□ Código subido a GitHub
□ Branch principal actualizada

🌐 NETLIFY (Frontend):
□ Cuenta creada y conectada a GitHub
□ Variables de entorno configuradas:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY
  - REACT_APP_GOOGLE_CLIENT_ID
  - REACT_APP_NETLIFY_URL
□ netlify.toml configurado correctamente
□ Dominio configurado (si aplica)

🔧 VERCEL/RENDER (Backend):
□ Cuenta creada y conectada a GitHub
□ Variables de entorno configuradas:
  - NODE_ENV=production
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY
  - REACT_APP_GOOGLE_CLIENT_ID
  - REACT_APP_GOOGLE_CLIENT_SECRET
□ Comando de inicio: node server.js
□ URL del backend anotada

🔐 GOOGLE OAUTH:
□ Dominios de producción agregados:
  - https://brifyrrhhapp.netlify.app
  - https://tu-backend-url.vercel.app
□ Redirect URIs configuradas
□ Client ID y Secret verificados

✅ DESPUÉS DEL DESPLIEGUE:
□ Frontend accesible en Netlify
□ Backend respondiendo en Vercel/Render
□ API test funcionando
□ Autenticación de Google funcionando
□ Base de datos conectada
□ 800 empleados visibles
□ Contador de carpetas mostrando 800

🔥 URLS FINALES:
Frontend: https://brifyrrhhapp.netlify.app
Backend: https://tu-backend-url.vercel.app
API Test: https://tu-backend-url.vercel.app/api/test
Database: https://tmqglnycivlcjijoymwe.supabase.co
