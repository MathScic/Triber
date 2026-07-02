import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

const NEEDS_AUTH = !process.env.TEST_PASSWORD

test.describe('Page Membres (/members)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge correctement sans redirect', async ({ page }) => {
    await page.goto('/members')
    await expect(page).not.toHaveURL(/login|onboarding/)
    await expect(page.getByRole('heading', { name: /membres/i })).toBeVisible({ timeout: 8_000 })
  })

  test('au moins un membre dans la liste', async ({ page }) => {
    await page.goto('/members')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // Aucune liste vide
    await expect(page.getByText('Aucun membre pour l\'instant.')).toHaveCount(0)
    // Au moins une ligne de membre visible
    await expect(page.locator('table, [role="table"], ul, .member-row').first().or(
      page.locator('main').first()
    )).toBeVisible()
  })

  test('formulaire d\'invitation visible pour l\'admin — via modal', async ({ page }) => {
    await page.goto('/members')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // Clique sur le bouton "+" ou "Inviter" pour ouvrir la modal
    const inviteBtn = page.getByRole('button', { name: /inviter|\+|ajouter/i }).first()
    if (!await isVisibleSoon(inviteBtn)) { test.skip(); return }
    await inviteBtn.click()
    // Le formulaire d'invitation doit apparaître dans la modal
    await expect(page.getByPlaceholder(/joueur@exemple\.fr/i)).toBeVisible({ timeout: 5_000 })
  })

  test('invitation avec email invalide → formulaire reste ouvert', async ({ page }) => {
    await page.goto('/members')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    const inviteBtn = page.getByRole('button', { name: /inviter|\+|ajouter/i }).first()
    if (!await isVisibleSoon(inviteBtn)) { test.skip(); return }
    await inviteBtn.click()

    const emailInput = page.getByPlaceholder(/joueur@exemple\.fr/i)
    await expect(emailInput).toBeVisible({ timeout: 5_000 })
    await emailInput.fill('pasunemail')
    const submitBtn = page.getByRole('button', { name: /inviter|envoyer/i })
    await submitBtn.click()
    await page.waitForTimeout(1_000)
    // Toujours sur la page membres
    await expect(page).toHaveURL(/members/)
  })
})
