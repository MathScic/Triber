-- Division, catégorie et saison de l'organisation (affichées sur la bannière d'accueil)
alter table organizations
  add column if not exists division text,
  add column if not exists category text,
  add column if not exists season text default '2025-2026';

-- Catégorie individuelle d'un membre (équipe à laquelle il appartient)
-- Permet le filtre par catégorie dans la liste des membres quand l'org en a plusieurs
alter table organization_members
  add column if not exists category text;
