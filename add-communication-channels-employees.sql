-- ========================================
-- AGREGAR CAMPOS DE COMUNICACIÓN SEPARADOS A LA TABLA EMPLOYEES
-- ========================================
-- Este script agrega campos separados para cada canal de comunicación
-- permitiendo que un número tenga WhatsApp pero no SMS, o viceversa

-- ========================================
-- PASO 1: AGREGAR NUEVOS CAMPOS DE COMUNICACIÓN
-- ========================================

-- Agregar campos para cada canal de comunicación
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100),
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mailing_list BOOLEAN DEFAULT false;

-- ========================================
-- PASO 2: MIGRAR DATOS EXISTENTES
-- ========================================

-- Migrar datos existentes: asumir que el phone actual tiene WhatsApp si no está vacío
UPDATE employees 
SET 
    whatsapp_phone = phone,
    whatsapp_enabled = CASE WHEN phone IS NOT NULL AND phone != '' THEN true ELSE false END,
    sms_phone = phone,
    sms_enabled = CASE WHEN phone IS NOT NULL AND phone != '' THEN true ELSE false END,
    email_enabled = CASE WHEN email IS NOT NULL AND email != '' THEN true ELSE false END
WHERE phone IS NOT NULL OR email IS NOT NULL;

-- ========================================
-- PASO 3: CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ========================================

-- Índices para los nuevos campos de comunicación
CREATE INDEX IF NOT EXISTS idx_employees_whatsapp_enabled ON employees(whatsapp_enabled) WHERE whatsapp_enabled = true;
CREATE INDEX IF NOT EXISTS idx_employees_telegram_enabled ON employees(telegram_enabled) WHERE telegram_enabled = true;
CREATE INDEX IF NOT EXISTS idx_employees_sms_enabled ON employees(sms_enabled) WHERE sms_enabled = true;
CREATE INDEX IF NOT EXISTS idx_employees_email_enabled ON employees(email_enabled) WHERE email_enabled = true;

-- ========================================
-- PASO 4: VERIFICACIÓN
-- ========================================

-- Mostrar estadísticas de los canales de comunicación
DO $$
DECLARE
    total_employees INTEGER;
    whatsapp_count INTEGER;
    telegram_count INTEGER;
    sms_count INTEGER;
    email_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_employees FROM employees;
    SELECT COUNT(*) INTO whatsapp_count FROM employees WHERE whatsapp_enabled = true;
    SELECT COUNT(*) INTO telegram_count FROM employees WHERE telegram_enabled = true;
    SELECT COUNT(*) INTO sms_count FROM employees WHERE sms_enabled = true;
    SELECT COUNT(*) INTO email_count FROM employees WHERE email_enabled = true;
    
    RAISE NOTICE '=== CAMPOS DE COMUNICACIÓN AGREGADOS ===';
    RAISE NOTICE 'Total empleados: %', total_employees;
    RAISE NOTICE 'WhatsApp habilitado: % (%)', whatsapp_count, ROUND((whatsapp_count::FLOAT / total_employees::FLOAT) * 100);
    RAISE NOTICE 'Telegram habilitado: % (%)', telegram_count, ROUND((telegram_count::FLOAT / total_employees::FLOAT) * 100);
    RAISE NOTICE 'SMS habilitado: % (%)', sms_count, ROUND((sms_count::FLOAT / total_employees::FLOAT) * 100);
    RAISE NOTICE 'Email habilitado: % (%)', email_count, ROUND((email_count::FLOAT / total_employees::FLOAT) * 100);
    RAISE NOTICE '==========================================';
END $$;

-- ========================================
-- COMENTARIOS ADICIONALES
-- ========================================

-- Los campos agregados permiten:
-- - whatsapp_enabled: Indica si el empleado puede recibir mensajes por WhatsApp
-- - whatsapp_phone: Número específico para WhatsApp (puede ser diferente al phone principal)
-- - telegram_enabled: Indica si el empleado puede recibir mensajes por Telegram
-- - telegram_phone: Néfono para Telegram (opcional, algunos usan username)
-- - telegram_username: Usuario de Telegram (alternativa al número)
-- - sms_enabled: Indica si el empleado puede recibir SMS
-- - sms_phone: Número específico para SMS (puede ser diferente al phone principal)
-- - email_enabled: Indica si el empleado puede recibir emails
-- - mailing_list: Indica si el empleado está suscrito a listas de correo

-- Esto permite flexibilidad total para configurar cada canal de comunicación
-- de manera independiente, como solicitó el usuario.