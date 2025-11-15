-- =================================================================
-- LIMPIEZA DE EMPRESAS DUPLICADAS EN SUPABASE
-- =================================================================

-- Paso 1: Identificar duplicados por nombre
SELECT 
    name,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as duplicate_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM companies 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name;

-- Paso 2: Crear tabla temporal con los registros más antiguos (los que queremos mantener)
CREATE TEMPORARY TABLE companies_to_keep AS
SELECT DISTINCT ON (name) 
    id,
    name,
    industry,
    location,
    status,
    created_at,
    updated_at
FROM companies 
ORDER BY name, created_at ASC;

-- Paso 3: Eliminar todos los duplicados
DELETE FROM companies 
WHERE id NOT IN (SELECT id FROM companies_to_keep);

-- Paso 4: Verificar resultado después de limpieza
SELECT 
    name,
    COUNT(*) as count
FROM companies 
GROUP BY name 
ORDER BY name;

-- Paso 5: Mostrar empresas únicas finales
SELECT COUNT(*) as total_unique_companies FROM companies;

-- Paso 6: Limpiar tabla temporal
DROP TABLE IF EXISTS companies_to_keep;

-- =================================================================
-- VERIFICACIÓN ADICIONAL
-- =================================================================

-- Verificar que no queden duplicados
SELECT 
    'Duplicates Remaining' as status,
    COUNT(*) as count
FROM (
    SELECT name 
    FROM companies 
    GROUP BY name 
    HAVING COUNT(*) > 1
) as duplicates;

-- Mostrar lista final de empresas
SELECT 
    id,
    name,
    industry,
    location,
    status,
    created_at
FROM companies 
ORDER BY name;

-- =================================================================
-- NOTAS IMPORTANTES
-- =================================================================

-- 1. Este script mantiene el registro más antiguo de cada empresa (basado en created_at)
-- 2. Si necesitas mantener el más reciente, cambia 'ASC' por 'DESC' en el Paso 2
-- 3. Si necesitas mantener basado en otro criterio, ajusta el ORDER BY en el Paso 2
-- 4. Siempre haz un backup antes de ejecutar scripts de limpieza
-- 5. Ejecuta este script en el editor SQL de Supabase