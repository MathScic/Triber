-- Migration 002 : profils utilisateurs (1 par compte auth)
-- La policy SELECT est dans 003 car elle dépend de organization_members

create table profiles (
  id          uuid        primary key references auth.users on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  push_token  text,
  updated_at  timestamptz default now()
);

-- RLS activé immédiatement
alter table profiles enable row level security;

-- Création : uniquement son propre profil
create policy "profile_insert_own" on profiles for insert
with check (auth.uid() = id);

-- Mise à jour : uniquement son propre profil
create policy "profile_update_own" on profiles for update
using (auth.uid() = id);

-- La policy profile_select_org_members est créée dans 003_organization_members.sql
