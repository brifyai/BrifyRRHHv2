-- ===========================================================
-- RLS policies for Employee Folders subsystem (Supabase)
-- Purpose: allow authenticated users to read/write the tables
-- This script is idempotent: it drops pre-existing policies
-- and re-creates permissive CRUD policies for role "authenticated".
-- Apply in Supabase SQL Editor: paste and Run.
-- ===========================================================

-- Ensure schema usage for authenticated role
grant usage on schema public to authenticated;

-- Helper: drop all policies on a table
-- Usage: call the DO block per table (below)
-- Note: pg_policies columns are schemaname, tablename, policyname
-- ===========================================================

-- =========================
-- employee_folders
-- =========================
alter table if exists public.employee_folders enable row level security;

grant select, insert, update, delete on table public.employee_folders to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'employee_folders'
  loop
    execute format('drop policy if exists %I on public.employee_folders', pol.policyname);
  end loop;
end
$$ language plpgsql;

create policy ef_select_auth
  on public.employee_folders
  for select
  to authenticated
  using (true);

create policy ef_insert_auth
  on public.employee_folders
  for insert
  to authenticated
  with check (true);

create policy ef_update_auth
  on public.employee_folders
  for update
  to authenticated
  using (true)
  with check (true);

create policy ef_delete_auth
  on public.employee_folders
  for delete
  to authenticated
  using (true);

-- =========================
-- employee_documents
-- =========================
alter table if exists public.employee_documents enable row level security;

grant select, insert, update, delete on table public.employee_documents to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'employee_documents'
  loop
    execute format('drop policy if exists %I on public.employee_documents', pol.policyname);
  end loop;
end
$$ language plpgsql;

create policy ed_select_auth
  on public.employee_documents
  for select
  to authenticated
  using (true);

create policy ed_insert_auth
  on public.employee_documents
  for insert
  to authenticated
  with check (true);

create policy ed_update_auth
  on public.employee_documents
  for update
  to authenticated
  using (true)
  with check (true);

create policy ed_delete_auth
  on public.employee_documents
  for delete
  to authenticated
  using (true);

-- =========================
-- employee_faqs
-- =========================
alter table if exists public.employee_faqs enable row level security;

grant select, insert, update, delete on table public.employee_faqs to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'employee_faqs'
  loop
    execute format('drop policy if exists %I on public.employee_faqs', pol.policyname);
  end loop;
end
$$ language plpgsql;

create policy efaq_select_auth
  on public.employee_faqs
  for select
  to authenticated
  using (true);

create policy efaq_insert_auth
  on public.employee_faqs
  for insert
  to authenticated
  with check (true);

create policy efaq_update_auth
  on public.employee_faqs
  for update
  to authenticated
  using (true)
  with check (true);

create policy efaq_delete_auth
  on public.employee_faqs
  for delete
  to authenticated
  using (true);

-- =========================
-- employee_conversations
-- =========================
alter table if exists public.employee_conversations enable row level security;

grant select, insert, update, delete on table public.employee_conversations to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'employee_conversations'
  loop
    execute format('drop policy if exists %I on public.employee_conversations', pol.policyname);
  end loop;
end
$$ language plpgsql;

create policy ec_select_auth
  on public.employee_conversations
  for select
  to authenticated
  using (true);

create policy ec_insert_auth
  on public.employee_conversations
  for insert
  to authenticated
  with check (true);

create policy ec_update_auth
  on public.employee_conversations
  for update
  to authenticated
  using (true)
  with check (true);

create policy ec_delete_auth
  on public.employee_conversations
  for delete
  to authenticated
  using (true);

-- =========================
-- employee_notification_settings
-- =========================
alter table if exists public.employee_notification_settings enable row level security;

grant select, insert, update, delete on table public.employee_notification_settings to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'employee_notification_settings'
  loop
    execute format('drop policy if exists %I on public.employee_notification_settings', pol.policyname);
  end loop;
end
$$ language plpgsql;

create policy ens_select_auth
  on public.employee_notification_settings
  for select
  to authenticated
  using (true);

create policy ens_insert_auth
  on public.employee_notification_settings
  for insert
  to authenticated
  with check (true);

create policy ens_update_auth
  on public.employee_notification_settings
  for update
  to authenticated
  using (true)
  with check (true);

create policy ens_delete_auth
  on public.employee_notification_settings
  for delete
  to authenticated
  using (true);

-- ===========================================================
-- Notes:
-- - These policies grant full CRUD to authenticated users.
-- - For production multi-tenant scenarios, scope by auth.uid()
--   and per-company ownership. This permissive set is intended
--   to unblock sync and can be hardened later.
-- ===========================================================