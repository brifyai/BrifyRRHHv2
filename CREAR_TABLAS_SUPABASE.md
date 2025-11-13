# Crear Tablas de Carpetas de Empleados en Supabase

## Problema
La tabla `employee_folders` no existe en Supabase, causando errores 404 al intentar sincronizar carpetas de Google Drive.

## Solución

### Opción 1: Usar la Consola SQL de Supabase (Recomendado)

1. **Accede a tu proyecto Supabase**
   - Ve a: https://app.supabase.com/projects
   - Selecciona tu proyecto

2. **Abre la consola SQL**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Copia y pega el SQL**
   - Abre el archivo: `database/employee_folders_setup.sql`
   - Copia TODO el contenido
   - Pégalo en la consola SQL de Supabase

4. **Ejecuta el SQL**
   - Haz clic en el botón "Run" (o presiona Ctrl+Enter)
   - Espera a que se complete

5. **Verifica que se crearon las tablas**
   - En el menú lateral, ve a "Table Editor"
   - Deberías ver las nuevas tablas:
     - `employee_folders`
     - `employee_documents`
     - `employee_faqs`
     - `employee_conversations`
     - `employee_notification_settings`

### Opción 2: Usar psql desde Terminal

Si tienes psql instalado:

```bash
# Reemplaza [tu-proyecto] con tu ID de proyecto Supabase
psql -h db.[tu-proyecto].supabase.co \
     -U postgres \
     -d postgres \
     -f database/employee_folders_setup.sql
```

Cuando te pida contraseña, usa la contraseña de tu base de datos Supabase.

### Opción 3: Usar el Script Node.js

```bash
# Asegúrate de que las variables de entorno están configuradas
node create_employee_folders_table.mjs
```

## Verificar que las Tablas se Crearon

### Desde Supabase Dashboard:
1. Ve a "Table Editor"
2. Deberías ver `employee_folders` en la lista

### Desde Terminal:
```bash
# Conectar a Supabase
psql -h db.[tu-proyecto].supabase.co -U postgres -d postgres

# Listar tablas
\dt

# Ver estructura de employee_folders
\d employee_folders
```

## Estructura de la Tabla `employee_folders`

```sql
CREATE TABLE employee_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_email TEXT NOT NULL UNIQUE,
    employee_id TEXT,
    employee_name TEXT,
    employee_position TEXT,
    employee_department TEXT,
    employee_phone TEXT,
    employee_region TEXT,
    employee_level TEXT,
    employee_work_mode TEXT,
    employee_contract_type TEXT,
    company_id UUID REFERENCES companies(id),
    company_name TEXT,
    drive_folder_id TEXT,
    drive_folder_url TEXT,
    local_folder_path TEXT,
    folder_status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tablas Relacionadas Creadas

1. **employee_folders** - Carpetas principales de empleados
2. **employee_documents** - Documentos dentro de carpetas
3. **employee_faqs** - FAQs por empleado
4. **employee_conversations** - Historial de conversaciones
5. **employee_notification_settings** - Configuración de notificaciones

## Después de Crear las Tablas

1. **Habilitar Row Level Security (RLS)**
   - Ve a "Authentication" → "Policies"
   - Crea políticas para `employee_folders`
   - Ver: `database/employee_folders_policies.sql`

2. **Probar la Sincronización**
   - Ve a la página de "Carpetas de Empleados"
   - Haz clic en "Sincronizar con Drive"
   - Las carpetas deberían crearse sin errores 404

## Solución de Problemas

### Error: "Could not find the table 'public.employee_folders'"
- **Causa**: La tabla no existe en Supabase
- **Solución**: Ejecuta el SQL desde la consola de Supabase

### Error: "permission denied for schema public"
- **Causa**: Permisos insuficientes
- **Solución**: Usa la contraseña de administrador de Supabase

### Error: "relation already exists"
- **Causa**: La tabla ya existe
- **Solución**: Usa `DROP TABLE IF EXISTS` o ignora el error

## Verificar Datos Insertados

Después de sincronizar carpetas, verifica que se insertaron:

```sql
-- Ver todas las carpetas creadas
SELECT employee_email, employee_name, company_name, folder_status 
FROM employee_folders 
ORDER BY created_at DESC;

-- Contar carpetas por empresa
SELECT company_name, COUNT(*) as total 
FROM employee_folders 
GROUP BY company_name;

-- Ver carpetas con errores
SELECT employee_email, sync_error 
FROM employee_folders 
WHERE folder_status = 'error';
```

## Notas Importantes

- Las tablas tienen `ON DELETE CASCADE` para mantener integridad referencial
- Se crean índices automáticamente para optimizar búsquedas
- Los triggers actualizan automáticamente `updated_at`
- RLS debe estar habilitado para seguridad en producción
