# 🧠 Sistema de Base de Conocimiento Empresarial - StaffHub

## 📋 Resumen Ejecutivo

El Sistema de Base de Conocimiento Empresarial de StaffHub es una solución integral que automatiza la creación, gestión y vectorización de conocimiento empresarial utilizando Google Drive como almacenamiento principal y Supabase para búsqueda semántica con IA.

## 🎯 Objetivos Principales

- **Creación Automática**: Generar automáticamente una base de conocimiento cuando se registra una nueva empresa
- **Vectorización Inteligente**: Convertir documentos en vectores para búsqueda semántica avanzada
- **Sincronización Continua**: Mantener actualizada la base de conocimiento con Google Drive
- **Búsqueda Híbrida**: Combinar búsqueda tradicional y semántica para mejores resultados
- **Gestión Centralizada**: Administrar todo desde una interfaz intuitiva en StaffHub

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Google Drive   │◄──►│  StaffHub Front  │◄──►│   Supabase DB   │
│   (Almacenamiento)│    │   (Interfaz)     │    │  (Búsqueda IA)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Documentos     │    │  companyKnowledge │    │  Embeddings     │
│  PDF, DOC, TXT  │    │  Service.js       │    │  Vectoriales    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Estructura de Carpetas en Google Drive

Cuando se crea una empresa nueva, el sistema genera automáticamente:

```
📁 [Nombre Empresa] - Base de Conocimiento
├── 📁 01_Documentos_Empresariales
│   ├── Contratos, manuales, políticas internas
├── 📁 02_Politicas_Procedimientos
│   ├── RRHH, seguridad, protocolos
├── 📁 03_FAQs_Guias
│   ├── Preguntas frecuentes, guías de usuario
├── 📁 04_Capacitacion
│   ├── Material de entrenamiento, cursos
├── 📁 05_Formatos_Plantillas
│   ├── Plantillas, formularios, formatos
└── 📁 06_Multimedia
    ├── Videos, imágenes, audio
```

## 🔄 Flujo de Creación Automática

### 1. Registro de Empresa
```javascript
// Cuando un usuario crea una nueva empresa con Google Drive habilitado:
const companyData = {
  name: "Empresa XYZ",
  google_enabled: true,
  // ... otros datos
};

// El sistema automáticamente:
const knowledgeResult = await companyKnowledgeService.createCompanyKnowledgeBase(
  companyData, 
  userId
);
```

### 2. Creación de Estructura
- ✅ Carpeta principal en Google Drive
- ✅ 6 subcarpetas organizadas
- ✅ Compartir acceso con el usuario
- ✅ Crear registros en Supabase
- ✅ Inicializar categorías por defecto
- ✅ Generar FAQs iniciales

### 3. Vectorización Automática
```javascript
// Proceso de vectorización:
1. Descargar documento desde Google Drive
2. Extraer texto usando fileContentExtractor
3. Generar embeddings con Groq/Gemini
4. Dividir en chunks (8000 caracteres)
5. Almacenar en Supabase con vectores
6. Crear índices de búsqueda
```

## 🗄️ Base de Datos - Estructura Completa

### Tablas Principales

#### `company_knowledge_bases`
```sql
- id: UUID (PK)
- company_id: UUID (FK)
- drive_folder_id: TEXT
- drive_folder_url: TEXT
- status: TEXT (active/syncing/error)
- settings: JSONB
- last_sync_at: TIMESTAMP
```

#### `knowledge_documents`
```sql
- id: UUID (PK)
- company_id: UUID (FK)
- title: TEXT
- content: TEXT
- embedding: VECTOR(768)
- file_type: TEXT
- folder_type: TEXT
- status: TEXT
```

#### `knowledge_chunks`
```sql
- id: UUID (PK)
- document_id: UUID (FK)
- chunk_index: INTEGER
- content: TEXT
- embedding: VECTOR(768)
- token_count: INTEGER
```

#### `faq_entries`
```sql
- id: UUID (PK)
- company_id: UUID (FK)
- question: TEXT
- answer: TEXT
- embedding: VECTOR(768)
- priority: INTEGER
- keywords: TEXT
```

## 🔍 Búsqueda Semántica Avanzada

