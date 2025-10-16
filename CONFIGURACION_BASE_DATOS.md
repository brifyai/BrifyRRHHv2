# Instrucciones para Configurar la Base de Datos Supabase

## 📋 Resumen
La aplicación ya está conectada al proyecto Supabase brify (https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe), pero necesitan crearse las tablas manualmente.

## 🔧 Pasos para Configurar la Base de Datos

### 1. Acceder al SQL Editor
1. Ve a: https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe
2. Haz clic en "SQL Editor" en el menú lateral
3. Haz clic en "New query"

### 2. Ejecutar el Script Principal
Copia y pega el contenido del archivo `database/new-supabase-setup.sql` en el SQL Editor y ejecútalo.

```bash
# Para ver el contenido del script:
cat database/new-supabase-setup.sql
```

### 3. Verificar Tablas Creadas
Después de ejecutar el script, deberías ver las siguientes tablas:
- `employees`
- `messages`
- `companies`
- `templates`
- `users`
- `plans`
- `payments`
- Y otras tablas del sistema

### 4. Generar Datos de Prueba (Opcional)
Si quieres generar datos de prueba, ejecuta:

```bash
node scripts/generate-50-employees-per-company.js
```

## 🚀 Problema del Botón "Tendencias" - SOLUCIONADO

El problema principal era que las URLs no coincidían:

### Antes:
- Botón "Tendencias" → `/base-de-datos` → Mostraba pestaña "Datos"
- No había acceso directo a "Tendencias"

### Ahora:
- ✅ Botón "Tendencias" → `/communication` → Muestra pestaña "Tendencias" 
- ✅ Opción "Tendencias" agregada al navbar
- ✅ Opción "Base de datos" mantiene acceso a datos de empleados

## 📁 Estructura de Navegación Actual

```
Panel Principal (/panel-principal)
├── Tendencias (/communication) ← Insights de IA por empresa
├── Base de datos (/base-de-datos) ← Gestión de empleados
├── Búsqueda IA (/busqueda-ia) ← Búsqueda semántica
└── Configuración (/configuracion)
```

## 🔍 Verificación

1. **Botón "Tendencias" en tarjetas de empresas**: 
   - Debe llevar a `/communication`
   - Mostrar insights de IA de la empresa seleccionada

2. **Navbar**: 
   - "Tendencias" lleva a `/communication`
   - "Base de datos" lleva a `/base-de-datos`

3. **Base de Datos**: 
   - Todas las tablas deben existir
   - No debe haber errores 404 en la consola

## ⚠️ Notas Importantes

- La aplicación ya está configurada para el proyecto brify correcto
- Los errores 404 que veías eran porque las tablas no existían
- Una vez creadas las tablas, los insights de IA funcionarán correctamente
- El botón "Tendencias" ahora funciona correctamente con las URLs corregidas

## 🆘 Si Hay Problemas

1. **Errores de autenticación**: Verifica que las claves en `.env` sean correctas
2. **Tablas no aparecen**: Ejecuta el script SQL nuevamente
3. **Botón no funciona**: Verifica que estés en `http://localhost:3003`

---

**Estado Actual**: ✅ Botón "Tendencias" reparado, URLs corregidas, solo falta configurar tablas en Supabase