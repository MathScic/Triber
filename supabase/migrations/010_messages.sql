-- Migration 010 : messagerie interne de l'organisation

create table messages (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references organizations on delete cascade,
  sender_id        uuid        references auth.users,
  content          text        not null,
  sent_at          timestamptz default now()
);

alter table messages enable row level security;

-- Lecture : membres de l'organisation
create policy "messages_select_members" on messages for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

-- Envoi : tout membre de l'organisation
create policy "messages_insert_member" on messages for insert
with check (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = messages.organization_id
  )
);

-- Modification : uniquement son propre message
create policy "messages_update_own" on messages for update
using (sender_id = auth.uid());

-- Suppression : son propre message ou admin
create policy "messages_delete_own_or_admin" on messages for delete
using (
  sender_id = auth.uid()
  or exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = messages.organization_id
      and role = 'admin'
  )
);
