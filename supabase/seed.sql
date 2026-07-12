-- =========================================================================
-- ASSETFLOW DATABASE SEED SCRIPT
-- =========================================================================
-- This script inserts seed data into the database:
-- 1. Creates 5 departments.
-- 2. Inserts 15 users into auth.users (which automatically triggers employees creation).
-- 3. Sets department head references on the departments table.
-- 4. Creates asset categories and assets.
-- 5. Seed resource bookings and maintenance requests.
--
-- DEFAULT PASSWORD FOR ALL SEED USER ACCOUNTS: password123
-- =========================================================================

-- Enable pgcrypto for password hashing if not already enabled
create extension if not exists pgcrypto;

-- Clear any existing seed records to ensure clean insert (optional, use with caution)
truncate table public.bookings cascade;
truncate table public.allocations cascade;
truncate table public.assets cascade;
truncate table public.categories cascade;
truncate table public.employees cascade;
truncate table public.departments cascade;
delete from auth.users where email in (
  'admin@gmail.com',
  'ithead@company.com',
  'itmanager@company.com',
  'itemp1@company.com',
  'itemp2@company.com',
  'hrhead@company.com',
  'hrmanager@company.com',
  'hremp1@company.com',
  'opshead@company.com',
  'opsmanager@company.com',
  'opsemp1@company.com',
  'mkthead@company.com',
  'mktemp1@company.com',
  'finhead@company.com',
  'finemp1@company.com'
);

-- ── 1. INSERT DEPARTMENTS (HEAD ID IS NULL INITIALLY) ─────────────────────
insert into public.departments (id, name, head_employee_id, parent_dept_id, status) values
  ('00000000-0000-0000-0000-000000000001', 'Information Technology', null, null, 'Active'),
  ('00000000-0000-0000-0000-000000000002', 'Human Resources', null, null, 'Active'),
  ('00000000-0000-0000-0000-000000000003', 'Operations', null, null, 'Active'),
  ('00000000-0000-0000-0000-000000000004', 'Marketing', null, null, 'Active'),
  ('00000000-0000-0000-0000-000000000005', 'Finance', null, null, 'Active');

