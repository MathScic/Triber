-- Migration 004 : événements (matchs, entraînements, réunions, autres)

create table events (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references organizations on delete cascade,
  title            text        not null,
  type             text        not null check (type in ('match', 'training', 'meeting', 'other')),
  start_at         timestamptz not null,
  location         text,
  opponent         text,
  is_home          boolean,
  created_by       uuid        references auth.users,
  created_at       timestamptz default now()
);

alter table events enable row level security;

-- Lecture : membres de l'organisation
create policy "events_select_members" on events for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

-- Création : admin et member_active
create policy "events_insert_active" on events for insert
with check (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = events.organization_id
      and role in ('admin', 'member_active')
  )
);

-- Modification : admin et member_active
create policy "events_update_active" on events for update
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = events.organization_id
      and role in ('admin', 'member_active')
  )
);

-- Suppression : admin uniquement
create policy "events_delete_admin" on events for delete
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = events.organization_id
      and role = 'admin'
  )
);
