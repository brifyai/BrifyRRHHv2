# Sistema Completo de Carpetas de Empleados - BrifyRRHH v2

## 📋 Resumen Ejecutivo

Este documento describe el sistema completo de gestión de carpetas de empleados implementado en BrifyRRHH v2. El sistema permite crear carpetas personales para cada empleado con vinculación automática a Supabase y opcionalmente a Google Drive.

## 🎯 Objetivos del Sistema

1. **Crear carpetas automáticas** para todos los empleados registrados
2. **Vincular con Supabase** para persistencia de datos
3. **Integración con Google Drive** para almacenamiento en la nube
4. **Automatización completa** para nuevos registros
5. **Gestión centralizada** desde la interfaz administrativa

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema de Carpetas                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                          │
│  ├── EmployeeFolderManager.js                              │
│  ├── AuthContext.js (integrado)                           │
│  └── Componentes de gestión                                │
├─────────────────────────────────────────────────────────────┤
│  Servicios (JavaScript)                                    │
│  ├── enhancedEmployeeFolderService.js                      │
│  ├── employeeFolderService.js (legado)                     │
│  └── googleDrive.js                                        │
├─────────────────────────────────────────────────────────────┤
│  Base de Datos (Supabase)                                  │
│  ├── employee_folders                                     │
│  ├── employee_documents                                   │
│  ├── employee_faqs                                         │
│  ├── employee_conversations                                │
│  └── employee_notification_settings                        │
├─────────────────────────────────────────────────────────────┤
│  Scripts de Inicialización                                 │
│  └── initialize_employee_folders.mjs                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Base de Datos

### Tabla Principal: `employee_folders`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Identificador único |
| `employee_email` | TEXT | Email del empleado (único) |
| `employee_id` | TEXT | ID del empleado |
| `employee_name` | TEXT | Nombre completo |
| `employee_position` | TEXT | Cargo del empleado |
| `employee_department` | TEXT | Departamento |
| `company_id` | UUID | ID de la empresa |
| `company_name` | TEXT | Nombre de la empresa |
| `drive_folder_id` | TEXT | ID de carpeta en Google Drive |
| `drive_folder_url` | TEXT | URL de la carpeta en Drive |
| `folder_status` | TEXT | Estado (active, syncing, error) |
| `settings` | JSONB | Configuración personalizada |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

### Tablas Relacionadas

1. **`employee_documents`** - Documentos del empleado
2. **`employee_faqs`** - Preguntas frecuentes
3. **`employee_conversations`** - Historial de conversaciones
4. **`employee_notification_settings`** - Configuración de notificaciones

## 🔧 Instalación y Configuración

### 1. Ejecutar Script SQL

```sql
-- Ejecutar en Supabase Dashboard
-- Archivo: database/employee_folders_setup.sql
```

### 2. Verificar Estructura

```javascript
// Ejecutar script de verificación
node scripts/initialize_employee_folders.mjs
```

### 3. Inicializar Carpetas Existentes

```javascript
// Crear carpetas para todos los empleados existentes
await enhancedEmployeeFolderService.createFoldersForAllEmployees();
```

## 🚀 Funcionalidades Implementadas

### 1. Creación Automática de Carpetas

```javascript
// Al registrar un nuevo usuario, se crea automáticamente su carpeta
const folderResult = await enhancedEmployeeFolderService.createEmployeeFolder(
  employeeEmail, 
  employeeData
);
```

### 2. Integración con Google Drive

```javascript
// Crear carpeta en Google Drive
const driveFolder = await googleDriveService.createFolder(
  `${employeeName} (${employeeEmail})`,
  parentFolderId
);

// Compartir con el empleado
await googleDriveService.shareFolder(driveFolder.id, employeeEmail, 'writer');
```

### 3. Gestión de Documentos

```javascript
// Agregar documento a la carpeta del empleado
await enhancedEmployeeFolderService.addEmployeeDocument(employeeEmail, {
  name: 'Contrato.pdf',
  type: 'contract',
  description: 'Contrato de trabajo'
});
```

### 4. Sistema de FAQs

```javascript
// Agregar FAQ personalizada
await enhancedEmployeeFolderService.addEmployeeFAQ(
  employeeEmail,
  '¿Cuál es mi horario de trabajo?',
  'Tu horario es de 9:00 a 18:00, de lunes a viernes.'
);
```

### 5. Historial de Conversaciones

```javascript
// Registrar conversación
await enhancedEmployeeFolderService.addConversationMessage(
  employeeEmail,
  'user',
  'Necesito mis vacaciones',
  'chat'
);
```

## 📱 Interfaz de Administración

### Componente: `EmployeeFolderManager.js`

#### Características:

1. **Panel de Estadísticas**
   - Total de carpetas
   - Carpetas activas
   - Carpetas con Google Drive

2. **Búsqueda y Filtrado**
   - Por nombre del empleado
   - Por email
   - Por empresa
   - Por cargo

3. **Acciones Rápidas**
   - Ver detalles
   - Abrir en Google Drive
   - Sincronizar con Drive
   - Crear todas las carpetas

4. **Modal de Detalles**
   - Estadísticas de documentos
   - FAQs registradas
   - Conversaciones almacenadas

