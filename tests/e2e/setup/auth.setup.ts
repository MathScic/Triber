import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/user.json')

const EMAIL = process.env.TEST_EMAIL ?? 'scicluna.mathieu@hotmail.fr'
const PASSWORD = process.env.TEST_PASSWORD ?? ''

setup('authentification — sauvegarde de la session', async ({ page }) => {
  if (!PASSWORD) {
    console.warn('⚠️  TEST_PASSWORD non défini — ajoutez TEST_PASSWORD=... dans .env.local')
    // Sauvegarde un état vide pour éviter une erreur fatale
    await page.context().storageState({ path: authFile })
    return
  }

  await page.goto('/login')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/mot de passe/i).fill(PASSWORD)
  await page.getByRole('button', { name: /connexion|se connecter/i }).click()

  // Attend la redirection vers /home
  await expect(page).toHaveURL(/home/, { timeout: 15_000 })

  // Sauvegarde les cookies et localStorage pour les prochains tests
  await page.context().storageState({ path: authFile })
})
