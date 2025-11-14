# Arquitectura de Sincronización: Supabase ↔ Google Drive ↔ StaffHub

## Overview

El sistema de sincronización mantiene la consistencia de datos entre tres plataformas:
- **Supabase**: Base de datos principal (metadatos y relaciones)
- **Google Drive**: Almacenamiento de archivos y carpetas
- **StaffHub**: Interfaz de usuario y lógica de negocio

## Flujo de Sincronización Actual

### 1. Creación de Carpetas

#### Flujo Principal (StaffHub → Supabase → Google Drive)
```
Usuario en StaffHub
    ↓
googleDriveSyncService.createEmployeeFolderInDrive()
    ↓
1. Verificar si existe en Supabase
2. Si no existe, verificar en Google Drive
3. Crear carpeta en Google Drive (si es necesario)
4. Crear/actualizar registro en Supabase
    ↓
Respuesta con estado de sincronización
```

#### Estados de Sincronización
- `already_exists`: Carpeta existe en Supabase y Google Drive
- `existed_in_drive_created_in_supabase`: Existía en Drive, se crea registro en Supabase
- `updated_drive_id`: Se actualiza ID de Drive en Supabase
- `created_in_both`: Se crea nueva carpeta en ambos sistemas

### 2. Estructura de Datos

#### Supabase (employee_folders)
```sql
- id: UUID único
- employee_email: Email del empleado (clave única)
- employee_name: Nombre completo
- company_id: ID de la empresa
- company_name: Nombre de la empresa
- drive_folder_id: ID de la carpeta en Google Drive
- drive_folder_url: URL completa de la carpeta
- folder_status: 'active' | 'deleted' | 'sync_error'
- created_at: Timestamp de creación
- updated_at: Timestamp de última actualización
```

#### Google Drive (Estructura de Carpetas)
```
📁 Empleados - [Nombre Empresa]
    📁 [Nombre Empleado] (email@ejemplo.com)
        📄 Archivos del empleado
```

## Escenarios de Sincronización

### ✅ Escenario 1: Creación Exitosa
**Acción**: Usuario sincroniza un empleado nuevo
**Resultado**: 
- ✅ Carpeta creada en Google Drive
- ✅ Registro creado en Supabase
- ✅ StaffHub muestra la carpeta como activa

### ✅ Escenario 2: Detección de Duplicados
**Acción**: Usuario sincroniza un empleado ya existente
**Resultado**:
- ✅ No se crea carpeta duplicada
- ✅ Se reutiliza carpeta existente
- ✅ Se actualizan metadatos si es necesario

### ⚠️ Escenario 3: Inconsistencia Parcial
**Acción**: Existe carpeta en Drive pero no en Supabase
**Resultado**:
- ✅ Se crea registro en Supabase
- ✅ Se vincula con carpeta existente en Drive
- ✅ StaffHub muestra la carpeta como sincronizada

### ❌ Escenario 4: Eliminación en Google Drive
**Acción**: Usuario elimina carpeta directamente en Google Drive
**Resultado Actual**:
- ❌ El registro en Supabase queda huérfano
- ❌ StaffHub muestra carpeta como activa (incorrecto)
- ❌ Los archivos se pierden

### ❌ Escenario 5: Eliminación en Supabase
**Acción**: Usuario elimina registro en Supabase directamente
**Resultado Actual**:
- ❌ La carpeta en Google Drive queda huérfana
- ❌ StaffHub no muestra la carpeta (correcto)
- ❌ Los archivos en Drive siguen existiendo

## Problemas Identificados

### 1. **Sincronización Unidireccional**
- Actualmente solo sincroniza desde StaffHub hacia afuera
- No detecta cambios externos (eliminación directa en Drive)
- No hay sincronización bidireccional

### 2. **Manejo de Eliminación**
- No hay sistema para sincronizar eliminaciones
- No hay detección de carpetas huérfanas
- No hay proceso de limpieza

### 3. **Detección de Conflictos**
- No hay sistema para resolver conflictos
- No hay auditoría de cambios
- No hay sistema de recuperación

## Solución Propuesta

### 1. Sincronización Bidireccional

#### Implementar Webhooks de Google Drive
```javascript
// Escuchar cambios en Google Drive
googleDriveService.watchFolder(folderId, {
  webhookUrl: 'https://staffhub.com/api/webhooks/drive-changes',
  eventType: 'changes'
})
```

#### Implementar Triggers en Supabase
```sql
-- Trigger para detectar eliminaciones
CREATE TRIGGER sync_folder_deletion
AFTER DELETE ON employee_folders
FOR EACH ROW
EXECUTE FUNCTION handle_folder_deletion();
```

### 2. Sistema de Detección de Inconsistencias

