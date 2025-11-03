# Sistema de URLs Específicas por Empresa

## Overview

Se ha implementado un sistema completo de URLs específicas por empresa que permite configurar los canales de comunicación de cada empresa de forma individual y organizada. Esto resuelve el problema de confusión entre diferentes APIs al tener URLs dedicadas para cada empresa.

## Características Principales

### 1. Rutas Dinámicas
- **Lista general**: `/configuracion/empresas` - Muestra todas las empresas
- **Configuración específica**: `/configuracion/empresas/:companyId` - Configuración dedicada por empresa

### 2. Modos de Operación

#### Modo General (Lista de Empresas)
- URL: `/configuracion/empresas`
- Muestra todas las empresas en tarjetas
- Cada tarjeta tiene 3 botones:
  - 🔧 **Configuración** (morado) - Accede a configuración específica de canales
  - ✏️ **Editar** (azul) - Edición general de la empresa
  - 🗑️ **Eliminar** (rojo) - Eliminar empresa

#### Modo Específico (Configuración por Empresa)
- URL: `/configuracion/empresas/:companyId`
- Interfaz restringida enfocada solo en configuración de canales
- No se permite editar información básica (nombre, estado, descripción)
- Sección de empleados oculta
- Botón "Volver a Empresas" para regresar a la lista

## Implementación Técnica

### 1. Archivos Modificados

#### `src/App.js`
```javascript
// Nueva ruta dinámica
<Route
  path="/configuracion/empresas/:companyId"
  element={
    <ProtectedRoute>
      <AuthenticatedLayout>
        <Settings activeTab="companies" companyId={true} />
      </AuthenticatedLayout>
    </ProtectedRoute>
  }
/>
```

#### `src/components/settings/Settings.js`
```javascript
// Detección automática del modo empresa específica
useEffect(() => {
  if (propCompanyId === true) {
    const pathParts = location.pathname.split('/')
    const companyIdFromUrl = pathParts[pathParts.length - 1]
    if (companyIdFromUrl && companyIdFromUrl !== 'empresas') {
      setCompanyId(companyIdFromUrl)
      // Cargar empresa específica...
    }
  }
}, [propCompanyId, location.pathname, companies.length])

// Botón de configuración específica en cada tarjeta
<button
  onClick={() => navigate(`/configuracion/empresas/${company.id}`)}
  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
  title="Configurar canales de comunicación"
>
  <Cog6ToothIcon className="h-4 w-4" />
</button>
```

#### `src/components/settings/CompanyForm.js`
```javascript
// Props para modo específico
const CompanyForm = ({ company, onSuccess, onCancel, companyId, isCompanySpecificMode }) => {
  // Lógica condicional según el modo
  const headerTitle = isCompanySpecificMode ? 'Configuración de Empresa' : 
                     (company ? 'Editar Empresa' : 'Nueva Empresa')
  
  // Deshabilitar campos básicos en modo específico
  // Ocultar sección de empleados en modo específico
}
```

### 2. Flujo de Navegación

#### Usuario hace clic en botón de configuración específica:
1. URL cambia a: `/configuracion/empresas/123`
2. Componente Settings detecta `propCompanyId === true`
3. Extrae `companyId` de la URL
4. Carga la empresa específica
5. Muestra CompanyForm en modo específico

#### Usuario hace clic en "Volver a Empresas":
1. URL cambia a: `/configuracion/empresas`
2. Componente Settings resetea estados
3. Muestra lista general de empresas

## Ventajas del Sistema

### 1. Organización
- Cada empresa tiene su propia URL de configuración
- Separación clara entre configuración general y específica
- No hay confusión entre APIs de diferentes empresas

### 2. Experiencia de Usuario
- Interfaz simplificada y enfocada
- Navegación intuitiva con botones dedicados
- Indicadores visuales claros del modo actual

### 3. Mantenimiento
- Código limpio y modular
- Lógica reutilizable
- Fácil de extender

## Casos de Uso

### 1. Configuración de Canales por Empresa
```
Empresa A: /configuracion/empresas/company-a-id
- Configurar WhatsApp específico
- Configurar Telegram específico
- Configurar email y SMS específicos
```

### 2. Gestión Multi-Empresa
```
Administrador puede:
- Ver lista general: /configuracion/empresas
- Acceder a configuración específica de cada empresa
- Alternar entre empresas sin perder contexto
```

## Pruebas Realizadas

### 1. Pruebas de Lógica de URL
✅ Extracción correcta de companyId de URLs
✅ Detección automática del modo específico
✅ Generación correcta de URLs de navegación

### 2. Pruebas de Navegación
✅ Botón de configuración específica funciona
✅ Regreso a lista general funciona
✅ Mantenimiento de estado entre navegaciones

### 3. Pruebas de Modo Específico
✅ Deshabilitado edición de campos básicos
✅ Ocultada sección de empleados
✅ Mostrada solo configuración de canales

## Consideraciones de Seguridad

### 1. Validación de Acceso
- Pendiente: Implementar validación para que usuarios solo accedan a empresas autorizadas
- Pendiente: Verificar permisos antes de mostrar configuración específica

### 2. Sanitización de URLs
- El sistema valida que el companyId no sea 'empresas'
- Se manejan casos de IDs inválidos

## Extensiones Futuras

### 1. Validación de Acceso
```javascript
// Pendiente de implementar
const validateCompanyAccess = async (companyId, userId) => {
  // Verificar si usuario tiene permiso para acceder a esta empresa
}
```

### 2. Breadcrumbs
- Agregar navegación por migajas de pan
- Mostrar ruta completa: Configuración > Empresas > Nombre Empresa

### 3. Búsqueda y Filtros
- Búsqueda rápida de empresas en lista general
- Filtros por estado, tipo, etc.

## Resumen de Implementación

El sistema de URLs específicas por empresa ha sido implementado exitosamente con las siguientes características:

1. **Rutas dinámicas** que permiten URLs únicas por empresa
2. **Detección automática** del modo de operación según la URL
3. **Interfaz adaptativa** que cambia según el modo
4. **Navegación intuitiva** con botones dedicados
5. **Pruebas completas** que validan el funcionamiento

Esta implementación resuelve el problema original de confusión entre APIs y proporciona una base sólida para la gestión multi-empresa del sistema de comunicación.

---

**Archivos clave modificados:**
- `src/App.js` - Rutas dinámicas
- `src/components/settings/Settings.js` - Lógica de detección y navegación
- `src/components/settings/CompanyForm.js` - Modos de operación

**Archivos de prueba:**
- `test-url-logic-simple.js` - Pruebas de lógica del sistema
- `test-company-specific-urls.js` - Pruebas completas del sistema