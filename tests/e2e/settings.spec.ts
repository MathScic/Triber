import { test, expect } from '@playwright/test'

const NEEDS_AUTH = !process.env.TEST_PASSWORD
const ORG_UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

test.describe('Page Paramètres (/settings)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge sans redirect', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /paramètres/i })).toBeVisible({ timeout: 8_000 })
  })

  test('section Organisation visible SANS scroll (en premier)', async ({ page }) => {
    await page.goto('/settings')
    // La section Organisation doit être dans le viewport sans scroll
    const orgHeading = page.getByRole('heading', { name: /organisation/i })
    await expect(orgHeading).toBeVisible({ timeout: 8_000 })
    // Vérifie que c'est dans le viewport (position Y < 600)
    const box = await orgHeading.boundingBox()
    expect(box?.y).toBeLessThan(600)
  })

  test('nom du club affiché dans la section Organisation', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/La brehalaise/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('plan actuel affiché (Gratuit / Club)', async ({ page }) => {
    await page.goto('/settings')
    // Le plan apparaît dans la section Organisation : "Gratuit", "Club 11,99€/mois", ou "Pro"
    await expect(page.getByText(/gratuit|club 11|pro/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('lien page publique présent et contient un UUID', async ({ page }) => {
    await page.goto('/settings')
    const link = page.getByRole('link').filter({ hasText: /localhost|triber\.app/i }).first()
    await expect(link).toBeVisible({ timeout: 8_000 })
    const href = await link.getAttribute('href')
    expect(href).toMatch(ORG_UUID_REGEX)
  })

  test('lien page publique ouvre la page du club (sans login)', async ({ page, context }) => {
    await page.goto('/settings')
    const link = page.getByRole('link').filter({ hasText: /localhost|triber\.app/i }).first()
    const href = await link.getAttribute('href')
    if (!href) { test.skip(); return }

    // Ouvre dans un nouvel onglet sans session
    const publicPage = await context.newPage()
    await publicPage.context().clearCookies()
    await publicPage.goto(href)
    await expect(publicPage).not.toHaveURL(/login/)
    await expect(publicPage.getByText(/La brehalaise/i)).toBeVisible({ timeout: 10_000 })
    await publicPage.close()
  })

  test('formulaire Branding (logo, couleurs) visible pour l\'admin', async ({ page }) => {
    await page.goto('/settings')
    // Le formulaire de branding doit être présent pour l'admin
    await expect(
      page.getByText(/couleur|logo|branding|personnalisation/i).first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test('bouton déconnexion visible', async ({ page }) => {
    await page.goto('/settings')
    await expect(
      page.getByRole('button', { name: /déconnexion|se déconnecter/i })
    ).toBeVisible({ timeout: 8_000 })
  })

  test('zone de danger visible pour l\'admin', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/zone de danger/i)).toBeVisible({ timeout: 8_000 })
  })
})
