-- Agregar columnas faltantes a la tabla users para soportar empleados
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