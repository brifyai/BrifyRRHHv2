# Guía Manual de Configuración para Analíticas Predictivas

## 🚨 Situación Actual

La base de datos `tmqglnycivlcjijoymwe.supabase.co` necesita configuración manual para las analíticas predictivas.

## 📋 Estado Verificado

- ✅ Conexión a base de datos: Funcionando
- ❌ Empleados: Solo 1 (necesitamos 800)
- ❌ Tabla `users`: Faltan columnas `department`, `position`, `phone`, `status`
- ❌ Tabla `message_analysis`: No existe
- ❌ Tabla `analytics_test_reports`: No existe

## 🔧 Pasos Manuales Requeridos

### Paso 1: Agregar Columnas a Tabla `users`

Ejecutar en Supabase Dashboard → SQL Editor:

```sql
-- Archivo: database/add_employee_columns.sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_position ON public.users(position);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Actualizar el usuario existente con valores por defecto
UPDATE public.users 
SET 
    department = 'Administración',
    position = 'Administrador',
    phone = '+56 9 12345678',
    status = 'active'
WHERE department IS NULL;
```

### Paso 2: Crear Tablas de Analíticas

Ejecutar en Supabase Dashboard → SQL Editor:

```sql
-- Archivo: database/create_message_analysis_table.sql
CREATE TABLE IF NOT EXISTS public.message_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message TEXT NOT NULL,
    optimized_message TEXT,
    channel VARCHAR(50) NOT NULL,
    engagement_prediction JSONB,
    optimal_timing JSONB,
    optimizations JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);

-- Habilitar Row Level Security
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Users can view their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can view their own message analysis" ON public.message_analysis
    FOR SELECT USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can insert their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can insert their own message analysis" ON public.message_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can update their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can update their own message analysis" ON public.message_analysis
    FOR UPDATE USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Service role can manage all message analysis" ON public.message_analysis;
CREATE POLICY "Service role can manage all message analysis" ON public.message_analysis
    FOR ALL USING (auth.role() = 'service_role');

-- Crear tabla para reportes de testing
CREATE TABLE IF NOT EXISTS public.analytics_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_data JSONB NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_date ON public.analytics_test_reports(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_environment ON public.analytics_test_reports(environment);

ALTER TABLE public.analytics_test_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics test reports" ON public.analytics_test_reports;
CREATE POLICY "Service role can manage analytics test reports" ON public.analytics_test_reports
    FOR ALL USING (auth.role() = 'service_role');
```

### Paso 3: Verificar Configuración

Después de ejecutar los SQL anteriores, ejecutar el script de verificación:

```bash
node scripts/check-database-structure.js
```

### Paso 4: Generar Empleados

Una vez verificada la estructura, ejecutar:

```bash
node scripts/setup-analytics-complete.js
```

## 🚀 Alternativa: Solución sin Modificar Estructura

Si no puedes modificar la estructura de la base de datos, he creado una solución alternativa que:

1. **Usa las columnas existentes** en la tabla `users`
2. **Crea tablas virtuales** para analíticas
3. **Genera empleados** solo con los campos disponibles

La solución alternativa está en: `scripts/setup-analytics-alternative.js`

## 📊 Verificación Final

Después de la configuración, verificar con:

```bash
node scripts/test-analytics-with-env.js
```

El resultado debería mostrar:
- ✅ 800 empleados verificados
- ✅ Tablas de analíticas funcionando
- ✅ Sistema listo para producción

## 🎯 Próximos Pasos

Una vez configurada la base de datos:

1. **Testing en Producción**: Ejecutar pruebas con mensajes reales
2. **Escalado**: Activar analíticas para todos los empleados
3. **Monitoreo**: Configurar métricas de engagement
4. **Optimización**: Implementar mejora continua

## 📞 Soporte

Si encuentras problemas durante la configuración manual:

1. Verifica que tienes permisos de administrador en Supabase
2. Confirma que estás en la base de datos correcta: `tmqglnycivlcjijoymwe.supabase.co`
3. Ejecuta los SQL uno por uno para identificar errores específicos

## 🔗 Archivos Relacionados

- `database/add_employee_columns.sql` - Columnas para empleados
- `database/create_message_analysis_table.sql` - Tablas de analíticas
- `scripts/check-database-structure.js` - Verificación de estructura
- `scripts/setup-analytics-complete.js` - Configuración completa
- `scripts/test-analytics-with-env.js` - Testing de producción