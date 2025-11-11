-- ===========================================================
-- Ensure prerequisites for employee_folders_setup.sql
-- - pgcrypto extension (for gen_random_uuid)
-- - update_updated_at_column() trigger function
-- Run this first if your setup SQL complained about missing function.
-- ===========================================================

-- Enable pgcrypto (needed for gen_random_uuid)
create extension if not exists pgcrypto;

-- Create update_updated_at_column() trigger function if missing
do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'update_updated_at_column'
      and n.nspname = 'public'
  ) then
    execute $fn$
      create or replace function public.update_updated_at_column()
      returns trigger
      language plpgsql
      as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$;
    $fn$;
  end if;
end
$$ language plpgsql;