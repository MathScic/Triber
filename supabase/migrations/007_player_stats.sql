-- Migration 007 : statistiques individuelles des joueurs par match

create table player_stats (
  id              uuid  primary key default gen_random_uuid(),
  event_id        uuid  not null references events on delete cascade,
  user_id         uuid  not null references auth.users on delete cascade,
  goals           int   default 0,
  assists         int   default 0,
  minutes_played  int   default 0,
  yellow_cards    int   default 0,
  red_cards       int   default 0,
  unique (event_id, user_id)
);

alter table player_stats enable row level security;

-- Lecture : membres de l'organisation
create policy "stats_select_members" on player_stats for select
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
create policy "stats_insert_active" on player_stats for insert
with check (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = player_stats.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Modification : admin et member_active
create policy "stats_update_active" on player_stats for update
using (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = player_stats.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Suppression : admin uniquement
create policy "stats_delete_admin" on player_stats for delete
using (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = player_stats.event_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  )
);
