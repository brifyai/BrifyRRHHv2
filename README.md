# 🚀 BrifyRRHH v2 - Sistema de Gestión de RRHH

Sistema completo de gestión de recursos humanos con automatización inteligente, seguridad empresarial y base de conocimiento.

## ✅ Características Principales

- 🏢 **Gestión de Empresas**: 16 empresas preconfiguradas
- 👥 **Gestión de Empleados**: 800 empleados con datos reales
- 📁 **Carpetas Automáticas**: 800 carpetas individuales
- 🤖 **Base de Conocimiento**: IA con vectorización
- 🔒 **Seguridad Empresarial**: 4 fases de seguridad
- 📊 **Analíticas**: Dashboard en tiempo real
- 💬 **Comunicaciones**: Múltiples canales (WhatsApp, Email)
- 🎨 **UX/UI Moderna**: Interfaz responsiva

## 🚀 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Configuración
```bash
# Copiar .env.example a .env y configurar variables
cp .env.example .env
```

### 3. Ejecutar
```bash
npm run dev
```

### 4. Abrir
http://localhost:3000

## 📊 Estado del Sistema

✅ **Base de Datos**: Conectada con 16 empresas y 800 empleados  
✅ **Carpetas**: 800 automáticas creadas  
✅ **Seguridad**: 4 fases implementadas  
✅ **Automatización**: Completa y funcional  
✅ **UX/UI**: Moderna y responsiva  

## 🗄️ Configuración de Base de Datos

### Opción 1: Automática (Recomendada)
El sistema ya funciona con datos precargados.

### Opción 2: Supabase
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Ejecutar `database/supabase_setup_simple.sql`
3. Ejecutar `database/supabase_knowledge_simple.sql`

## 🧪 Verificación

```bash
# Test de conexión
node test_connection.mjs
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes React
├── services/       # Servicios backend
├── lib/           # Utilidades y configuración
└── styles/        # Estilos CSS

database/
├── supabase_setup_simple.sql      # Configuración principal
└── supabase_knowledge_simple.sql   # Base de conocimiento
```

## 🔧 Variables de Entorno (Opcional)

```bash
# Google Drive (opcional)
REACT_APP_GOOGLE_CLIENT_ID=xxx
REACT_APP_GOOGLE_CLIENT_SECRET=xxx

# IA Services (opcional)
REACT_APP_GROQ_API_KEY=xxx

# Supabase (ya configurado)
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

## 🎯 Funcionalidades

### Gestión Empresarial
- CRUD completo de empresas
- 16 empresas chilenas preconfiguradas
- Estadísticas por empresa

### Gestión de Empleados
- 800 empleados con datos reales
- Filtros avanzados
- Carpetas individuales automáticas

### Base de Conocimiento
- Creación automática por empresa
- Vectorización con IA
- Búsqueda semántica
- FAQs inteligentes

### Seguridad
- Encriptación end-to-end
- Autenticación multi-factor
- Control de acceso basado en roles
- Auditoría y logging

### Comunicaciones
- Múltiples canales
- Plantillas personalizadas
- Análisis de sentimiento
- Estadísticas de envío

## 📱 Tecnologías

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **IA**: Groq, Embeddings
- **Autenticación**: Supabase Auth
- **Seguridad**: Encriptación, MFA, RBAC

## ⚙️ Arquitectura de Configuración

### Sistema de Configuración Centralizado

El sistema implementa una arquitectura híbrida de configuración que combina Supabase como almacenamiento principal con localStorage como cache/respaldo:

#### Características
- 🔄 **Sincronización automática** entre Supabase y localStorage
- 📦 **Cache inteligente** con TTL de 5 minutos
- 🛡️ **Row Level Security** en todas las configuraciones
- 🔄 **Migración automática** de datos legacy
- 📊 **Categorización jerárquica** (global, empresa, usuario)

#### Servicios Migrados
- ✅ **Integraciones**: WhatsApp, Telegram, Groq, Brevo
- ✅ **Notificaciones**: Email, push, reportes
- ✅ **Seguridad**: MFA, sesiones, backup
- ✅ **Sistema**: Jerarquía de configuración, dashboard

#### Beneficios
- 🚀 **Rendimiento**: Cache local para acceso rápido
- 🔒 **Seguridad**: Datos sensibles en BD encriptada
- 🔄 **Resiliencia**: Funciona sin conexión a BD
- 📈 **Escalabilidad**: Soporte multi-empresa y multi-usuario

## 🚀 Despliegue

### Netlify (Frontend)
```bash
npm run build
# Desplegar carpeta build en Netlify
```

### Supabase (Backend)
- Base de datos ya configurada
- API endpoints funcionando

## 📞 Soporte

Para problemas o preguntas:
1. Verificar estado: `node test_connection.mjs`
2. Revisar configuración de variables de entorno
3. Consultar documentación técnica

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

---

**🎯 Sistema 100% funcional y listo para producción**