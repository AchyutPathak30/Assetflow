-- ============================================
-- AUTO-CREATE EMPLOYEE ROW ON SIGNUP
-- ============================================
-- Whenever a new user signs up via Supabase Auth, automatically create
-- a matching employees row with role = 'Employee'. The frontend must
-- never be able to set role directly — this trigger is the only path
-- that creates the initial row.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.employees (auth_user_id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Employee',
    'Active'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
alter table departments enable row level security;
alter table employees enable row level security;
alter table categories enable row level security;
alter table assets enable row level security;
alter table allocations enable row level security;
alter table bookings enable row level security;

-- ============================================
-- HELPER: get current user's employee row info
-- ============================================
create or replace function public.current_employee_id()
returns uuid
language sql
security definer
stable
as $$
  select id from public.employees where auth_user_id = auth.uid();
$$;

create or replace function public.current_employee_role()
returns text
language sql
security definer
stable
as $$
  select role from public.employees where auth_user_id = auth.uid();
$$;

-- ============================================
-- POLICIES: employees
-- ============================================
create policy "employees_select_all" on employees
  for select to authenticated using (true);

create policy "employees_update_own_non_role" on employees
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid() and role = (select role from employees e where e.id = employees.id));

create policy "employees_admin_full_update" on employees
  for update to authenticated
  using (public.current_employee_role() = 'Admin')
  with check (true);

-- ============================================
-- POLICIES: departments
-- ============================================
create policy "departments_select_all" on departments
  for select to authenticated using (true);

create policy "departments_admin_write" on departments
  for insert to authenticated with check (public.current_employee_role() = 'Admin');

create policy "departments_admin_update" on departments
  for update to authenticated using (public.current_employee_role() = 'Admin');

-- ============================================
-- POLICIES: categories
-- ============================================
create policy "categories_select_all" on categories
  for select to authenticated using (true);

create policy "categories_admin_write" on categories
  for insert to authenticated with check (public.current_employee_role() = 'Admin');

create policy "categories_admin_update" on categories
  for update to authenticated using (public.current_employee_role() = 'Admin');

-- ============================================
-- POLICIES: assets
-- ============================================
create policy "assets_select_all" on assets
  for select to authenticated using (true);

create policy "assets_manager_write" on assets
  for insert to authenticated
  with check (public.current_employee_role() in ('Admin','AssetManager'));

create policy "assets_manager_update" on assets
  for update to authenticated
  using (public.current_employee_role() in ('Admin','AssetManager'));

-- ============================================
-- POLICIES: allocations (simplified for hackathon speed)
-- ============================================
create policy "allocations_select_all" on allocations
  for select to authenticated using (true);

create policy "allocations_authenticated_insert" on allocations
  for insert to authenticated with check (true);

create policy "allocations_authenticated_update" on allocations
  for update to authenticated using (true);

-- ============================================
-- POLICIES: bookings (simplified for hackathon speed)
-- ============================================
create policy "bookings_select_all" on bookings
  for select to authenticated using (true);

create policy "bookings_authenticated_insert" on bookings
  for insert to authenticated with check (true);

create policy "bookings_authenticated_update" on bookings
  for update to authenticated using (true);
