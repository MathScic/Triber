-- Catégorie de niveau (Senior, U18, U16, U15, U14, U13, U12, Vétérans, Féminine)
-- et équipe (A, B, C) pour les événements de type match
alter table events add column if not exists category text;
alter table events add column if not exists team_label text;
