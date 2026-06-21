-- Catégories possibles d'un membre (plusieurs par personne)
create table if not exists member_categories (
  id uuid primary key default gen_random_uuid(),
  organization_member_id uuid references organization_members(id) on delete cascade,
  status text not null check (status in ('joueur', 'bureau', 'parent')),
  category text not null,
  created_at timestamptz default now()
);

alter table member_categories enable row level security;

create policy "member_categories_select" on member_categories
  for select using (true);

create policy "member_categories_insert" on member_categories
  for insert with check (
    organization_member_id in (
      select id from organization_members where user_id = auth.uid()
    )
  );

create policy "member_categories_delete" on member_categories
  for delete using (
    organization_member_id in (
      select id from organization_members where user_id = auth.uid()
    )
  );

-- Champs événement enrichis
alter table events
add column if not exists category text,
add column if not exists opponent text;
