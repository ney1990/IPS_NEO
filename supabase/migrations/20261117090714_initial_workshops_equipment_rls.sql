
-- IPS-NEO initial catalog: no sample data; owner-scoped access only.
create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  code text not null check (length(code) between 1 and 40 and code = upper(btrim(code))),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, code),
  unique (id, owner_id)
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  workshop_id uuid not null,
  code text not null check (length(code) between 1 and 40 and code = upper(btrim(code))),
  name text not null check (length(btrim(name)) between 1 and 160),
  category text not null default '',
  manufacturer text not null default '',
  model text not null default '',
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, code),
  constraint equipment_workshop_owner_fk foreign key (workshop_id, owner_id)
    references public.workshops(id, owner_id) on update restrict on delete restrict
);
create index equipment_workshop_idx on public.equipment(workshop_id);

create table public.audit_log (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id),
  actor_id uuid,
  entity_type text not null check (entity_type in ('workshops','equipment')),
  entity_id uuid not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  before_row jsonb,
  after_row jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_owner_created_idx on public.audit_log (owner_id, created_at desc);

alter table public.workshops enable row level security;
alter table public.equipment enable row level security;
alter table public.audit_log enable row level security;
create policy workshops_read on public.workshops for select to authenticated
  using (owner_id = (select auth.uid()));
create policy workshops_insert on public.workshops for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy workshops_update on public.workshops for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy equipment_read on public.equipment for select to authenticated
  using (owner_id = (select auth.uid()));
create policy equipment_insert on public.equipment for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy equipment_update on public.equipment for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy audit_log_read on public.audit_log for select to authenticated
  using (owner_id = (select auth.uid()));

revoke all on public.workshops, public.equipment, public.audit_log from anon, authenticated;
grant select, insert, update on public.workshops, public.equipment to authenticated;
grant select on public.audit_log to authenticated;

create schema if not exists ips_private;
revoke all on schema ips_private from public, anon, authenticated;

create function ips_private.validate_catalog() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_TABLE_NAME = 'equipment' and NEW.active and not exists (
    select 1 from public.workshops w where w.id = NEW.workshop_id
      and w.owner_id = NEW.owner_id and w.active
  ) then
    raise exception 'Atelier inactif ou inaccessible';
  end if;
  if TG_TABLE_NAME = 'workshops' and TG_OP = 'UPDATE'
     and OLD.active and not NEW.active
     and exists (select 1 from public.equipment e
                 where e.workshop_id = NEW.id and e.active) then
    raise exception 'Des équipements actifs sont encore rattachés à cet atelier';
  end if;
  if TG_OP = 'UPDATE' then
    NEW.updated_at := now();
  end if;
  return NEW;
end $$;
revoke all on function ips_private.validate_catalog() from public, anon, authenticated;

create trigger catalog_workshops_validate before update on public.workshops
  for each row execute function ips_private.validate_catalog();
create trigger catalog_equipment_validate before insert or update on public.equipment
  for each row execute function ips_private.validate_catalog();

create function ips_private.audit_catalog() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid; v_id uuid; v_old jsonb; v_new jsonb;
begin
  if TG_OP = 'INSERT' then
    v_owner := NEW.owner_id; v_id := NEW.id; v_old := null; v_new := to_jsonb(NEW);
  elsif TG_OP = 'DELETE' then
    v_owner := OLD.owner_id; v_id := OLD.id; v_old := to_jsonb(OLD); v_new := null;
  else
    v_owner := NEW.owner_id; v_id := NEW.id; v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
  end if;
  insert into public.audit_log (owner_id, actor_id, entity_type, entity_id, action, before_row, after_row)
    values (v_owner, auth.uid(), TG_TABLE_NAME, v_id, TG_OP, v_old, v_new);
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end $$;
revoke all on function ips_private.audit_catalog() from public, anon, authenticated;

create trigger workshops_audit after insert or update or delete on public.workshops
  for each row execute function ips_private.audit_catalog();
create trigger equipment_audit after insert or update or delete on public.equipment
  for each row execute function ips_private.audit_catalog();
