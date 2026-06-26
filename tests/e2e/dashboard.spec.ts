import { test, expect } from '@playwright/test'

test.describe('Protection des routes (sans connexion)', () => {
  const protectedRoutes = ['/home', '/members', '/events', '/stats', '/finances', '/settings']

  for (const route of protectedRoutes) {
    test(`${route} → redirige vers /login si non connecté`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/login/, { timeout: 8_000 })
    })
  }

  test('/login et /register accessibles sans connexion', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()

    await page.goto('/register')
    await expect(page.getByRole('button', { name: /s'inscrire|créer/i })).toBeVisible()
  })
})
