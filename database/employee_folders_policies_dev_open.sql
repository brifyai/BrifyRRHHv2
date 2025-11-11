-- ===========================================================
-- DEV-ONLY: Open RLS policies (allow any role) to unblock sync
-- Use this in development if you see "violates row-level security policy"
-- IMPORTANT: This grants full CRUD to PUBLIC (anon + authenticated).
-- Revert to tighter policies in production.
-- ===========================================================

-- Ensure schema usage
grant usage on schema public to anon, authenticated;

-- Helper: drop all policies on a table
-- pg_policies columns: schemaname, tablename, policyname

-- =========================
-- employee_folders
-- =========================
alter table if exists public.employee_folders enable row level security;

grant select, insert, update, delete on table public.employee_folders to anon, authenticated;

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

create policy ef_select_public
  on public.employee_folders
  for select
  to public
  using (true);

create policy ef_insert_public
  on public.employee_folders
  for insert
  to public
  with check (true);

create policy ef_update_public
  on public.employee_folders
  for update
  to public
  using (true)
  with check (true);

create policy ef_delete_public
  on public.employee_folders
  for delete
  to public
  using (true);

-- =========================
-- employee_documents
-- =========================
alter table if exists public.employee_documents enable row level security;

grant select, insert, update, delete on table public.employee_documents to anon, authenticated;

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

create policy ed_select_public
  on public.employee_documents
  for select
  to public
  using (true);

create policy ed_insert_public
  on public.employee_documents
  for insert
  to public
  with check (true);

create policy ed_update_public
  on public.employee_documents
  for update
  to public
  using (true)
  with check (true);

create policy ed_delete_public
  on public.employee_documents
  for delete
  to public
  using (true);

-- =========================
-- employee_faqs
-- =========================
alter table if exists public.employee_faqs enable row level security;

grant select, insert, update, delete on table public.employee_faqs to anon, authenticated;

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

create policy efaq_select_public
  on public.employee_faqs
  for select
  to public
  using (true);

create policy efaq_insert_public
  on public.employee_faqs
  for insert
  to public
  with check (true);

create policy efaq_update_public
  on public.employee_faqs
  for update
  to public
  using (true)
  with check (true);

create policy efaq_delete_public
  on public.employee_faqs
  for delete
  to public
  using (true);

-- =========================
-- employee_conversations
-- =========================
alter table if exists public.employee_conversations enable row level security;

grant select, insert, update, delete on table public.employee_conversations to anon, authenticated;

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

create policy ec_select_public
  on public.employee_conversations
  for select
  to public
  using (true);

create policy ec_insert_public
  on public.employee_conversations
  for insert
  to public
  with check (true);

create policy ec_update_public
  on public.employee_conversations
  for update
  to public
  using (true)
  with check (true);

create policy ec_delete_public
  on public.employee_conversations
  for delete
  to public
  using (true);

-- =========================
-- employee_notification_settings
-- =========================
alter table if exists public.employee_notification_settings enable row level security;

grant select, insert, update, delete on table public.employee_notification_settings to anon, authenticated;

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

create policy ens_select_public
  on public.employee_notification_settings
  for select
  to public
  using (true);

create policy ens_insert_public
  on public.employee_notification_settings
  for insert
  to public
  with check (true);

create policy ens_update_public
  on public.employee_notification_settings
  for update
  to public
  using (true)
  with check (true);

create policy ens_delete_public
  on public.employee_notification_settings
  for delete
  to public
  using (true);

-- ===========================================================
-- Revert plan:
--   - After verifying sync works, switch to the stricter file:
--     database/employee_folders_policies.sql (authenticated-only)
--   - Then remove these DEV policies.
-- ===========================================================