-- Migration 027 : trace horodatée du consentement à la commission de 1,5%
-- Obligation légale (CLAUDE.md §1) — un enregistrement par passage au plan Club,
-- table en ajout seul (aucune policy update/delete) pour préserver l'historique

create table if not exists commission_consents (
  id              uuid        primary key default gen_random_uuid(),
  organization_id uuid        not null references organizations on delete cascade,
  user_id         uuid        not null references auth.users on delete cascade,
  consented_at    timestamptz not null default now()
);

alter table commission_consents enable row level security;

-- Lecture : admin de l'organisation concernée
create policy "consent_select_admin" on commission_consents for select
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = commission_consents.organization_id
      and role = 'admin'
  )
);

-- Création : admin, uniquement pour lui-même
create policy "consent_insert_admin" on commission_consents for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = commission_consents.organization_id
      and role = 'admin'
  )
);
