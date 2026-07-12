-- ============================================
-- ASSET TAG AUTO-GENERATOR (AF-0001, AF-0002, ...)
-- ============================================
-- Uses a dedicated sequence so concurrent inserts never collide or
-- skip/reuse numbers, unlike a MAX(tag)+1 approach.

create sequence if not exists asset_tag_seq start 1;

create or replace function public.generate_asset_tag()
returns trigger
language plpgsql
as $$
begin
  if new.tag is null then
    new.tag := 'AF-' || lpad(nextval('asset_tag_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger set_asset_tag
  before insert on assets
  for each row execute function public.generate_asset_tag();
