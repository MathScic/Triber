-- Migration 003 : membres d'une organisation et leurs rôles
-- Ce fichier complète aussi les policies de 001 et 002 qui dépendent de cette table

create table organization_members (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references organizations on delete cascade,
  user_id          uuid        not null references auth.users on delete cascade,
  role             text        not null check (role in ('admin', 'member_active', 'member')),
  joined_at        timestamptz default now(),
  unique (organization_id, user_id)
);

alter table organization_members enable row level security;

-- Lecture : membres de la même organisation
create policy "members_select_same_org" on organization_members for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

-- Invitation : admin uniquement
-- (le premier admin est inséré via service_role après création de l'org)
create policy "members_insert_admin" on organization_members for insert
with check (
  exists (
    select 1 from organization_members om
    where om.user_id = auth.uid()
      and om.organization_id = organization_members.organization_id
      and om.role = 'admin'
  )
);

-- Changement de rôle : admin uniquement
create policy "members_update_admin" on organization_members for update
using (
  exists (
    select 1 from organization_members om
    where om.user_id = auth.uid()
      and om.organization_id = organization_members.organization_id
      and om.role = 'admin'
  )
);

-- Suppression : admin uniquement
create policy "members_delete_admin" on organization_members for delete
using (
  exists (
    select 1 from organization_members om
    where om.user_id = auth.uid()
      and om.organization_id = organization_members.organization_id
      and om.role = 'admin'
  )
);

-- --- Policies manquantes de 001 (organizations) ---

create policy "org_select_members" on organizations for select
using (
  id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

create policy "org_update_admin" on organizations for update
using (
  id in (
    select organization_id from organization_members
    where user_id = auth.uid() and role = 'admin'
  )
);

create policy "org_delete_admin" on organizations for delete
using (
  id in (
    select organization_id from organization_members
    where user_id = auth.uid() and role = 'admin'
  )
);

-- --- Policy manquante de 002 (profiles) ---

create policy "profile_select_org_members" on profiles for select
using (
  auth.uid() = id
  or id in (
    select user_id from organization_members
    where organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid()
    )
  )
);