-- ── 2. INSERT 15 USERS INTO auth.users ────────────────────────────────────
-- This triggers handles inserting records automatically into public.employees
-- with corresponding name, email, role, and department.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  -- Admin (Department: IT)
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin User", "role": "Admin", "department": "Information Technology"}', now(), now()),
  
  -- IT Department (Head, Manager, Employees)
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ithead@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Sarah Connor", "role": "DeptHead", "department": "Information Technology"}', now(), now()),
  ('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'itmanager@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Miles Dyson", "role": "AssetManager", "department": "Information Technology"}', now(), now()),
  ('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'itemp1@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "John Connor", "role": "Employee", "department": "Information Technology"}', now(), now()),
  ('a5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'itemp2@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "T-800 Cyberdyne", "role": "Employee", "department": "Information Technology"}', now(), now()),

  -- HR Department (Head, Manager, Employees)
  ('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hrhead@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Raj Koothrappali", "role": "DeptHead", "department": "Human Resources"}', now(), now()),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hrmanager@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Penny Hofstadter", "role": "AssetManager", "department": "Human Resources"}', now(), now()),
  ('b3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hremp1@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Howard Wolowitz", "role": "Employee", "department": "Human Resources"}', now(), now()),

  -- Operations Department (Head, Manager, Employees)
  ('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'opshead@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Priya Sen", "role": "DeptHead", "department": "Operations"}', now(), now()),
  ('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'opsmanager@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Leonard Hofstadter", "role": "AssetManager", "department": "Operations"}', now(), now()),
  ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'opsemp1@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Sheldon Cooper", "role": "Employee", "department": "Operations"}', now(), now()),

  -- Marketing Department (Head, Employees)
  ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mkthead@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Amy Farrah", "role": "DeptHead", "department": "Marketing"}', now(), now()),
  ('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mktemp1@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Bernadette Rosten", "role": "Employee", "department": "Marketing"}', now(), now()),

  -- Finance Department (Head, Employees)
  ('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'finhead@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Arthur Spooner", "role": "DeptHead", "department": "Finance"}', now(), now()),
  ('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'finemp1@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Carrie Heffernan", "role": "Employee", "department": "Finance"}', now(), now());

-- ── 3. UPDATE DEPARTMENTS WITH NEW HEAD EMPLOYEE ID ───────────────────────
-- Query generated employee IDs from their corresponding email
update public.departments set head_employee_id = (select id from public.employees where email = 'ithead@company.com') where name = 'Information Technology';
update public.departments set head_employee_id = (select id from public.employees where email = 'hrhead@company.com') where name = 'Human Resources';
update public.departments set head_employee_id = (select id from public.employees where email = 'opshead@company.com') where name = 'Operations';
update public.departments set head_employee_id = (select id from public.employees where email = 'mkthead@company.com') where name = 'Marketing';
update public.departments set head_employee_id = (select id from public.employees where email = 'finhead@company.com') where name = 'Finance';

-- ── 4. CATEGORIES AND ASSETS SEEDING ──────────────────────────────────────
insert into public.categories (id, name, extra_fields) values
  ('c0000000-0000-0000-0000-000000000001', 'Electronics', '[{"name": "Warranty Period (months)", "type": "number", "required": true}]'::jsonb),
  ('c0000000-0000-0000-0000-000000000002', 'Furniture', '[{"name": "Material", "type": "text", "required": false}]'::jsonb),
  ('c0000000-0000-0000-0000-000000000003', 'Vehicles', '[{"name": "License Plate", "type": "text", "required": true}]'::jsonb),
  ('c0000000-0000-0000-0000-000000000004', 'Shared Spaces', '[{"name": "Capacity", "type": "number", "required": false}]'::jsonb);

-- Insert assets
insert into public.assets (id, tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location, is_bookable, status) values
  -- Laptops & IT Equipment
  ('a0000000-0000-0000-0000-000000000001', 'AF-0001', 'Dell XPS 15 Laptop', 'c0000000-0000-0000-0000-000000000001', 'DELL-XPS-9923', '2025-01-10', 1600.00, 'Excellent', 'Headquarters - IT Desk 1', false, 'Allocated'),
  ('a0000000-0000-0000-0000-000000000002', 'AF-0002', 'MacBook Pro M3 Max', 'c0000000-0000-0000-0000-000000000001', 'AAPL-MBP-3982', '2025-02-15', 3200.00, 'Excellent', 'Headquarters - Operations', false, 'Allocated'),
  ('a0000000-0000-0000-0000-000000000003', 'AF-0003', 'Sony A7IV Camera', 'c0000000-0000-0000-0000-000000000001', 'SONY-A7-8726', '2024-11-20', 2500.00, 'Good', 'Marketing Room B', false, 'Allocated'),
  ('a0000000-0000-0000-0000-000000000004', 'AF-0004', 'iPhone 15 Pro Max', 'c0000000-0000-0000-0000-000000000001', 'AAPL-IPH-2983', '2024-10-05', 1200.00, 'Excellent', 'IT Lab Drawer', false, 'Allocated'),
  ('a0000000-0000-0000-0000-000000000005', 'AF-0005', 'Development Rack Server', 'c0000000-0000-0000-0000-000000000001', 'SRV-DELL-8827', '2023-05-12', 8500.00, 'Fair', 'Server Room - Rack 2', false, 'UnderMaintenance'),
  
  -- Furniture
  ('a0000000-0000-0000-0000-000000000006', 'AF-0006', 'Ergonomic Office Chair', 'c0000000-0000-0000-0000-000000000002', 'CHR-STEELCASE-22', '2025-03-01', 800.00, 'Good', 'Finance Hub', false, 'Allocated'),

  -- Vehicles
  ('a0000000-0000-0000-0000-000000000007', 'AF-0007', 'Tesla Model 3', 'c0000000-0000-0000-0000-000000000003', 'TSLA-M3-9876', '2024-08-20', 45000.00, 'Good', 'Parking Lot Zone A', true, 'Available'),

  -- Shared Rooms
  ('a0000000-0000-0000-0000-000000000008', 'AF-0008', 'Conference Room Alpha', 'c0000000-0000-0000-0000-000000000004', 'ROOM-ALPHA', '2024-01-01', 0, 'Excellent', 'HQ - 1st Floor', true, 'Available'),
  ('a0000000-0000-0000-0000-000000000009', 'AF-0009', 'Conference Room Beta', 'c0000000-0000-0000-0000-000000000004', 'ROOM-BETA', '2024-01-01', 0, 'Good', 'HQ - 2nd Floor', true, 'Available');

-- ── 5. ALLOCATE ASSETS ───────────────────────────────────────────────────
insert into public.allocations (asset_id, employee_id, department_id, status) values
  ('a0000000-0000-0000-0000-000000000001', (select id from public.employees where email = 'itemp1@company.com'), '00000000-0000-0000-0000-000000000001', 'Active'),
  ('a0000000-0000-0000-0000-000000000002', (select id from public.employees where email = 'opsemp1@company.com'), '00000000-0000-0000-0000-000000000003', 'Active'),
  ('a0000000-0000-0000-0000-000000000003', (select id from public.employees where email = 'mktemp1@company.com'), '00000000-0000-0000-0000-000000000004', 'Active'),
  ('a0000000-0000-0000-0000-000000000004', (select id from public.employees where email = 'itemp2@company.com'), '00000000-0000-0000-0000-000000000001', 'Active'),
  ('a0000000-0000-0000-0000-000000000006', (select id from public.employees where email = 'finemp1@company.com'), '00000000-0000-0000-0000-000000000005', 'Active');

-- ── 6. SEED RESOURCE BOOKINGS ─────────────────────────────────────────────
insert into public.bookings (asset_id, booked_by_employee_id, start_time, end_time, status) values
  (
    'a0000000-0000-0000-0000-000000000008',
    (select id from public.employees where email = 'hremp1@company.com'),
    now() + interval '1 day',
    now() + interval '1 day' + interval '2 hours',
    'Upcoming'
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    (select id from public.employees where email = 'opsemp1@company.com'),
    now() + interval '2 days',
    now() + interval '2 days' + interval '1 hour',
    'Upcoming'
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    (select id from public.employees where email = 'ithead@company.com'),
    now() + interval '3 days',
    now() + interval '4 days',
    'Upcoming'
  );

-- ── 7. SEED MAINTENANCE REQUESTS ──────────────────────────────────────────
-- Note: schema uses public.maintenance table
insert into public.maintenance (asset_id, requested_by, issue_description, status, cost, start_date) values
  (
    'a0000000-0000-0000-0000-000000000001',
    (select id from public.employees where email = 'itemp1@company.com'),
    'Laptop screen is flickering heavily when charger is connected. Needs screen assembly replacement.',
    'Pending',
    null,
    now()
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    (select id from public.employees where email = 'opsemp1@company.com'),
    'MacBook battery is draining extremely fast and case is expanding slightly. Suspected battery swelling.',
    'UnderRepair',
    180.00,
    now() - interval '2 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    (select id from public.employees where email = 'mktemp1@company.com'),
    'Sony autofocus motor has ceased. AF hunting occurs constantly on all lenses.',
    'Resolved',
    350.00,
    now() - interval '10 days'
  );
