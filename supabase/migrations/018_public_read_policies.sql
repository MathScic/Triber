-- Policies de lecture publique pour les pages sans connexion :
-- /[club-slug] (page publique du club) et /match/[id] (match en direct)

-- Organisations : lecture publique des infos branding
create policy "public_read_organizations" on organizations for select
using (true);

-- Événements : lecture publique (planning, matchs)
create policy "public_read_events" on events for select
using (true);

-- Résultats de match : lecture publique (scores)
create policy "public_read_match_results" on match_results for select
using (true);

-- Actions de match : lecture publique (buts, cartons, timeline)
create policy "public_read_match_actions" on match_actions for select
using (true);

-- Composition de match : lecture publique (titulaires/remplaçants)
create policy "public_read_match_lineups" on match_lineups for select
using (true);