### Funciones de Búsqueda

#### 1. Búsqueda por Similitud de Vectores
```sql
SELECT * FROM search_knowledge_documents(
  p_company_id,
  p_query_embedding,
  p_similarity_threshold := 0.7,
  p_limit := 10
);
```

#### 2. Búsqueda Híbrida (Texto + Vectores)
```sql
SELECT * FROM search_faqs_hybrid(
  p_company_id,
  p_query_text,
  p_query_embedding,
  p_similarity_threshold := 0.7,
  p_limit := 10
);
```

#### 3. Búsqueda en Chunks Granular
```sql
SELECT * FROM search_knowledge_chunks(
  p_company_id,
  p_query_embedding,
  p_similarity_threshold := 0.7,
  p_limit := 10
);
```

## 🤖 Integración con IA

### Modelos de Embeddings Soportados
- **Groq**: `gemma2-9b-it`, `llama3-8b-8192`
- **OpenAI**: `text-embedding-ada-002`
- **Claude**: Embeddings de Anthropic

### Configuración por Empresa
```javascript
const aiConfig = {
  embedding_model: 'groq',
  embedding_dimension: 768,
  similarity_threshold: 0.7,
  max_chunks_per_document: 50,
  chunk_size: 8000,
  chunk_overlap: 200,
  auto_vectorize: true,
  auto_sync: true,
  supported_formats: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'],
  max_file_size_mb: 50
};
```

## 📊 Componentes de la Interfaz

### 1. CompanyKnowledgeManager.js
- **Resumen**: Estadísticas y estado general
- **Documentos**: Gestión de documentos vectorizados
- **Sincronización**: Historial y control de sync
- **Configuración**: Ajustes de IA y parámetros

### 2. Integración con CompanyForm.js
```javascript
// Creación automática al registrar empresa:
if (!company && formData.google_enabled) {
  const knowledgeResult = await companyKnowledgeService.createCompanyKnowledgeBase(
    { ...data, name: formData.name },
    user.id
  );
  
  // Sincronización inicial en segundo plano
  setTimeout(async () => {
    await companyKnowledgeService.syncAndVectorizeDocuments(data.id, user.id);
  }, 2000);
}
```

## 🔧 Configuración y Requisitos

### 1. Variables de Entorno
```env
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=tu-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 2. Permisos de Google Drive
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/gmail.send`

### 3. Extensiones de Supabase
- `pgvector`: Para almacenamiento de vectores
- `uuid-ossp`: Para generación de UUIDs

## 🚀 Implementación Paso a Paso

### Paso 1: Crear Tablas
```bash
# Ejecutar script SQL
psql -h tu-host -U tu-usuario -d tu-database -f database/create_company_knowledge_tables.sql
```

### Paso 2: Configurar Google OAuth
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear credenciales OAuth 2.0
4. Configurar URLs de redirección

### Paso 3: Instalar Dependencias
```bash
npm install @google-cloud/local-auth
npm install groq-sdk
npm install pdf-parse
npm install mammoth
```

### Paso 4: Configurar Variables de Entorno
```bash
# .env.local
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=tu-client-secret
GROQ_API_KEY=tu-groq-api-key
```

## 📈 Monitoreo y Estadísticas

### Métricas Disponibles
- **Documentos procesados**: Total y por empresa
- **FAQs creadas**: Automáticas y manuales
- **Chunks generados**: Para búsqueda granular
- **Tasa de éxito de sincronización**: Porcentaje de documentos procesados
- **Tiempo de procesamiento**: Duración promedio por documento

### Logs de Sincronización
```javascript
const syncLog = {
  company_id: 'uuid',
  sync_type: 'full', // full/incremental/manual
  status: 'completed', // running/completed/failed/cancelled
  files_processed: 25,
  files_created: 20,
  files_updated: 5,
  errors_count: 0,
  duration_seconds: 120,
  started_at: '2024-01-01T10:00:00Z',
  completed_at: '2024-01-01T10:02:00Z'
};
```

## 🔐 Seguridad y Permisos

### 1. Row Level Security (RLS)
```sql
-- Políticas de acceso por empresa
CREATE POLICY "Users can view own company knowledge" ON company_knowledge_bases
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
            OR id IN (
                SELECT company_id FROM company_users WHERE user_id = auth.uid()
            )
        )
    );
```

