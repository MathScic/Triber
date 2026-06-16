-- Migration 008 : cotisations et paiements via Stripe
-- Les mises à jour de statut par le webhook Stripe utilisent le service_role (bypass RLS)

create table contributions (
  id                uuid        primary key default gen_random_uuid(),
  organization_id   uuid        not null references organizations on delete cascade,
  user_id           uuid        not null references auth.users on delete cascade,
  amount            int         not null, -- montant en centimes
  label             text        not null,
  status            text        not null check (status in ('pending', 'paid', 'failed')),
  stripe_payment_id text,
  paid_at           timestamptz,
  created_at        timestamptz default now()
);

alter table contributions enable row level security;

-- Lecture : chacun voit ses propres cotisations ; admin/member_active voient tout
create policy "contributions_select" on contributions for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = contributions.organization_id
      and role in ('admin', 'member_active')
  )
);

-- Création : admin et member_active
create policy "contributions_insert_active" on contributions for insert
with check (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = contributions.organization_id
      and role in ('admin', 'member_active')
  )
);

-- Mise à jour du statut : admin uniquement
create policy "contributions_update_admin" on contributions for update
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = contributions.organization_id
      and role = 'admin'
  )
);

-- Suppression : admin uniquement
create policy "contributions_delete_admin" on contributions for delete
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
      and organization_id = contributions.organization_id
      and role = 'admin'
  )
);
