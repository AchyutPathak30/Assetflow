-- ============================================
-- ADDITIONAL TABLES FOR COMPLETE INTEGRATION
-- ============================================

create table maintenance (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id),
  reported_by uuid references employees(id),
  reported_date date not null default current_date,
  issue text not null,
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Pending' 
    check (status in ('Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved', 'Rejected')),
  technician text,
  cost numeric default 0,
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table audits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  location text,
  start_date date not null,
  end_date date not null,
  auditors uuid[] not null,
  status text not null default 'Active' check (status in ('Active', 'Closed')),
  checklist jsonb default '[]'::jsonb,
  discrepancies jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  user_id uuid references employees(id),
  action text not null,
  details text not null
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  user_id uuid references employees(id),
  title text not null,
  message text not null,
  read boolean not null default false
);

-- Enable RLS
alter table maintenance enable row level security;
alter table audits enable row level security;
alter table logs enable row level security;
alter table notifications enable row level security;

-- Setup RLS Policies (read/write access simplified for authenticated users)
create policy "maintenance_select_all" on maintenance for select to authenticated using (true);
create policy "maintenance_insert_all" on maintenance for insert to authenticated with check (true);
create policy "maintenance_update_all" on maintenance for update to authenticated using (true);

create policy "audits_select_all" on audits for select to authenticated using (true);
create policy "audits_insert_all" on audits for insert to authenticated with check (true);
create policy "audits_update_all" on audits for update to authenticated using (true);

create policy "logs_select_all" on logs for select to authenticated using (true);
create policy "logs_insert_all" on logs for insert to authenticated with check (true);

create policy "notifications_select_all" on notifications for select to authenticated using (true);
create policy "notifications_insert_all" on notifications for insert to authenticated with check (true);
create policy "notifications_update_all" on notifications for update to authenticated using (true);
