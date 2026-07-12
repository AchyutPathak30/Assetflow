-- ============================================
-- ALLOCATION LOGIC: allocate_asset()
-- ============================================
-- Atomically checks for an existing Active allocation on the asset.
-- If one exists, blocks and returns who currently holds it (as JSON)
-- instead of raising a bare error, so the frontend can show
-- "currently held by X" + a Transfer Request button.
-- If none exists, creates the allocation and flips the asset to Allocated.

create or replace function public.allocate_asset(
  p_asset_id uuid,
  p_employee_id uuid default null,
  p_department_id uuid default null,
  p_expected_return_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing record;
  v_new_allocation_id uuid;
begin
  if p_employee_id is null and p_department_id is null then
    raise exception 'Must provide either an employee_id or department_id';
  end if;

  -- lock the row to prevent race conditions from simultaneous allocation attempts
  perform 1 from assets where id = p_asset_id for update;

  select a.id, a.employee_id, a.department_id, e.name as holder_name
  into v_existing
  from allocations a
  left join employees e on e.id = a.employee_id
  where a.asset_id = p_asset_id and a.status = 'Active'
  limit 1;

  if found then
    return jsonb_build_object(
      'success', false,
      'reason', 'already_allocated',
      'held_by_employee_id', v_existing.employee_id,
      'held_by_department_id', v_existing.department_id,
      'held_by_name', v_existing.holder_name
    );
  end if;

  insert into allocations (asset_id, employee_id, department_id, expected_return_date, status)
  values (p_asset_id, p_employee_id, p_department_id, p_expected_return_date, 'Active')
  returning id into v_new_allocation_id;

  update assets set status = 'Allocated' where id = p_asset_id;

  return jsonb_build_object('success', true, 'allocation_id', v_new_allocation_id);
end;
$$;

-- ============================================
-- TRANSFER REQUEST: request_transfer()
-- ============================================
-- Marks the current active allocation as TransferPending and records
-- who the asset would go to next, without moving it yet.

create or replace function public.request_transfer(
  p_asset_id uuid,
  p_requested_by_employee_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_id uuid;
begin
  select id into v_active_id from allocations
  where asset_id = p_asset_id and status = 'Active'
  limit 1;

  if v_active_id is null then
    return jsonb_build_object('success', false, 'reason', 'no_active_allocation');
  end if;

  update allocations set status = 'TransferPending' where id = v_active_id;

  insert into allocations (asset_id, employee_id, status)
  values (p_asset_id, p_requested_by_employee_id, 'TransferPending')
  returning id;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================
-- APPROVE TRANSFER: approve_transfer()
-- ============================================
-- Closes the old allocation as Returned, activates the new one,
-- keeps full history intact.

create or replace function public.approve_transfer(p_asset_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_id uuid;
  v_new_id uuid;
begin
  select id into v_old_id from allocations
  where asset_id = p_asset_id and status = 'TransferPending'
  order by allocated_on asc limit 1;

  select id into v_new_id from allocations
  where asset_id = p_asset_id and status = 'TransferPending'
  order by allocated_on desc limit 1;

  if v_old_id is null or v_new_id is null or v_old_id = v_new_id then
    return jsonb_build_object('success', false, 'reason', 'no_pending_transfer');
  end if;

  update allocations set status = 'Returned', returned_on = now() where id = v_old_id;
  update allocations set status = 'Active' where id = v_new_id;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================
-- RETURN ASSET: return_asset()
-- ============================================

create or replace function public.return_asset(
  p_allocation_id uuid,
  p_condition_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_asset_id uuid;
begin
  update allocations
  set status = 'Returned', returned_on = now(), condition_notes_on_return = p_condition_notes
  where id = p_allocation_id and status = 'Active'
  returning asset_id into v_asset_id;

  if v_asset_id is null then
    return jsonb_build_object('success', false, 'reason', 'allocation_not_found_or_not_active');
  end if;

  update assets set status = 'Available' where id = v_asset_id;

  return jsonb_build_object('success', true);
end;
$$;
