# Configuración de Google Drive para Netlify

## Overview

Este sistema implementa una solución híbrida de Google Drive que funciona tanto en desarrollo local como en producción en Netlify. Utiliza Google Drive real cuando está disponible y un sistema local simulado cuando no lo está.

## Arquitectura

### Componentes Principales

1. **HybridGoogleDriveService** (`src/lib/hybridGoogleDrive.js`)
   - Servicio principal que decide entre Google Drive real o local
   - Detección automática del entorno (desarrollo vs producción)
   - API unificada para ambas implementaciones

2. **LocalGoogleDriveService** (`src/lib/localGoogleDrive.js`)
   - Simulación completa de Google Drive usando localStorage
   - Almacenamiento de archivos como base64
   - Funcionalidades completas: crear carpetas, subir archivos, compartir, etc.

3. **EnhancedEmployeeFolderService** (`src/services/enhancedEmployeeFolderService.js`)
   - Servicio de carpetas de empleados integrado con el sistema híbrido
   - Creación automática de carpetas para empleados
   - Sincronización con Supabase

## Configuración para Netlify

### 1. Variables de Entorno

Configura estas variables en el dashboard de Netlify:

```bash
# Configuración de Drive
REACT_APP_DRIVE_MODE=local
REACT_APP_ENVIRONMENT=production

# Supabase (ya configuradas)
REACT_APP_SUPABASE_URL=tu_supabase_url
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Opcional: Google Drive (para desarrollo futuro)
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret
REACT_APP_GOOGLE_API_KEY=tu_google_api_key
```

### 2. Archivo de Configuración

El archivo `netlify.toml` ya está configurado con:

- Redirecciones adecuadas para SPA
- Headers de seguridad
- Variables de entorno por contexto
- Configuración de build

### 3. Funcionalidades Disponibles

#### En Producción (Netlify)

✅ **Funcionalidades Completas con Drive Local:**
- Crear carpetas para empleados
- Subir archivos a carpetas
- Compartir carpetas (simulado)
- Descargar archivos
- Buscar archivos
- Vista previa de archivos
- Estadísticas de uso

✅ **Ventajas del Modo Local:**
- Sin dependencia de APIs externas
- Funcionamiento offline parcial
- Más rápido para archivos pequeños
- Sin costos de API de Google

#### En Desarrollo Local

✅ **Modo Híbrido:**
- Intenta usar Google Drive real primero
- Si no está disponible, usa Drive local
- Permite testing con ambos sistemas

## Uso del Sistema

### Crear Carpetas de Empleados

```javascript
import enhancedEmployeeFolderService from './services/enhancedEmployeeFolderService';

// Inicializar servicio
await enhancedEmployeeFolderService.initialize();

// Crear carpeta para un empleado
const result = await enhancedEmployeeFolderService.createEmployeeFolder(
  'empleado@empresa.com',
  {
    id: 'emp_123',
    name: 'Juan Pérez',
    company_id: 'comp_456'
  }
);

console.log('Carpeta creada:', result);
```

### Subir Archivos

```javascript
// Subir archivo a la carpeta del empleado
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const uploadResult = await enhancedEmployeeFolderService.addEmployeeDocument(
  'empleado@empresa.com',
  {
    name: file.name,
    size: file.size,
    type: file.type,
    file: file
  }
);
```

### Verificar Estado del Servicio

```javascript
const stats = enhancedEmployeeFolderService.getServiceStats();
console.log('Estado del servicio:', stats);

/*
Salida esperada en producción:
{
  hybridDriveInitialized: true,
  service: "Google Drive Local",
  isReal: false,
  driveStats: {
    folders: 15,
    files: 45,
    totalSize: 1048576,
    totalSizeFormatted: "1 MB",
    isLocal: true
  },
  features: {
    createFolders: true,
    uploadFiles: true,
    shareFolders: true,
    deleteFiles: true,
    downloadFiles: true,
    localStorage: true
  }
}
*/
```

