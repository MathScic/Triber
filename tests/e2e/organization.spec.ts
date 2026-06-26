import { test, expect } from '@playwright/test'

test.describe('Organisation', () => {
  test('accès /onboarding sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/login/)
  })

  test('accès /settings sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/login/)
  })

  test('accès /finances sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/finances')
    await expect(page).toHaveURL(/login/)
  })

  test('page login : lien vers inscription visible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('a[href*="register"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test('page register : lien vers connexion visible', async ({ page }) => {
    await page.goto('/register')
    // Deux liens vers /login existent : "Retour à la connexion" et "Se connecter"
    await expect(page.locator('a[href*="login"]').first()).toBeVisible({ timeout: 8_000 })
  })
})
