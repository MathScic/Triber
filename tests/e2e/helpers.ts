import type { Locator } from '@playwright/test'

// Attend qu'un élément devienne visible sans faire échouer le test — évite le
// faux-négatif classique où `.isVisible()` (contrôle immédiat, sans retry) est
// appelé juste après un rendu client React encore en cours, skippant le test
// à tort avant que le contenu asynchrone (fetch Supabase, etc.) n'ait fini de
// s'afficher.
export async function isVisibleSoon(locator: Locator, timeout = 5_000): Promise<boolean> {
  return locator.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false)
}