#### Auditoría Periódica
```javascript
async auditConsistency() {
  // 1. Obtener todas las carpetas de Supabase
  const supabaseFolders = await supabase.from('employee_folders').select()
  
  // 2. Verificar existencia en Google Drive
  for (const folder of supabaseFolders) {
    const existsInDrive = await googleDriveService.getFileInfo(folder.drive_folder_id)
    if (!existsInDrive) {
      // Marcar como inconsistente
      await markAsInconsistent(folder.id)
    }
  }
  
  // 3. Buscar carpetas huérfanas en Drive
  const driveFolders = await googleDriveService.listFiles()
  const orphanedFolders = driveFolders.filter(folder => 
    !supabaseFolders.some(sf => sf.drive_folder_id === folder.id)
  )
  
  return { inconsistencies, orphanedFolders }
}
```

### 3. Manejo de Eliminación Sincronizada

#### Flujo de Eliminación Controlada
```javascript
async deleteEmployeeFolder(employeeEmail, deleteFromDrive = true) {
  try {
    // 1. Eliminar de Google Drive (si se solicita)
    if (deleteFromDrive) {
      const folder = await supabase
        .from('employee_folders')
        .select('drive_folder_id')
        .eq('employee_email', employeeEmail)
        .single()
      
      if (folder?.drive_folder_id) {
        await googleDriveService.deleteFile(folder.drive_folder_id)
      }
    }
    
    // 2. Eliminar de Supabase (soft delete)
    await supabase
      .from('employee_folders')
      .update({ 
        folder_status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('employee_email', employeeEmail)
    
    // 3. Notificar a StaffHub
    await notifyFolderDeletion(employeeEmail)
    
    return { success: true, message: 'Carpeta eliminada correctamente' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4. Sistema de Recuperación

#### Recuperación de Carpetas Huérfanas
```javascript
async recoverOrphanedFolders() {
  // 1. Encontrar carpetas en Drive sin registro en Supabase
  const driveFolders = await googleDriveService.listFiles()
  const supabaseFolders = await supabase.from('employee_folders').select()
  
  const orphaned = driveFolders.filter(driveFolder => 
    !supabaseFolders.some(supabaseFolder => 
      supabaseFolder.drive_folder_id === driveFolder.id
    )
  )
  
  // 2. Intentar recuperar basado en el nombre
  for (const orphan of orphaned) {
    const emailMatch = orphan.name.match(/\(([^@]+@[^)]+)\)/)
    if (emailMatch) {
      const email = emailMatch[1]
      await createSupabaseRecordFromDriveFolder(orphan, email)
    }
  }
  
  return { recovered: orphaned.length }
}
```

## Implementación Recomendada

### Fase 1: Mejoras Inmediatas
1. ✅ Implementar verificación de existencia (ya hecho)
2. 🔄 Agregar soft delete en Supabase
3. 🔄 Implementar auditoría de consistencia

### Fase 2: Sincronización Bidireccional
1. 🔄 Implementar webhooks de Google Drive
2. 🔄 Agregar triggers en Supabase
3. 🔄 Crear sistema de detección de cambios

### Fase 3: Sistema Completo
1. 🔄 Implementar eliminación sincronizada
2. 🔄 Agregar sistema de recuperación
3. 🔄 Crear panel de administración de sincronización

## Configuración Actual

### Variables de Entorno
```env
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=tu_client_secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Servicios Involucrados
- `googleDriveSyncService.js`: Orquestador principal
- `googleDriveService.js`: Interfaz con Google Drive API
- `googleDriveAuthService.js`: Gestión de autenticación
- `supabaseClient.js`: Conexión con Supabase

## Monitoreo y Logging

### Logs Actuales
```javascript
logger.info('GoogleDriveSyncService', `📁 Procesando carpeta para ${employeeEmail}...`)
logger.info('GoogleDriveSyncService', `✅ Carpeta ya existe en Supabase: ${existingFolder.id}`)
logger.warn('GoogleDriveSyncService', `⚠️ Carpeta existe en Supabase pero no en Drive, recreando...`)
```

### Métricas Recomendadas
- Tiempo de sincronización por carpeta
- Tasa de éxito/fracaso
- Número de inconsistencias detectadas
- Carpetas recuperadas automáticamente

## Conclusión

El sistema actual funciona bien para creación y detección de duplicados, pero necesita mejoras para:
1. **Manejo de eliminaciones**: Implementar sincronización bidireccional
2. **Detección de inconsistencias**: Auditoría periódica automática
3. **Recuperación**: Sistema automático de recuperación de datos

Con estas mejoras, el sistema será completamente robusto y manejará todos los escenarios posibles de sincronización.