## Consideraciones de Almacenamiento

### LocalStorage Limits

- **Capacidad:** ~5-10 MB dependiendo del navegador
- **Archivos grandes:** No recomendado para archivos > 1MB
- **Persistencia:** Los datos persisten en el navegador del usuario

### Recomendaciones

1. **Para archivos pequeños:** (< 100KB) - Modo local es perfecto
2. **Para archivos medianos:** (100KB - 1MB) - Modo local con precaución
3. **Para archivos grandes:** (> 1MB) - Considerar Google Drive real

## Migración a Google Drive Real

Cuando quieras migrar a Google Drive real:

1. **Configurar credenciales de Google**
2. **Actualizar variables de entorno:**
   ```bash
   REACT_APP_DRIVE_MODE=google
   ```
3. **El sistema detectará automáticamente y usará Google Drive real**

## Testing

### Probar el Sistema Local

```javascript
// En consola del navegador
import hybridGoogleDriveService from './lib/hybridGoogleDrive';

// Verificar servicio
await hybridGoogleDriveService.initialize();
console.log(hybridGoogleDriveService.getServiceInfo());

// Crear carpeta de prueba
const testFolder = await hybridGoogleDriveService.createFolder('Test Folder');
console.log('Carpeta creada:', testFolder);

// Listar archivos
const files = await hybridGoogleDriveService.listFiles();
console.log('Archivos:', files);
```

### Probar Cambio de Servicios

```javascript
// Cambiar a Google Drive real (si está configurado)
await enhancedEmployeeFolderService.switchDriveService(true);

// Cambiar a modo local
await enhancedEmployeeFolderService.switchDriveService(false);
```

## Troubleshooting

### Problemas Comunes

1. **"Drive no está inicializado"**
   - Solución: Espera a que la aplicación cargue completamente
   - Verifica que `initialize()` se haya llamado correctamente

2. **"Error de almacenamiento local"**
   - Solución: Limpia el localStorage del navegador
   - Usa `enhancedEmployeeFolderService.clearLocalStorage()`

3. **Archivos no se cargan**
   - Solución: Verifica el tamaño del archivo (< 1MB para modo local)
   - Revisa la consola para errores específicos

### Logs Útiles

El sistema incluye logs detallados para debugging:

```javascript
// Habilitar logs detallados
localStorage.setItem('brify-drive-debug', 'true');

// Ver logs en consola
console.log('Drive Service:', hybridGoogleDriveService.getServiceStats());
```

## Performance

### Optimizaciones Implementadas

1. **Lazy loading** de servicios
2. **Caching** en localStorage
3. **Compresión** de archivos base64
4. **Paginación** para listas grandes

### Métricas Esperadas

- **Creación de carpeta:** < 100ms
- **Subida de archivo:** < 500ms (archivos < 100KB)
- **Búsqueda:** < 50ms
- **Listado:** < 200ms

## Seguridad

### Implementaciones

1. **Sanitización** de nombres de archivo
2. **Validación** de tipos MIME
3. **Límites** de tamaño de archivo
4. **Aislamiento** por dominio

### Consideraciones

- Los archivos se almacenan como base64 en localStorage
- No hay almacenamiento persistente en el servidor
- Los datos se pierden si el usuario limpia el navegador

## Futuras Mejoras

1. **IndexedDB** para mayor capacidad
2. **Web Workers** para procesamiento en background
3. **Compresión** mejorada de archivos
4. **Sincronización** con Google Drive real
5. **Backup** en la nube

---

## Resumen

El sistema de Google Drive para Netlify proporciona:

✅ **Funcionalidad completa** sin dependencias externas  
✅ **Experiencia de usuario** consistente  
✅ **Rendimiento óptimo** para archivos pequeños  
✅ **Flexibilidad** para migrar a Google Drive real  
✅ **Costo cero** en almacenamiento y APIs  

Perfecto para MVPs, demos, y aplicaciones con requisitos de almacenamiento moderados.