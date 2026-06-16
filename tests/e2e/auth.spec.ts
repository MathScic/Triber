import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('inscription → redirect vers confirmation email', async ({ page }) => {
    // Email unique à chaque exécution pour éviter les conflits en base
    const uniqueEmail = `test+${Date.now()}@triber-test.fr`

    await page.goto('/register')
    await page.getByPlaceholder('Marie').fill('Test')
    await page.getByPlaceholder('Dupont').fill('Triber')
    await page.getByPlaceholder(/email/i).fill(uniqueEmail)
    await page.getByPlaceholder('••••••••').first().fill('TestPassword123!')
    await page.getByPlaceholder('••••••••').last().fill('TestPassword123!')
    await page.getByRole('button', { name: /s'inscrire|créer/i }).click()

    // Vérifie redirect vers confirme OU message d'erreur absent
    await expect(page).toHaveURL(/confirme|onboarding/, { timeout: 10_000 })
  })

  test('accès /home sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/login/)
  })

  test('accès /members sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/members')
    await expect(page).toHaveURL(/login/)
  })

  test('accès /events sans connexion → redirect /login', async ({ page }) => {
    await page.goto('/events')
    await expect(page).toHaveURL(/login/)
  })

  test('page login : formulaire visible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /connexion|se connecter/i })).toBeVisible()
  })
})
