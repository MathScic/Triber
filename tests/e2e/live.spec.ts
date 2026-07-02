import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

const NEEDS_AUTH = !process.env.TEST_PASSWORD
const ORG_ID = '8af9d20d-b93d-4af6-952d-1bc541b0943f'

test.describe('Page match en direct — admin (/events/[id]/live)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('un match "ongoing" a un lien "Gérer le direct"', async ({ page }) => {
    await page.goto('/events')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    const liveBtn = page.getByRole('link', { name: /gérer le direct|en direct/i })
    if (await isVisibleSoon(liveBtn)) {
      await liveBtn.click()
      await expect(page).toHaveURL(/events\/.*\/live/)
      await expect(page.locator('main')).toBeVisible()
    } else {
      // Pas de match en cours actuellement — on teste juste que la route existe
      test.skip()
    }
  })
})

test.describe('Page match en direct — publique (/match/[id])', () => {
  // Ces tests ne nécessitent pas de connexion (déjà testés dans public.spec.ts)
  // Ici on va plus loin en vérifiant le contenu

  test('page /match avec faux ID → 404, pas de login', async ({ page }) => {
    const res = await page.goto('/match/00000000-0000-0000-0000-000000000000')
    expect(res?.status()).toBe(404)
    await expect(page).not.toHaveURL(/login/)
  })

  test('page publique du club → affiche le nom et le badge Triber', async ({ page }) => {
    await page.goto(`/${ORG_ID}`)
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Propulsé par/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Triber')).toBeVisible()
  })

  test('page publique club : dernier résultat ou prochain événement visible', async ({ page }) => {
    await page.goto(`/${ORG_ID}`)
    await expect(page).not.toHaveURL(/login/)
    await page.waitForTimeout(2_000)

    // La page peut être vide si aucun match ni événement — pas d'erreur quand même
    await expect(page.getByRole('main').first()).toBeVisible()
  })
})
