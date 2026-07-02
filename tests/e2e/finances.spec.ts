import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

const NEEDS_AUTH = !process.env.TEST_PASSWORD

test.describe('Page Finances (/finances)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge sans redirect', async ({ page }) => {
    await page.goto('/finances')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /finances/i })).toBeVisible({ timeout: 8_000 })
  })

  test('compteurs Encaissé et En attente visibles', async ({ page }) => {
    await page.goto('/finances')
    await expect(page.getByText(/encaissé/i)).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(/en attente/i)).toBeVisible({ timeout: 8_000 })
  })

  test('bouton "Nouvelle" cotisation visible (admin)', async ({ page }) => {
    await page.goto('/finances')
    // L'admin a un bouton "Nouvelle" pour créer une cotisation
    await expect(page.getByRole('button', { name: /nouvelle|créer|ajouter/i }).first()).toBeVisible({ timeout: 8_000 })
  })

  test('formulaire de création de cotisation s\'ouvre au clic', async ({ page }) => {
    await page.goto('/finances')
    const btn = page.getByRole('button', { name: /nouvelle|créer|ajouter/i }).first()
    if (!await isVisibleSoon(btn)) { test.skip(); return }
    await btn.click()
    // Le modal de création doit apparaître
    await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5_000 })
  })
})
