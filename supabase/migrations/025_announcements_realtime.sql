-- Active la publication Realtime sur la table announcements
-- Permet aux clients Supabase Realtime d'écouter les insertions en temps réel
alter publication supabase_realtime add table announcements;
