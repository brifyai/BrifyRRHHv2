# 🚀 Instrucciones para Ejecutar la Migración SQL

## ❌ Error Común
NO ejecutes: `migration_fallback_config` (esto es el nombre del archivo, no un comando SQL)

## ✅ Forma Correcta de Ejecutar la Migración

### Opción 1: Desde el Panel de Supabase (Recomendado)

1. **Ve al panel de Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**: `tmqglnycivlcjijoymwe`
3. **Ve a SQL Editor** (en el menú lateral)
4. **Copia y pega este SQL completo**:

```sql
-- Agregar columna fallback_config a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS fallback_config JSONB DEFAULT '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}';

-- Actualizar empresas existentes con la configuración por defecto
UPDATE companies 
SET fallback_config = '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}' 
WHERE fallback_config IS NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_fallback_config ON companies USING GIN (fallback_config);

-- Comentario sobre la columna
COMMENT ON COLUMN companies.fallback_config IS 'Configuración del orden de fallback para canales de comunicación';
```

5. **Haz clic en "Run"** para ejecutar el SQL

### Opción 2: Usando psql (si tienes acceso directo)

```bash
psql -h tmqglnycivlcjijoymwe.supabase.co -U postgres -d postgres -f migration_fallback_config.sql
```

### Opción 3: Usando el CLI de Supabase

```bash
supabase db push
```

## 🧪 Verificar que la Migración Funcionó

Después de ejecutar el SQL, verifica con:

```bash
node execute-fallback-migration.js
```

Deberías ver un mensaje como:
```
✅ La columna fallback_config ya existe en la tabla companies
🎯 ¡Migración completada exitosamente!
```

## 📋 Qué hace esta migración:

1. **Agrega la columna** `fallback_config` tipo JSONB a la tabla `companies`
2. **Establece valor por defecto**: `{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}`
3. **Actualiza empresas existentes** con la configuración por defecto
4. **Crea índice GIN** para mejor rendimiento en consultas JSONB
5. **Agrega comentario** descriptivo a la columna

## 🎯 Después de la Migración

Una vez ejecutada la migración:
1. ✅ La funcionalidad de orden de fallback estará activa
2. ✅ Podrás configurar el orden personalizado por empresa
3. ✅ El sistema usará el orden personalizado en envíos con fallback
4. ✅ La interfaz de empresas mostrará los controles de reordenamiento

## 🔍 Si tienes problemas

Si el SQL falla, verifica:
- Que tienes permisos de administrador en el proyecto Supabase
- Que estás conectado al proyecto correcto: `tmqglnycivlcjijoymwe`
- Que no hay conexiones activas bloqueando la tabla `companies`

## 📞 Soporte

Si necesitas ayuda adicional:
1. Ejecuta el script de verificación: `node execute-fallback-migration.js`
2. Revisa el resultado para ver el estado exacto
3. Contacta si hay errores específicos del SQL