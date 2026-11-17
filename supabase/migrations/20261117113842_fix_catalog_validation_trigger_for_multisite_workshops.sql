create or replace function ips_private.validate_catalog()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_TABLE_NAME = 'equipment' then
    if NEW.active and not exists (
      select 1 from public.workshops w
      where w.id = NEW.workshop_id
        and w.owner_id = NEW.owner_id
        and w.active
    ) then
      raise exception 'Atelier inactif ou inaccessible';
    end if;
  elsif TG_TABLE_NAME = 'workshops' then
    if TG_OP = 'UPDATE' and OLD.active and not NEW.active and exists (
      select 1 from public.equipment e
      where e.workshop_id = NEW.id
        and e.owner_id = NEW.owner_id
        and e.active
    ) then
      raise exception 'Des équipements actifs sont encore rattachés à cet atelier';
    end if;
  elsif TG_TABLE_NAME <> 'sites' then
    raise exception 'Déclencheur de validation appelé sur une table inattendue: %', TG_TABLE_NAME;
  end if;
  if TG_OP = 'UPDATE' then
    NEW.updated_at := now();
  end if;
  return NEW;
end $$;
revoke all on function ips_private.validate_catalog() from public, anon, authenticated;