
alter table public.workshops
  add column sector text not null default 'FAB'
    constraint workshops_sector_check check (sector in ('FAB', 'CONDT_PR'));

create index workshops_owner_sector_idx on public.workshops(owner_id, sector);
