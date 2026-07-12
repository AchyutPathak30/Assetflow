-- ============================================
-- BOOKING LOGIC: create_booking()
-- ============================================
-- Overlap rule: a new booking (new_start, new_end) conflicts with an
-- existing one (existing_start, existing_end) if and only if:
--   new_start < existing_end AND new_end > existing_start
-- This correctly ALLOWS back-to-back bookings (existing 9-10, new 10-11
-- is fine) and only blocks true overlaps. Only bookings with status
-- Upcoming or Ongoing count as conflicts — Cancelled/Completed do not.

create or replace function public.create_booking(
  p_asset_id uuid,
  p_booked_by_employee_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflict record;
  v_is_bookable boolean;
  v_new_id uuid;
begin
  if p_end_time <= p_start_time then
    return jsonb_build_object('success', false, 'reason', 'invalid_time_range');
  end if;

  select is_bookable into v_is_bookable from assets where id = p_asset_id;
  if v_is_bookable is null then
    return jsonb_build_object('success', false, 'reason', 'asset_not_found');
  end if;
  if not v_is_bookable then
    return jsonb_build_object('success', false, 'reason', 'asset_not_bookable');
  end if;

  -- lock existing bookings for this asset to prevent race conditions
  perform 1 from bookings where asset_id = p_asset_id for update;

  select id, start_time, end_time into v_conflict
  from bookings
  where asset_id = p_asset_id
    and status in ('Upcoming', 'Ongoing')
    and p_start_time < end_time
    and p_end_time > start_time
  limit 1;

  if found then
    return jsonb_build_object(
      'success', false,
      'reason', 'overlap',
      'conflicting_start', v_conflict.start_time,
      'conflicting_end', v_conflict.end_time
    );
  end if;

  insert into bookings (asset_id, booked_by_employee_id, start_time, end_time, status)
  values (p_asset_id, p_booked_by_employee_id, p_start_time, p_end_time, 'Upcoming')
  returning id into v_new_id;

  return jsonb_build_object('success', true, 'booking_id', v_new_id);
end;
$$;

-- ============================================
-- CANCEL BOOKING: cancel_booking()
-- ============================================

create or replace function public.cancel_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update bookings set status = 'Cancelled'
  where id = p_booking_id and status in ('Upcoming', 'Ongoing');

  if not found then
    return jsonb_build_object('success', false, 'reason', 'booking_not_found_or_already_closed');
  end if;

  return jsonb_build_object('success', true);
end;
$$;
