-- ============================================
-- UPDATE AUTH NEW USER TRIGGER AND ENFORCE ROLE LIMITS
-- ============================================

-- 1. Update handle_new_user to read role and department name from signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dept_id uuid;
  role_val text;
begin
  -- Resolve department name to ID
  if new.raw_user_meta_data->>'department' is not null then
    select id into dept_id from public.departments 
    where name = (new.raw_user_meta_data->>'department') 
    limit 1;
  end if;

  role_val := coalesce(new.raw_user_meta_data->>'role', 'Employee');

  insert into public.employees (auth_user_id, name, email, role, department_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    role_val,
    dept_id,
    'Active'
  );
  return new;
end;
$$;

-- 2. Add validation function to check unique role restrictions
create or replace function public.check_employee_role_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admin: Limit to 1 globally
  if new.role = 'Admin' then
    if exists (
      select 1 from public.employees 
      where role = 'Admin' and id <> new.id
    ) then
      raise exception 'An Administrator already exists. Only one Admin is allowed.';
    end if;
  end if;

  -- Department Head: Limit to 1 per department
  if new.role = 'DeptHead' and new.department_id is not null then
    if exists (
      select 1 from public.employees 
      where role = 'DeptHead' and department_id = new.department_id and id <> new.id
    ) then
      raise exception 'This department already has an assigned Head.';
    end if;
  end if;

  -- Asset Manager: Limit to 1 per department
  if new.role = 'AssetManager' and new.department_id is not null then
    if exists (
      select 1 from public.employees 
      where role = 'AssetManager' and department_id = new.department_id and id <> new.id
    ) then
      raise exception 'This department already has an assigned Asset Manager.';
    end if;
  end if;

  return new;
end;
$$;

-- 3. Bind the validation trigger to the employees table
drop trigger if exists trigger_check_employee_role_limits on public.employees;
create trigger trigger_check_employee_role_limits
  before insert or update on public.employees
  for each row execute function public.check_employee_role_limits();
