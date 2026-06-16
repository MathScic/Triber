-- Ajout du champ status sur les événements (upcoming | ongoing | finished)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'ongoing', 'finished'));

-- Champs optionnels pour les matchs : adversaire et domicile/extérieur
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS opponent TEXT,
  ADD COLUMN IF NOT EXISTS is_home BOOLEAN;

-- Index pour les filtres par statut
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
