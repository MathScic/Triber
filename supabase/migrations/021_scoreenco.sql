-- URL du widget Score'n'co (classement officiel de championnat)
-- L'admin colle l'URL ou le code iframe — Triber extrait et affiche l'embed
alter table organizations add column if not exists scoreenco_url text;
