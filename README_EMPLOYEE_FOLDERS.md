# 🗂️ Sistema de Carpetas de Empleados - BrifyRRHH v2

## 🚀 Inicio Rápido

Este sistema permite crear carpetas personales automáticas para cada empleado con vinculación a Supabase y Google Drive.

### Requisitos Previos

- Node.js 18+
- Cuenta de Supabase configurada
- Variables de entorno configuradas

### Instalación en 3 Pasos

#### 1. Configurar Base de Datos

```bash
# Ejecutar script de configuración de base de datos
node scripts/setup_employee_folders_database.mjs
```

#### 2. Crear Carpetas Existentes

```bash
# Crear carpetas para todos los empleados registrados
node scripts/initialize_employee_folders.mjs
```

#### 3. Verificar Funcionamiento

```bash
# Iniciar la aplicación
npm run dev

# Navegar a la sección de gestión de carpetas
# http://localhost:3000/employee-folders
```

## 📋 Características Principales

### ✅ Automatización Completa

- **Creación automática** al registrar nuevos usuarios
- **Sincronización** con Google Drive opcional
- **Configuración** de notificaciones personalizada
- **Actualización** de datos del empleado automática

### ✅ Gestión Centralizada

- **Panel administrativo** intuitivo
- **Estadísticas** en tiempo real
- **Búsqueda** y filtrado avanzado
- **Acciones masivas** disponibles

### ✅ Integraciones

- **Supabase** para persistencia de datos
- **Google Drive** para almacenamiento en la nube
- **React** para interfaz moderna
- **Node.js** para backend services

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Servicios    │    │   Base de Datos │
│                 │    │                 │    │                 │
│ React Components│◄──►│EmployeeFolder   │◄──►│   Supabase      │
│ EmployeeManager │    │Service          │    │                 │
│ AuthContext     │    │GoogleDrive      │    │ PostgreSQL      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estructura de Archivos

```
├── database/
│   └── employee_folders_setup.sql     # Script SQL de base de datos
├── scripts/
│   ├── setup_employee_folders_database.mjs  # Configuración BD
│   └── initialize_employee_folders.mjs      # Inicialización
├── src/
│   ├── components/employees/
│   │   └── EmployeeFolderManager.js   # Componente admin
│   ├── services/
│   │   └── enhancedEmployeeFolderService.js  # Servicio principal
│   └── contexts/
│       └── AuthContext.js            # Autenticación integrada
└── README_EMPLOYEE_FOLDERS.md         # Este archivo
```

## 🔧 Configuración Detallada

### Variables de Entorno

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

# Google Drive (opcional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Configuración de Google Drive

1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear credenciales OAuth 2.0
4. Configurar URLs de redirección
5. Agregar variables de entorno

## 📊 Uso del Sistema

### Para Administradores

#### 1. Acceder al Panel

```
http://localhost:3000/employee-folders
```

#### 2. Ver Estadísticas

- Total de carpetas creadas
- Carpetas activas
- Carpetas con Google Drive
- Distribución por empresa

#### 3. Gestionar Carpetas

- **Ver detalles**: Click en el ícono de ojo
- **Abrir en Drive**: Click en el ícono de nube
- **Sincronizar**: Click en el ícono de refresh
- **Crear todas**: Botón superior derecho

#### 4. Buscar y Filtrar

- Por nombre del empleado
- Por email
- Por empresa
- Por cargo

### Para Empleados

#### 1. Registro Automático

Al registrarse, el sistema automáticamente:
- ✅ Crea su carpeta personal
- ✅ Configura notificaciones
- ✅ Prepara estructura de documentos

#### 2. Acceso a Carpetas

- **Via web**: En su perfil personal
- **Via Google Drive**: Enlace directo a su carpeta
- **Notificaciones**: Alertas de nuevos documentos

## 🛠️ Scripts Disponibles

### setup_employee_folders_database.mjs

Configura la estructura de base de datos completa:

```bash
node scripts/setup_employee_folders_database.mjs
```

**Qué hace:**
- Crea todas las tablas necesarias
- Configura índices y triggers
- Inserta datos iniciales
- Verifica la instalación

### initialize_employee_folders.mjs

Crea carpetas para empleados existentes:

```bash
node scripts/initialize_employee_folders.mjs
```

**Qué hace:**
- Recorre todos los empleados registrados
- Crea carpetas en Supabase
- Opcionalmente crea en Google Drive
- Genera reporte de resultados

## 🔍 Consultas Útiles

### Estadísticas Generales

