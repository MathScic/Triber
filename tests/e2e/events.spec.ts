import { test, expect } from '@playwright/test'
import { isVisibleSoon } from './helpers'

const NEEDS_AUTH = !process.env.TEST_PASSWORD
let createdEventTitle = ''

test.describe('Page Événements (/events)', () => {
  test.skip(NEEDS_AUTH, 'TEST_PASSWORD non défini')

  test('charge la liste des événements', async ({ page }) => {
    await page.goto('/events')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByRole('heading', { name: /événements/i })).toBeVisible({ timeout: 8_000 })
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
  })

  test('bouton "Créer" visible pour l\'admin', async ({ page }) => {
    await page.goto('/events')
    // Attend que le rôle soit chargé (canCreate devient vrai après fetch)
    await expect(page.getByRole('button', { name: /\+ créer|créer/i })).toBeVisible({ timeout: 12_000 })
  })

  test('ouvrir le formulaire de création d\'événement', async ({ page }) => {
    await page.goto('/events')
    // .first() car un 2ème bouton "Créer le premier événement" peut exister
    await page.getByRole('button', { name: /\+ créer|créer/i }).first().click({ timeout: 12_000 })
    await expect(page.getByPlaceholder(/FC Normandie|vs Caen/i)).toBeVisible({ timeout: 5_000 })
  })

  test('créer un match de test et vérifier qu\'il apparaît', async ({ page }) => {
    createdEventTitle = `TEST MATCH ${Date.now()}`
    await page.goto('/events')
    await page.getByRole('button', { name: /\+ créer|créer/i }).first().click({ timeout: 12_000 })

    const titleField = page.getByPlaceholder(/FC Normandie|vs Caen/i).or(page.getByLabel(/titre/i))
    await titleField.fill(createdEventTitle)

    const typeSelect = page.getByRole('combobox').or(page.getByLabel(/type/i)).first()
    if (await isVisibleSoon(typeSelect)) {
      await typeSelect.selectOption({ label: 'Match' }).catch(() => typeSelect.selectOption('match'))
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    const dateField = page.locator('input[type="date"]').first()
    if (await isVisibleSoon(dateField)) await dateField.fill(dateStr)

    const timeField = page.locator('input[type="time"]').first()
    if (await isVisibleSoon(timeField)) await timeField.fill('15:00')

    await page.getByRole('button', { name: /créer|ajouter|valider|sauvegarder/i }).last().click()
    await page.waitForTimeout(2_000)

    await expect(page.getByText(createdEventTitle)).toBeVisible({ timeout: 8_000 })
  })

  test('cliquer sur un événement → page de détail', async ({ page }) => {
    await page.goto('/events')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    // Le titre de chaque carte est un lien vers /events/[id]
    const firstEventLink = page.locator('a[href^="/events/"]').first()
    if (await isVisibleSoon(firstEventLink)) {
      await firstEventLink.click()
      await expect(page).toHaveURL(/events\/[a-z0-9-]+/, { timeout: 8_000 })
      await expect(page.locator('main').first()).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('boutons de présence visibles sur les cartes d\'événements', async ({ page }) => {
    await page.goto('/events')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })
    // Les boutons de présence (Présent / Absent / Attente) doivent être visibles sur la liste
    const presentBtn = page.getByRole('button', { name: /présent/i }).first()
    if (await isVisibleSoon(presentBtn)) {
      await expect(presentBtn).toBeVisible()
    } else {
      // Pas d'événement existant
      test.skip()
    }
  })

  test('confirmer sa présence à un événement', async ({ page }) => {
    await page.goto('/events')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    const presentBtn = page.getByRole('button', { name: /présent/i }).first()
    if (!await isVisibleSoon(presentBtn)) { test.skip(); return }

    await presentBtn.click()
    await page.waitForTimeout(1_500)
    await expect(page.getByText(/erreur|error/i)).toHaveCount(0)
  })

  test('supprimer l\'événement de test créé précédemment', async ({ page }) => {
    if (!createdEventTitle) { test.skip(); return }

    await page.goto('/events')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8_000 })

    if (!await isVisibleSoon(page.getByText(createdEventTitle).first())) {
      test.skip(); return
    }

    // Trouve la carte contenant notre titre
    const card = page.locator('.bg-white.rounded-2xl').filter({
      has: page.getByText(createdEventTitle),
    }).first()

    // Ouvre le menu 3-points (aria-label="Options")
    await card.getByRole('button', { name: 'Options' }).click()

    // Clique sur "Supprimer" dans le dropdown
    await page.getByRole('menuitem', { name: /supprimer/i }).click()

    // Confirme dans la modale
    await expect(page.getByText('Supprimer cet événement ?')).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: 'Supprimer' }).last().click()

    await page.waitForTimeout(2_000)
    await expect(page.getByText(createdEventTitle).first()).not.toBeVisible({ timeout: 5_000 })
  })
})
