import { test, expect } from '@playwright/test'

test.describe('Organisation', () => {
  // Ces tests vérifient les redirections sans compte connecté
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
    // Vérifie qu'il existe un lien ou bouton vers /register
    const registerLink = page.getByRole('link', { name: /inscription|s'inscrire|créer/i })
      .or(page.locator('a[href*="register"]'))
    await expect(registerLink).toBeVisible()
  })

  test('page register : lien vers connexion visible', async ({ page }) => {
    await page.goto('/register')
    const loginLink = page.getByRole('link', { name: /connexion|se connecter|déjà/i })
      .or(page.locator('a[href*="login"]'))
    await expect(loginLink).toBeVisible()
  })
})
