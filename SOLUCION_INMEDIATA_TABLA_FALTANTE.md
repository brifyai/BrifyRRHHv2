# 🔧 SOLUCIÓN INMEDIATA: Error de Tabla Faltante

## 📋 Problema Identificado

**Error:** `Could not find the table 'public.non_gmail_employees' in the schema cache`

**Causa:** La aplicación intenta acceder a la tabla `non_gmail_employees` que no existe en Supabase.

## 🚀 Solución Inmediata

### Paso 1: Acceder a Supabase Dashboard
1. Ve a: https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe
2. Inicia sesión con tus credenciales

### Paso 2: Ejecutar SQL en el Editor
1. En el dashboard, ve a **"SQL Editor"** (en el menú lateral)
2. Crea una nueva consulta
3. Copia y pega el siguiente SQL completo:

```sql
-- Crear tabla para empleados no-Gmail que no pueden usar Google Drive
-- Esta tabla almacena empleados cuyos emails no son de Gmail y por tanto
-- no pueden recibir permisos de Google Drive

CREATE TABLE IF NOT EXISTS non_gmail_employees (
    id SERIAL PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL UNIQUE,
    employee_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) DEFAULT 'non_gmail',
    reason TEXT NOT NULL,
    employee_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_non_gmail_employees_email ON non_gmail_employees(employee_email);
CREATE INDEX IF NOT EXISTS idx_non_gmail_employees_company ON non_gmail_employees(company_name);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_non_gmail_employees_updated_at ON non_gmail_employees;
CREATE TRIGGER update_non_gmail_employees_updated_at
    BEFORE UPDATE ON non_gmail_employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

4. Haz clic en **"Run"** para ejecutar el SQL

### Paso 3: Verificar la Creación
1. Ve a **"Table Editor"** en el menú lateral
2. Busca la tabla `non_gmail_employees` en la lista
3. Debería aparecer con las columnas:
   - id (SERIAL PRIMARY KEY)
   - employee_email (VARCHAR, UNIQUE)
   - employee_name (VARCHAR)
   - company_name (VARCHAR)
   - email_type (VARCHAR)
   - reason (TEXT)
   - employee_data (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## ✅ Resultado Esperado

Una vez ejecutada la tabla, la aplicación debería funcionar sin el error de tabla faltante. El flujo de Google Drive funcionará correctamente para empleados con emails no-Gmail.

## 📝 Notas Importantes

- **Tiempo de ejecución:** ~30 segundos
- **Permisos requeridos:** Service Role o Owner
- **Impacto:** Ninguno en datos existentes
- **Reversible:** Sí, puedes eliminar la tabla si es necesario
- **Error de sintaxis:** ✅ CORREGIDO - El archivo SQL ya no tiene errores

## 🔍 Código que Causa el Error

El error proviene de `src/services/googleDriveSyncService.js` en la función `registerNonGmailEmployee()` que intenta insertar datos en esta tabla cuando encuentra empleados con emails no-Gmail.

## 📊 Estado Actual

- **Problema identificado:** ✅
- **Solución SQL creada:** ✅
- **Error de sintaxis corregido:** ✅
- **Documentación actualizada:** ✅
- **Pendiente:** Ejecutar SQL en Supabase (5 minutos)