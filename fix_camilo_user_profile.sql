-- Script para crear el perfil del usuario Camilo Alegria Barra
-- Este script debe ejecutarse con permisos de administrador en Supabase

-- Deshabilitar RLS temporalmente para poder insertar
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insertar el perfil del usuario con los datos correctos
INSERT INTO users (
    id,
    email,
    full_name,
    telegram_id,
    is_active,
    current_plan_id,
    plan_expiration,
    used_storage_bytes,
    registered_via,
    admin,
    onboarding_status,
    registro_previo,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid, -- ID temporal, será reemplazado por el ID real del auth
    'camiloalegriabarra@gmail.com',
    'Camilo Alegria Barra',
    NULL,
    true,
    NULL,
    NULL,
    0,
    'web',
    false,
    'completed',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active,
    onboarding_status = EXCLUDED.onboarding_status,
    registro_previo = EXCLUDED.registro_previo,
    updated_at = NOW();

-- Volver a habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verificar que el usuario fue creado
SELECT * FROM users WHERE email = 'camiloalegriabarra@gmail.com';

-- Si necesitas actualizar el ID para que coincida con auth.users:
-- UPDATE users SET id = 'auth_user_id_real' WHERE email = 'camiloalegriabarra@gmail.com';