-- Migration 009 : galerie médias (photos par événement)

create table media (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references organizations on delete cascade,
  event_id         uuid        references events on delete set null,
  uploader_id      uuid        references auth.users,
  url              text        not null,
  caption          text,
  created_at       timestamptz default now()
);

alter table media enable row level security;

-- Lecture : membres de l'organisation
create policy "media_select_members" on media for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

-- Upload : tout membre de l'organisation
create policy "media_insert_member" on media for insert
with check (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = media.organization_id
  )
);

-- Modification : admin, member_active ou propriétaire de l'upload
create policy "media_update_active_or_own" on media for update
using (
  uploader_id = auth.uid()
  or exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = media.organization_id
      and role in ('admin', 'member_active')
  )
);

-- Suppression : admin, member_active ou propriétaire de l'upload
create policy "media_delete_active_or_own" on media for delete
using (
  uploader_id = auth.uid()
  or exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = media.organization_id
      and role in ('admin', 'member_active')
  )
);
