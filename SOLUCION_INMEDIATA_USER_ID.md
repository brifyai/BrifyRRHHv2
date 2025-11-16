# 🚨 SOLUCIÓN INMEDIATA: Error `column companies.user_id does not exist`

## PROBLEMA IDENTIFICADO
El error ocurre porque las políticas de seguridad (RLS) hacen referencia a `companies.user_id`, pero **esa columna NO existe** en la tabla `companies`.

## SOLUCIÓN DEFINITIVA

### Paso 1: Ejecutar SQL en Supabase Dashboard (MÉTODO RECOMENDADO)

1. **Abre Supabase Dashboard**: Ve a https://supabase.com/dashboard
2. **Selecciona tu proyecto**: `BrifyWebServicios`
3. **Ve a SQL Editor**: En el menú lateral, haz clic en "SQL Editor"
4. **Ejecuta el siguiente SQL**:

```sql
-- ============================================
-- SOLUCIÓN DEFINITIVA: Relación Usuarios-Empresas
-- ============================================

-- PASO 1: Crear tabla de relación usuarios-empresas
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_user UNIQUE (company_id, user_id)
);

-- Índices para performance
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_company_users_role ON company_users(role);

-- PASO 2: Habilitar RLS en la tabla de relación
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Políticas para company_users
DROP POLICY IF EXISTS company_users_select_own ON company_users;
CREATE POLICY company_users_select_own ON company_users
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS company_users_insert_own ON company_users;
CREATE POLICY company_users_insert_own ON company_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS company_users_update_own ON company_users;
CREATE POLICY company_users_update_own ON company_users
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS company_users_delete_own ON company_users;
CREATE POLICY company_users_delete_own ON company_users
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 3: Función para verificar si un usuario tiene acceso a una empresa
CREATE OR REPLACE FUNCTION user_has_company_access(p_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM company_users cu
        WHERE cu.company_id = p_company_id 
        AND cu.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Actualizar políticas RLS que usan companies.user_id

-- Para company_integrations
DROP POLICY IF EXISTS company_integrations_select_own ON company_integrations;
CREATE POLICY company_integrations_select_own ON company_integrations
    FOR SELECT USING (user_has_company_access(company_id));

-- Para integration_webhooks
DROP POLICY IF EXISTS integration_webhooks_select_own ON integration_webhooks;
CREATE POLICY integration_webhooks_select_own ON integration_webhooks
    FOR SELECT USING (user_has_company_access(company_id));

-- Para integration_sync_logs
DROP POLICY IF EXISTS integration_sync_logs_select_own ON integration_sync_logs;
CREATE POLICY integration_sync_logs_select_own ON integration_sync_logs
    FOR SELECT USING (
        auth.uid() = user_id OR user_has_company_access(company_id)
    );

-- Para integration_usage_stats
DROP POLICY IF EXISTS integration_usage_stats_select_own ON integration_usage_stats;
CREATE POLICY integration_usage_stats_select_own ON integration_usage_stats
    FOR SELECT USING (user_has_company_access(company_id));

-- Para realtime_notifications (de microservicios)
DROP POLICY IF EXISTS "Usuarios pueden ver notificaciones de sus empresas" ON realtime_notifications;
CREATE POLICY "Usuarios pueden ver notificaciones de sus empresas" ON realtime_notifications
    FOR SELECT USING (user_has_company_access(company_id));

-- PASO 5: Trigger para auto-actualizar updated_at
DROP TRIGGER IF EXISTS update_company_users_updated_at ON company_users;
CREATE TRIGGER update_company_users_updated_at
    BEFORE UPDATE ON company_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PASO 6: Función para asignar empresa a usuario actual
CREATE OR REPLACE FUNCTION assign_company_to_current_user(
    p_company_id UUID,
    p_role TEXT DEFAULT 'admin'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO company_users (company_id, user_id, role)
    VALUES (p_company_id, auth.uid(), p_role)
    ON CONFLICT (company_id, user_id) 
    DO UPDATE SET role = p_role, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 7: Función para obtener empresas del usuario actual
CREATE OR REPLACE FUNCTION get_user_companies()
RETURNS TABLE (
    id UUID,
    name TEXT,
    industry TEXT,
    location TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.industry,
        c.location,
        cu.role
    FROM companies c
    INNER JOIN company_users cu ON c.id = cu.company_id
    WHERE cu.user_id = auth.uid()
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 8: Migrar datos si existen empresas sin relación
DO $$
DECLARE
    v_first_user_id UUID;
    v_company RECORD;
BEGIN
    -- Obtener el primer usuario autenticado
    SELECT id INTO v_first_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF v_first_user_id IS NOT NULL THEN
        -- Asignar todas las empresas sin relación a ese usuario
        FOR v_company IN 
            SELECT c.id 
            FROM companies c
            LEFT JOIN company_users cu ON c.id = cu.company_id
            WHERE cu.id IS NULL
        LOOP
            INSERT INTO company_users (company_id, user_id, role)
            VALUES (v_company.id, v_first_user_id, 'admin')
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- PASO 9: Confirmación
SELECT '✅ SOLUCIÓN DEFINITIVA APLICADA!' as status;

-- Mostrar estadísticas
SELECT 
    'company_users' as tabla,
    COUNT(*) as registros
FROM company_users

UNION ALL

SELECT 
    'companies sin usuario' as tabla,
    COUNT(*) as registros
FROM companies c
LEFT JOIN company_users cu ON c.id = cu.company_id
WHERE cu.id IS NULL;

-- Mostrar empresas asignadas al usuario actual
SELECT * FROM get_user_companies();
```

5. **Haz clic en "Run"** (botón naranja en la esquina inferior derecha)

### Paso 2: Verificar la Solución

Después de ejecutar el SQL, verifica que:

1. **La tabla `company_users` fue creada**: Ve a "Table Editor" y busca `company_users`
2. **Las políticas fueron actualizadas**: Ve a "Authentication" > "Policies"
3. **El error desapareció**: Refresca tu aplicación y prueba la funcionalidad

### Paso 3: Actualizar tu Código (Opcional pero Recomendado)

Si tienes componentes que crean empresas, actualízalos para que también creen la relación:

```javascript
// Después de crear una empresa:
const { data: company, error } = await supabase
  .from('companies')
  .insert({ name: 'Nueva Empresa' })
  .single();

// Crear la relación con el usuario actual
if (company) {
  await supabase.rpc('assign_company_to_current_user', {
    p_company_id: company.id,
    p_role: 'admin'
  });
}
```

## 🎯 RESUMEN

**El problema**: Las políticas RLS esperaban `companies.user_id` pero esa columna no existe.

**La solución**: Crear una tabla de relación `company_users` que conecte `companies` y `auth.users`, y actualizar todas las políticas para usar esta relación.

**Resultado**: El error `column companies.user_id does not exist` desaparecerá completamente.

---

## 📋 ARCHIVOS CREADOS

- ✅ `database/fix_companies_user_id.sql` - Script SQL completo
- ✅ `SOLUCION_INMEDIATA_USER_ID.md` - Este archivo de instrucciones

---

## ⚡ ACCIÓN INMEDIATA

**Ejecuta el SQL en el Supabase Dashboard AHORA** y el error se resolverá inmediatamente.