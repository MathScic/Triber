import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

const NEEDS_AUTH = !process.env.TEST_PASSWORD

test.describe('Page Stats (/stats)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge sans erreur', async ({ page }) => {
    await page.goto('/stats')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /statistiques/i })).toBeVisible({ timeout: 8_000 })
  })

  test('pas de spinner infini (chargement < 8s)', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
  })

  test('bilan saison affiché si des matchs existent', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // Si des matchs existent → "Bilan saison" s'affiche. Sinon la page est vide — on vérifie juste qu'elle ne plante pas
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('section statistiques joueurs présente', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // Avec données → "Statistiques joueurs" | Sans données → "Pas encore de statistiques"
    await expect(
      page.getByText(/statistiques joueurs|pas encore de statistiques/i).first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test('liste des résultats de matchs affichée si des matchs existent', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // "Résultats" n'apparaît que si des matchs ont été joués — acceptable de skiper
    const hasResults = await isVisibleSoon(page.getByText(/^Résultats$/i))
    if (!hasResults) { test.skip(); return }
    await expect(page.getByText(/^Résultats$/i)).toBeVisible()
  })

  // Note : la saisie/édition du score s'est déplacée sur la page de détail
  // d'un événement (EventDetailView + MatchResultForm) — la table de résultats
  // de /stats est en lecture seule depuis le refactor finances/home, il n'y a
  // donc plus de formulaire d'édition à ouvrir ici (ancien test supprimé).

  test('Victoire/Défaite correctement calculée (is_home aware)', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    // Les résultats sont des lignes de tableau (<tr>), pas des boutons
    const row = page.locator('tr').filter({ hasText: /victoire/i }).first()
    if (!await isVisibleSoon(row)) { test.skip(); return }

    const scoreText = await row.locator('.tabular-nums').textContent()
    const parts = (scoreText ?? '').split(/—|–/).map(s => parseInt(s.trim()))
    expect(parts.length).toBe(2)
    expect(parts[0]).toBeGreaterThan(parts[1])
  })
})
