-- ========================================
-- CREACIÓN DE TABLAS CORE PARA DASHBOARD (VERSIÓN CORREGIDA)
-- Maneja tablas existentes y estructura compatible
-- ========================================

-- ========================================
-- 1. VERIFICAR Y ACTUALIZAR TABLA COMPANIES
-- ========================================

-- Primero verificar si la tabla companies existe y su estructura
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            industry TEXT,
            location TEXT,
            description TEXT,
            website TEXT,
            phone TEXT,
            email TEXT,
            logo_url TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabla companies creada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabla companies ya existe';
        
        -- Verificar si tiene las columnas necesarias
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'location') THEN
            ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
            RAISE NOTICE '✅ Columna location agregada a companies';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'industry') THEN
            ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
            RAISE NOTICE '✅ Columna industry agregada a companies';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'status') THEN
            ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
            RAISE NOTICE '✅ Columna status agregada a companies';
        END IF;
    END IF;
END $$;

-- ========================================
-- 2. TABLA DE EMPLEADOS (EMPLOYEES)
-- ========================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    department TEXT,
    level TEXT,
    region TEXT,
    work_mode TEXT,
    contract_type TEXT,
    start_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_employee_email UNIQUE (email)
);

-- ========================================
-- 3. TABLA DE LOGS DE COMUNICACIÓN
-- ========================================
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('sms', 'email', 'whatsapp', 'telegram')),
    channel_id TEXT,
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'delivered', 'read', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. TABLA DE INSIGHTS DE EMPRESA
-- ========================================
CREATE TABLE IF NOT EXISTS company_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('front', 'back')),
    insight_category TEXT NOT NULL CHECK (insight_category IN ('positive', 'negative', 'warning', 'info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_source TEXT DEFAULT 'manual',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. TABLA DE MÉTRICAS DE EMPRESA
-- ========================================
CREATE TABLE IF NOT EXISTS company_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    company_name TEXT NOT NULL,
    employee_count INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    sent_messages INTEGER DEFAULT 0,
    read_messages INTEGER DEFAULT 0,
    scheduled_messages INTEGER DEFAULT 0,
    draft_messages INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    delivery_rate DECIMAL(5,2) DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    most_active_hour INTEGER DEFAULT 9 CHECK (most_active_hour >= 0 AND most_active_hour <= 23),
    most_active_day INTEGER DEFAULT 1 CHECK (most_active_day >= 0 AND most_active_day <= 6),
    preferred_channel TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_name UNIQUE (company_name)
);

-- ========================================
-- 6. FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ========================================
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY 
        ARRAY['companies', 'employees', 'communication_logs', 'company_insights', 'company_metrics']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- ========================================
-- 8. HABILITAR RLS (Row Level Security)
-- ========================================
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY 
        ARRAY['companies', 'employees', 'communication_logs', 'company_insights', 'company_metrics']
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'No se pudo habilitar RLS para %: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ========================================
-- 9. POLÍTICAS RLS BÁSICAS
-- ========================================

-- Políticas para companies (lectura pública, escritura solo para usuarios autenticados)
DO $$
BEGIN
    DROP POLICY IF EXISTS companies_select_public ON companies;
    CREATE POLICY companies_select_public ON companies FOR SELECT USING (true);

    DROP POLICY IF EXISTS companies_insert_authenticated ON companies;
    CREATE POLICY companies_insert_authenticated ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS companies_update_authenticated ON companies;
    CREATE POLICY companies_update_authenticated ON companies FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creando políticas para companies: %', SQLERRM;
END $$;

-- Políticas para las otras tablas
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ['employees', 'communication_logs', 'company_insights', 'company_metrics']
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I_select_public ON %I', table_name, table_name);
            EXECUTE format('CREATE POLICY %I_select_public ON %I FOR SELECT USING (true)', table_name, table_name);

            EXECUTE format('DROP POLICY IF EXISTS %I_insert_authenticated ON %I', table_name, table_name);
            EXECUTE format('CREATE POLICY %I_insert_authenticated ON %I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', table_name, table_name);

            EXECUTE format('DROP POLICY IF EXISTS %I_update_authenticated ON %I', table_name, table_name);
            EXECUTE format('CREATE POLICY %I_update_authenticated ON %I FOR UPDATE USING (auth.role() = ''authenticated'')', table_name, table_name);
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error creando políticas para %: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ========================================
-- 10. DATOS DE EJEMPLO (SOLO SI NO EXISTEN)
-- ========================================

-- Insertar empresas de ejemplo solo si no existen
INSERT INTO companies (name, industry, location, status) VALUES
('Aguas Andinas', 'Servicios Públicos', 'Santiago', 'active'),
('Banco de Chile', 'Banca', 'Santiago', 'active'),
('Cencosud', 'Retail', 'Santiago', 'active'),
('Codelco', 'Minería', 'Santiago', 'active'),
('Enel', 'Energía', 'Santiago', 'active'),
('Entel', 'Telecomunicaciones', 'Santiago', 'active'),
('Falabella', 'Retail', 'Santiago', 'active'),
('Latam Airlines', 'Aviación', 'Santiago', 'active')
ON CONFLICT DO NOTHING;

-- ========================================
-- 11. CONFIRMACIÓN DE CREACIÓN
-- ========================================

SELECT '✅ Tablas core creadas/actualizadas exitosamente!' as status;

-- Mostrar estructura actual de las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('companies', 'employees', 'communication_logs', 'company_insights', 'company_metrics')
ORDER BY table_name, ordinal_position;

-- Contar registros actuales
SELECT 
    'companies' as table_name,
    COUNT(*) as record_count
FROM companies

UNION ALL

SELECT 
    'employees' as table_name,
    COUNT(*) as record_count
FROM employees

UNION ALL

SELECT 
    'communication_logs' as table_name,
    COUNT(*) as record_count
FROM communication_logs

UNION ALL

SELECT 
    'company_insights' as table_name,
    COUNT(*) as record_count
FROM company_insights

UNION ALL

SELECT 
    'company_metrics' as table_name,
    COUNT(*) as record_count
FROM company_metrics;