-- Migration 011 : correction de la policy SELECT récursive sur organization_members
--
-- PROBLÈME : la policy originale (migration 003) utilisait une sous-requête
-- sur la même table, créant une récursion infinie que PostgreSQL résout
-- en retournant 0 lignes → tous les SELECT retournaient null.
--
-- SOLUTION : fonction SECURITY DEFINER qui contourne le RLS pour la
-- sous-requête interne uniquement (pattern recommandé par Supabase).

create or replace function get_user_org_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select organization_id from organization_members where user_id = auth.uid()
$$;

drop policy if exists "members_select_same_org" on organization_members;

create policy "members_select_same_org" on organization_members for select
using (
  organization_id in (select get_user_org_ids())
);