```sql
-- Total de carpetas por empresa
SELECT 
  company_name,
  COUNT(*) as total_carpetas,
  COUNT(CASE WHEN drive_folder_id IS NOT NULL THEN 1 END) as con_drive
FROM employee_folders 
GROUP BY company_name 
ORDER BY total_carpetas DESC;

-- Carpetas creadas por mes
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as carpetas_creadas
FROM employee_folders 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- Empleados sin carpeta
SELECT 
  u.email,
  u.full_name,
  u.created_at as registro_usuario
FROM users u
LEFT JOIN employee_folders ef ON u.email = ef.employee_email
WHERE ef.employee_email IS NULL;
```

### Mantenimiento

```sql
-- Limpiar carpetas duplicadas
DELETE FROM employee_folders 
WHERE id NOT IN (
  SELECT DISTINCT ON (employee_email) id 
  FROM employee_folders 
  ORDER BY employee_email, created_at DESC
);

-- Actualizar estadísticas
UPDATE employee_folders 
SET updated_at = NOW() 
WHERE updated_at < NOW() - INTERVAL '1 day';
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. "Tabla no existe"

```bash
# Solución: Ejecutar script de configuración
node scripts/setup_employee_folders_database.mjs
```

#### 2. "Error de conexión a Supabase"

```bash
# Verificar variables de entorno
echo $REACT_APP_SUPABASE_URL
echo $REACT_APP_SUPABASE_ANON_KEY

# Probar conexión
node test_connection.mjs
```

#### 3. "Google Drive no conectado"

```javascript
// Verificar tokens en el perfil del usuario
const { data } = await supabase
  .from('user_credentials')
  .select('*')
  .eq('user_id', userId)
  .single();
```

#### 4. "Carpetas no se crean automáticamente"

```javascript
// Verificar AuthContext integration
// El sistema debe llamar a enhancedEmployeeFolderService.createEmployeeFolder()
// en el proceso de registro de usuarios
```

### Logs y Debugging

```javascript
// Habilitar logs detallados
console.log('Employee folder service:', enhancedEmployeeFolderService);

// Verificar estado del servicio
await enhancedEmployeeFolderService.initialize();

// Probar creación manual
const result = await enhancedEmployeeFolderService.createEmployeeFolder(
  'test@example.com',
  { name: 'Test User', position: 'Developer' }
);
```

## 📈 Monitoreo

### Métricas Clave

1. **Carpetas totales**: Número de carpetas creadas
2. **Tasa de creación**: Carpetas por día/semana
3. **Uso de Google Drive**: Porcentaje con Drive conectado
4. **Documentos por carpeta**: Promedio de documentos
5. **Actividad por usuario**: Últimos accesos

### Alertas Recomendadas

- Carpetas que no se sincronizan en más de 7 días
- Empleados nuevos sin carpeta (después de 1 hora)
- Errores de conexión con Google Drive
- Espacio de almacenamiento接近 límite

## 🔐 Seguridad

### Permisos y Acceso

- **Admin**: Acceso completo a todas las carpetas
- **Manager**: Acceso a carpetas de su empresa
- **Empleado**: Acceso solo a su carpeta personal

### Datos Protegidos

- Tokens de Google Drive encriptados
- Información personal sensible protegida
- Auditoría completa de accesos

## 🚀 Mejoras Futuras

### Próximas Versiones

- [ ] Sincronización automática periódica
- [ ] Versionado de documentos
- [ ] Flujos de aprobación
- [ ] Integración con otros servicios de nube
- [ ] Aplicación móvil dedicada

### Contribuciones

1. Fork del repositorio
2. Crear rama de feature
3. Implementar cambios con tests
4. Pull request con descripción detallada

## 📞 Soporte

### Documentación Adicional

- [Sistema completo](./SISTEMA_CARPETAS_EMPLEADOS_COMPLETO.md)
- [API Reference](./docs/api-reference.md)
- [Guía de desarrollo](./docs/development-guide.md)

### Contacto

- **Issues**: GitHub Issues
- **Email**: support@brifyrrhh.cl
- **Discord**: Canal dedicado

---

## 🎉 Resumen

El sistema de carpetas de empleados de BrifyRRHH v2 está diseñado para ser:

- ✅ **Automático**: Creación sin intervención manual
- ✅ **Escalable**: Maneja miles de empleados
- ✅ **Seguro**: Protección de datos sensible
- ✅ **Flexible**: Integración con múltiples servicios
- ✅ **Intuitivo**: Fácil de usar y administrar

¡Listo para usar en producción! 🚀