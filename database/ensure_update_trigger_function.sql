-- ===========================================================
-- Ensure prerequisites for employee_folders_setup.sql
-- - pgcrypto extension (for gen_random_uuid)
-- - update_updated_at_column() trigger function
-- Safe, idempotent and compatible with Supabase SQL editor
-- ===========================================================

-- Enable pgcrypto (needed for gen_random_uuid)
create extension if not exists pgcrypto;

-- Create/replace trigger function (idempotent)
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;