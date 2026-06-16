-- Migration 006 : résultats de match (1 résultat par événement de type match)

create table match_results (
  id          uuid        primary key default gen_random_uuid(),
  event_id    uuid        not null references events on delete cascade unique,
  score_home  int         not null,
  score_away  int         not null,
  entered_by  uuid        references auth.users,
  entered_at  timestamptz default now()
);

alter table match_results enable row level security;

-- Lecture : membres de l'organisation liée à l'événement
create policy "results_select_members" on match_results for select
using (
  event_id in (
    select id from events
    where organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid()
    )
  )
);

-- Création : admin et member_active
create policy "results_insert_active" on match_results for insert
with check (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = match_results.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Modification : admin et member_active
create policy "results_update_active" on match_results for update
using (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = match_results.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Suppression : admin uniquement
create policy "results_delete_admin" on match_results for delete
using (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = match_results.event_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);
