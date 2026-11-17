
-- IPS-NEO v0.2 - Site -> Atelier -> Equipement (no fictitious site records).
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  code text not null check (length(code) between 1 and 40 and code = upper(btrim(code))),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, code),
  unique(id, owner_id)
);

alter table public.sites enable row level security;
create policy sites_read on public.sites for select to authenticated
  using (owner_id = (select auth.uid()));
create policy sites_insert on public.sites for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy sites_update on public.sites for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
revoke all on public.sites from anon, authenticated;
grant select, insert, update on public.sites to authenticated;

alter table public.workshops
  add column site_id uuid null;
alter table public.workshops
  add constraint workshop_site_owner_fk foreign key (site_id, owner_id)
  references public.sites(id, owner_id)
  on update restrict on delete restrict;
create index workshops_site_idx on public.workshops (owner_id, site_id);

-- Extend audit entity whitelist; original records and triggers are preserved.
alter table public.audit_log drop constraint audit_log_entity_type_check;
alter table public.audit_log add constraint audit_log_entity_type_check
  check(entity_type in ('sites','workshops','equipment'));

create function ips_private.check_workshop_site() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.site_id is not null and new.active and not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.owner_id = new.owner_id and s.active
  ) then
    raise exception 'Impossible de rattacher un atelier actif à un site inactif ou non accessible';
  end if;
  return new;
end $$;
revoke all on function ips_private.check_workshop_site() from public, anon, authenticated;
create trigger workshops_site_check before insert or update on public.workshops
  for each row execute function ips_private.check_workshop_site();

create function ips_private.check_site_deactivation() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.active and not new.active and exists (
    select 1 from public.workshops w
    where w.site_id = new.id and w.owner_id = new.owner_id and w.active
  ) then
    raise exception 'Des ateliers actifs sont rattachés à ce site : désactivez-les avant';
  end if;
  return new;
end $$;
revoke all on function ips_private.check_site_deactivation() from public, anon, authenticated;
create trigger sites_deactivation_check before update on public.sites
  for each row execute function ips_private.check_site_deactivation();

-- Existing generic timestamp and audit triggers support the new entity.
create trigger sites_updated_at before update on public.sites
  for each row execute function ips_private.validate_catalog();
create trigger sites_audit after insert or update or delete on public.sites
  for each row execute function ips_private.audit_catalog();

comment on column public.workshops.site_id is
  'Nullable until the existing 12 workshops are assigned to their real NEOMEDIC sites.';
