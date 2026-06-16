-- Migration 001 : table des organisations (clubs / entreprises)
-- Les policies SELECT/UPDATE/DELETE sont dans 003 car elles dépendent de organization_members

create table organizations (
  id                     uuid        primary key default gen_random_uuid(),
  name                   text        not null,
  type                   text        not null check (type in ('club', 'enterprise')),
  plan                   text        not null default 'free' check (plan in ('free', 'club', 'pro')),
  member_count           int         not null default 0,
  logo_url               text,
  cover_url              text,
  primary_color          text        default '#2A9D4E',
  secondary_color        text        default '#E8622A',
  slogan                 text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz default now()
);

-- RLS activé immédiatement
alter table organizations enable row level security;

-- Création : tout utilisateur authentifié peut créer une organisation
-- (la limite 1 org / compte est contrôlée en API Route)
create policy "org_insert_authenticated" on organizations for insert
with check (auth.uid() is not null);

-- Les policies org_select_members, org_update_admin, org_delete_admin
-- sont créées dans 003_organization_members.sql
