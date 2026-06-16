-- Table des actions en temps réel pour le match en direct
create table if not exists match_actions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events on delete cascade not null,
  user_id      uuid references auth.users,
  player_in_id uuid references auth.users,
  type         text not null check (type in ('goal', 'assist', 'yellow_card', 'red_card', 'substitution')),
  minute       int  not null,
  is_own_team  boolean not null default true,
  created_at   timestamptz default now()
);

alter table match_actions enable row level security;

-- Lecture : membres de l'organisation uniquement
create policy "members_read_match_actions" on match_actions for select
using (
  event_id in (
    select e.id from events e
    join organization_members om on om.organization_id = e.organization_id
    where om.user_id = auth.uid()
  )
);

-- Écriture : admin et member_active uniquement
create policy "active_members_write_match_actions" on match_actions for insert
with check (
  event_id in (
    select e.id from events e
    join organization_members om on om.organization_id = e.organization_id
    where om.user_id = auth.uid() and om.role in ('admin', 'member_active')
  )
);

-- Realtime activé sur cette table
alter publication supabase_realtime add table match_actions;
