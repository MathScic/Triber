import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

test.describe('Authentification', () => {
  test('page inscription : formulaire visible et soumission possible', async ({ page }) => {
    await page.goto('/register')
    // Vérifie que tous les champs du formulaire sont présents
    await expect(page.getByPlaceholder('Dupont')).toBeVisible()
    await expect(page.getByPlaceholder('Marie')).toBeVisible()
    await expect(page.getByPlaceholder('president@monclub.fr')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /créer mon compte/i })).toBeVisible()
  })

  test('inscription avec email unique → redirect ou message de confirmation', async ({ page }) => {
    // Test d'intégration — nécessite que Supabase accepte les inscriptions
    const uniqueEmail = `test+${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('Dupont').fill('Triber')
    await page.getByPlaceholder('Marie').fill('Test')
    await page.getByPlaceholder('president@monclub.fr').fill(uniqueEmail)
    await page.getByPlaceholder('••••••••').first().fill('TestPassword123!')
    await page.getByPlaceholder('••••••••').last().fill('TestPassword123!')
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Attend redirect vers confirme OU message de succès
    await page.waitForTimeout(3_000)
    const url = page.url()
    const hasConfirmMessage = await isVisibleSoon(page.getByText(/confirme|vérifiez|email envoyé/i))
    expect(url.includes('confirme') || url.includes('onboarding') || hasConfirmMessage).toBeTruthy()
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