### 2. Permisos de Usuario
```javascript
const permissions = {
  admin: ['read', 'write', 'delete', 'manage'],
  editor: ['read', 'write'],
  viewer: ['read']
};
```

## 🎛️ API Endpoints

### Sincronización
```javascript
POST /api/knowledge/sync/:companyId
{
  "sync_type": "full", // full/incremental
  "force": false
}
```

### Búsqueda
```javascript
POST /api/knowledge/search/:companyId
{
  "query": "políticas de vacaciones",
  "limit": 10,
  "threshold": 0.7,
  "include_faqs": true,
  "include_documents": true
}
```

### Estadísticas
```javascript
GET /api/knowledge/stats/:companyId
```

## 🔄 Flujo de Trabajo Completo

### 1. Registro de Empresa
```
Usuario completa formulario → Habilita Google Drive → 
StaffHub crea estructura → Notifica éxito
```

### 2. Carga de Documentos
```
Usuario sube a Google Drive → StaffHub detecta cambios → 
Procesa y vectoriza → Disponible para búsqueda
```

### 3. Búsqueda de Conocimiento
```
Usuario escribe consulta → StaffHub genera embedding → 
Busca en vectores → Retorna resultados relevantes
```

## 🛠️ Solución de Problemas Comunes

### Problema: "Error al crear base de conocimiento"
**Causa**: Usuario no tiene Google Drive configurado
**Solución**: Verificar `google_refresh_token` en tabla `users`

### Problema: "La sincronización falla"
**Causa**: Permisos insuficientes en Google Drive
**Solución**: Revocar y volver a conceder permisos

### Problema: "Búsqueda no retorna resultados"
**Causa**: Umbral de similitud muy alto
**Solución**: Ajustar `similarity_threshold` a 0.6

### Problema: "Documentos no se vectorizan"
**Causa**: Formato no soportado o archivo corrupto
**Solución**: Verificar formato y tamaño del archivo

## 📚 Mejores Prácticas

### 1. Organización de Documentos
- Usar nombres descriptivos
- Mantener estructura de carpetas
- Evitar caracteres especiales en nombres
- Comprimir imágenes grandes

### 2. Optimización de Búsqueda
- Usar palabras clave relevantes
- Incluir sinónimos en documentos
- Mantener documentos actualizados
- Revisar periodicamente FAQs

### 3. Gestión de Permisos
- Asignar roles adecuados
- Revisar accesos periódicamente
- Usar principio de mínimo privilegio
- Mantener logs de accesos

## 🔮 Futuras Mejoras

### 1. Características Planificadas
- **Soporte multi-idioma**: Traducción automática de documentos
- **Análisis de sentimiento**: Detectar tono en documentos
- **Recomendaciones IA**: Sugerir documentos relacionados
- **Chatbot inteligente**: Respuestas basadas en conocimiento

### 2. Integraciones
- **Microsoft 365**: Soporte para OneDrive y SharePoint
- **Slack/Teams**: Notificaciones y búsqueda integrada
- **CRM popular**: Salesforce, HubSpot integración
- **API REST**: Acceso programático completo

### 3. Analíticas Avanzadas
- **Mapa de conocimiento**: Visualización de relaciones
- **Análisis de uso**: Patrones de búsqueda populares
- **Calidad de conocimiento**: Métricas de relevancia
- **Predictivo**: Sugerir proactivamente información

## 📞 Soporte y Contacto

### Documentación Adicional
- [API Reference](./API_REFERENCE.md)
- [Guía de Instalación](./INSTALLATION_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Best Practices](./BEST_PRACTICES.md)

### Soporte Técnico
- **Email**: soporte@staffhub.cl
- **Slack**: #staffhub-soporte
- **Documentation**: https://docs.staffhub.cl
- **Status Page**: https://status.staffhub.cl

---

## 📄 Licencia

Este sistema está licenciado bajo los términos de StaffHub Enterprise License. Para más información, contactar a legal@staffhub.cl.

---

*Última actualización: 20 de Octubre de 2024*
*Versión: 1.0.0*
*Autor: StaffHub Development Team*