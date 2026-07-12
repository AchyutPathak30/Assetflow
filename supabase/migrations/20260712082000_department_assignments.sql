-- =========================================================================
-- CREATE PUBLIC READ FUNCTION FOR DEPARTMENT ASSIGNMENTS
-- =========================================================================
-- This function allows the login/signup screen to fetch the current
-- department heads and asset managers anonymously to help users see
-- occupied and vacant roles.

create or replace function public.get_department_assignments()
returns table (
  department_name text,
  head_name text,
  manager_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    d.name::text as department_name,
    coalesce((select e.name::text from public.employees e where e.id = d.head_employee_id limit 1), 'Vacant') as head_name,
    coalesce((select e.name::text from public.employees e where e.department_id = d.id and e.role = 'AssetManager' limit 1), 'Vacant') as manager_name
  from public.departments d
  order by d.name;
end;
$$;
