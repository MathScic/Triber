import { test, expect } from '@playwright/test'

// UUID de l'organisation "La brehalaise" (env de test)
const ORG_ID = '8af9d20d-b93d-4af6-952d-1bc541b0943f'

test.describe('Pages publiques (sans connexion)', () => {
  test('page publique du club charge sans connexion', async ({ page }) => {
    await page.goto(`/${ORG_ID}`)
    await expect(page).not.toHaveURL(/login/)
    // Le nom du club doit apparaître
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('page publique du club : propulsé par Triber visible', async ({ page }) => {
    await page.goto(`/${ORG_ID}`)
    await expect(page.getByText(/Propulsé par/i)).toBeVisible({ timeout: 10_000 })
  })

  test('URL inconnue → 404', async ({ page }) => {
    const res = await page.goto('/club-qui-nexiste-vraiment-pas-12345')
    expect(res?.status()).toBe(404)
  })

  test('page match live : accessible sans connexion', async ({ page }) => {
    // Test avec un faux ID — on vérifie juste que la route existe et répond (200 ou 404, pas de redirect /login)
    await page.goto('/match/00000000-0000-0000-0000-000000000000')
    await expect(page).not.toHaveURL(/login/)
  })
})
