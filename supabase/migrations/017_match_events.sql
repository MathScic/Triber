-- Événements live d'un match (buts, cartons) avec la minute de l'action

create table match_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade not null,
  type text not null check (type in ('goal', 'own_goal', 'opponent_goal', 'yellow_card', 'red_card')),
  minute int not null check (minute >= 0 and minute <= 200),
  player_id uuid references auth.users on delete set null,
  assist_player_id uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table match_events enable row level security;

-- Lecture publique (page live sans connexion)
create policy "public_read_match_events" on match_events for select using (true);

-- Insertion : admin ou member_active de l'organisation concernée
create policy "active_insert_match_events" on match_events for insert
with check (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = match_events.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Suppression : même condition
create policy "active_delete_match_events" on match_events for delete
using (
  exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = match_events.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);
