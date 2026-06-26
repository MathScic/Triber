-- Index de performance — requis à l'échelle (sinon full table scan sur chaque page load)
-- Ces colonnes sont utilisées dans toutes les requêtes RLS et les joins fréquents

CREATE INDEX IF NOT EXISTS idx_org_members_user_id
  ON organization_members(user_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id
  ON organization_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_role
  ON organization_members(organization_id, role);

CREATE INDEX IF NOT EXISTS idx_events_org_start
  ON events(organization_id, start_at DESC);

CREATE INDEX IF NOT EXISTS idx_contribution_payments_template_user
  ON contribution_payments(template_id, user_id);

CREATE INDEX IF NOT EXISTS idx_contribution_payments_org
  ON contribution_payments(organization_id);

CREATE INDEX IF NOT EXISTS idx_match_actions_event
  ON match_actions(event_id, created_at);

CREATE INDEX IF NOT EXISTS idx_match_lineups_event
  ON match_lineups(event_id);

CREATE INDEX IF NOT EXISTS idx_event_attendees_user
  ON event_attendees(user_id);

CREATE INDEX IF NOT EXISTS idx_contributions_org
  ON contributions(organization_id);
