-- Table des annonces envoyées par les admins aux membres
create table if not exists announcements (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  author_id       uuid references profiles(id),
  title           text not null,
  message         text not null,
  category        text,
  created_at      timestamptz default now()
);

alter table announcements enable row level security;

-- Lecture : membres de l'organisation
create policy "announcements_select" on announcements
  for select using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- Création : admins uniquement
create policy "announcements_insert" on announcements
  for insert with check (
    exists (
      select 1 from organization_members om
      where om.user_id = auth.uid()
        and om.organization_id = announcements.organization_id
        and om.role = 'admin'
    )
  );
