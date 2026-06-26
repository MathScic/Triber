-- Classement de championnat saisi manuellement par l'admin
create table if not exists standings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  season text not null default '2025-2026',
  rank int not null,
  team_name text not null,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  points int not null default 0,
  is_own_team boolean not null default false,
  updated_at timestamptz default now()
);

alter table standings enable row level security;

-- Lecture : membres de l'org + accès public (page club)
create policy "standings_read" on standings for select
using (
  organization_id in (
    select organization_id from organization_members where user_id = auth.uid()
  )
);

-- Lecture publique (page /[club-slug] sans connexion)
create policy "standings_public_read" on standings for select
using (true);

-- Écriture : admin et member_active uniquement
create policy "standings_write" on standings for all
using (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
    and organization_id = standings.organization_id
    and role in ('admin', 'member_active')
  )
);
