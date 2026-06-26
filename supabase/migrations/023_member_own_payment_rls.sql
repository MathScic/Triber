-- Migration 023 : autoriser les membres à lire/écrire leurs propres paiements
-- Nécessaire pour le retour Stripe côté client (webhook non disponible en dev)

-- Membres peuvent lire LEURS propres lignes de paiement
create policy "cp_select_own" on contribution_payments
  for select using (user_id = auth.uid());

-- Membres peuvent insérer un paiement pour eux-mêmes
create policy "cp_insert_own" on contribution_payments
  for insert with check (user_id = auth.uid());

-- Membres peuvent mettre à jour leurs propres paiements (ex : retour Stripe)
create policy "cp_update_own" on contribution_payments
  for update using (user_id = auth.uid());