## 🔄 Flujo de Trabajo

### 1. Registro de Nuevo Empleado

```
Usuario se registra → AuthContext detecta → 
Se crea perfil en users → Se crea carpeta automática → 
Se configura notificaciones → Se notifica éxito
```

### 2. Creación Masiva de Carpetas

```
Admin ejecuta → Script recorre todos los empleados → 
Crea carpetas en Supabase → Opcional: crea en Google Drive → 
Reporte de resultados
```

### 3. Sincronización con Google Drive

```
Usuario solicita → Verifica tokens → 
Crea estructura de carpetas → Comparte con empleado → 
Actualiza estado en Supabase
```

## 🛠️ Scripts y Herramientas

### 1. `initialize_employee_folders.mjs`

Script para inicializar carpetas de todos los empleados:

```bash
# Ejecutar script
node scripts/initialize_employee_folders.mjs
```

**Funciones:**
- Verificar estructura de base de datos
- Crear carpetas para todos los empleados
- Generar estadísticas
- Reportar resultados

### 2. `employee_folders_setup.sql`

Script SQL para crear la estructura de base de datos:

```sql
-- Ejecutar en Supabase Dashboard
-- Crea todas las tablas necesarias
-- Configura índices y triggers
-- Inserta datos iniciales
```

## 📊 Estadísticas y Monitoreo

### Métricas Disponibles

1. **Carpetas Totales**: Número total de carpetas creadas
2. **Carpetas Activas**: Carpetas en estado 'active'
3. **Con Google Drive**: Carpetas sincronizadas con Drive
4. **Por Empresa**: Distribución por empresa
5. **Uso de Documentos**: Documentos por carpeta
6. **FAQs Registradas**: Preguntas frecuentes por empleado

### Consultas Útiles

```sql
-- Estadísticas por empresa
SELECT company_name, COUNT(*) as total_folders
FROM employee_folders
GROUP BY company_name
ORDER BY total_folders DESC;

-- Carpetas con Google Drive
SELECT COUNT(*) as with_drive
FROM employee_folders
WHERE drive_folder_id IS NOT NULL;

-- Últimas carpetas creadas
SELECT employee_name, employee_email, created_at
FROM employee_folders
ORDER BY created_at DESC
LIMIT 10;
```

## 🔐 Seguridad y Permisos

### 1. Control de Acceso

- Las carpetas solo son accesibles por el empleado dueño
- Los administradores pueden ver todas las carpetas
- Los managers pueden ver carpetas de su empresa

### 2. Encriptación

- Datos sensibles encriptados en base de datos
- Tokens de Google Drive almacenados de forma segura
- Comunicación vía HTTPS obligatoria

### 3. Auditoría

- Todas las operaciones son registradas
- Logs de creación, modificación y eliminación
- Trazabilidad completa de acciones

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Error: Tabla no existe**
   ```sql
   -- Solución: Ejecutar script SQL
   -- database/employee_folders_setup.sql
   ```

2. **Error: Google Drive no conectado**
   ```javascript
   // Solución: Verificar tokens
   await enhancedEmployeeFolderService.initializeDrive(userTokens);
   ```

3. **Error: Carpetas duplicadas**
   ```javascript
   // Solución: El sistema maneja duplicados automáticamente
   // Usa upsert en lugar de insert
   ```

### Logs y Debugging

```javascript
// Habilitar logs detallados
console.log('Employee folder service initialized');
console.log('Creating folder for employee:', employeeEmail);
console.log('Folder created successfully:', folderData);
```

## 📈 Mejoras Futuras

### 1. Funcionalidades Planeadas

- **Sincronización automática** periódica
- **Versionado de documentos**
- **Flujos de aprobación**
- **Integración con otros servicios de nube**
- **Analytics avanzado de uso**

### 2. Optimizaciones

- **Caching** para mejorar rendimiento
- **Batch processing** para operaciones masivas
- **Webhooks** para sincronización en tiempo real
- **Mobile app** para acceso móvil

## 📞 Soporte y Contacto

### Documentación Relacionada

- `database/employee_folders_setup.sql` - Estructura de base de datos
- `scripts/initialize_employee_folders.mjs` - Script de inicialización
- `src/services/enhancedEmployeeFolderService.js` - Servicio principal
- `src/components/employees/EmployeeFolderManager.js` - Interfaz admin

### Comandos Útiles

```bash
# Verificar estructura
node scripts/initialize_employee_folders.mjs

# Inicializar carpetas
node -e "import('./scripts/initialize_employee_folders.mjs').then(m => m.initializeEmployeeFolders())"

# Verificar conexión a Supabase
node test_connection.mjs
```

---

## 🎉 Conclusión

El sistema de carpetas de empleados de BrifyRRHH v2 está completamente implementado y funcional. Ofrece:

- ✅ **Creación automática** de carpetas para nuevos empleados
- ✅ **Vinculación con Supabase** para persistencia
- ✅ **Integración con Google Drive** opcional
- ✅ **Interfaz administrativa** completa
- ✅ **Scripts de inicialización** automáticos
- ✅ **Estadísticas y monitoreo** detallados
- ✅ **Seguridad y auditoría** robustas

El sistema está listo para producción y puede manejar miles de empleados de manera eficiente.