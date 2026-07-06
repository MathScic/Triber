-- Migration 028 : corrige la récursion RLS sur les policies d'écriture de organization_members
--
-- PROBLÈME : les policies INSERT/UPDATE/DELETE (migration 003) vérifient que
-- l'appelant est admin via une sous-requête EXISTS sur organization_members
-- elle-même. Cette sous-requête est filtrée par la policy SELECT de la table,
-- qui souffre du même problème de récursion documenté en migration 011 (résolu
-- à 0 lignes par PostgreSQL). Conséquence observée : changer le rôle d'un
-- membre ou le supprimer ne renvoie aucune erreur côté client mais ne modifie
-- aucune ligne — RLS bloque silencieusement l'UPDATE/DELETE.
--
-- SOLUTION : fonctions SECURITY DEFINER (contournent RLS pour la sous-requête
-- interne uniquement), même pattern que la migration 011, étendu à l'écriture.

create or replace function get_user_org_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select organization_id from organization_members where user_id = auth.uid()
$$;

create or replace function get_user_admin_org_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select organization_id from organization_members
  where user_id = auth.uid() and role = 'admin'
$$;

drop policy if exists "members_select_same_org" on organization_members;
create policy "members_select_same_org" on organization_members for select
using (organization_id in (select get_user_org_ids()));

drop policy if exists "members_insert_admin" on organization_members;
create policy "members_insert_admin" on organization_members for insert
with check (organization_id in (select get_user_admin_org_ids()));

drop policy if exists "members_update_admin" on organization_members;
create policy "members_update_admin" on organization_members for update
using (organization_id in (select get_user_admin_org_ids()));

drop policy if exists "members_delete_admin" on organization_members;
create policy "members_delete_admin" on organization_members for delete
using (organization_id in (select get_user_admin_org_ids()));
