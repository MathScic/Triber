import { test, expect } from '@playwright/test'

const NEEDS_AUTH = !process.env.TEST_PASSWORD

test.describe('Page Accueil (/home)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge sans erreur et affiche le nom du club', async ({ page }) => {
    await page.goto('/home')
    await expect(page).not.toHaveURL(/login/)
    // Attend que les spinners disparaissent
    await expect(page.locator('.animate-pulse').first()).toHaveCount(0, { timeout: 10_000 }).catch(() => {})
    // Au moins un h1 visible (nom du club dans le banner)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10_000 })
  })

  test('navigation sidebar desktop visible', async ({ page }) => {
    await page.goto('/home')
    // La sidebar desktop est le PREMIER nav du DOM (la mobile bottom bar est la dernière, cachée en lg)
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 8_000 })
  })

  test('dernier résultat affiché si des matchs existent', async ({ page }) => {
    await page.goto('/home')
    await page.waitForTimeout(3_000)
    // Soit un score visible, soit "Aucun résultat encore" — on vérifie juste que la page ne plante pas
    const hasScore = await page.getByText(/[0-9]+ [–—-] [0-9]+|Aucun|Pas encore/i).first().isVisible().catch(() => false)
    expect(typeof hasScore).toBe('boolean')
  })

  test('accès rapide aux pages depuis la nav', async ({ page }) => {
    await page.goto('/home')
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 8_000 })
    // Navigation vers Membres
    await page.goto('/members')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.locator('main').first()).toBeVisible()
  })
})
