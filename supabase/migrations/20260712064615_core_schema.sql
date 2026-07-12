-- ============================================
-- ASSETFLOW SCHEMA — CORE TABLES
-- ============================================

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  head_employee_id uuid,
  parent_dept_id uuid references departments(id),
  status text not null default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  department_id uuid references departments(id),
  role text not null default 'Employee' check (role in ('Admin','AssetManager','DeptHead','Employee')),
  status text not null default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz default now()
);

alter table departments
  add constraint fk_head_employee foreign key (head_employee_id) references employees(id);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  extra_fields jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  tag text unique,
  name text not null,
  category_id uuid references categories(id),
  serial_number text,
  acquisition_date date,
  acquisition_cost numeric,
  condition text,
  location text,
  is_bookable boolean not null default false,
  status text not null default 'Available'
    check (status in ('Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed')),
  photo_url text,
  created_at timestamptz default now()
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id),
  employee_id uuid references employees(id),
  department_id uuid references departments(id),
  allocated_on timestamptz not null default now(),
  expected_return_date date,
  returned_on timestamptz,
  status text not null default 'Active' check (status in ('Active','Returned','TransferPending')),
  condition_notes_on_return text,
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id),
  booked_by_employee_id uuid not null references employees(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'Upcoming' check (status in ('Upcoming','Ongoing','Completed','Cancelled')),
  created_at timestamptz default now(),
  check (end_time > start_time)
);
