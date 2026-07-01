-- Active la publication Realtime sur la table match_lineups
-- Permet à MatchCompositionSection d'écouter les changements de composition en direct
alter publication supabase_realtime add table match_lineups;
