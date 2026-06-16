// Limites par plan — source de vérité unique
export const PLAN_LIMITS: Record<string, number> = {
  free: 20,
  club: Infinity,
  pro: Infinity,
}

// Retourne true si l'ajout d'un membre est autorisé
export function canAddMember(plan: string, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan] ?? 20
  return currentCount < limit
}

// Message d'erreur si la limite est atteinte
export function planLimitMessage(plan: string): string {
  if (plan === 'free') {
    return 'Limite de 20 membres atteinte. Passez au plan Club pour continuer.'
  }
  return 'Impossible d\'ajouter un membre.'
}
