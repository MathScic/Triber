# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentification >> inscription → redirect vers confirmation email
- Location: tests\e2e\auth.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/email/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e7]: T
          - heading "Triber" [level=1] [ref=e8]
          - paragraph [ref=e9]: Rejoignez des milliers de clubs français
        - generic [ref=e10]:
          - heading "Créer mon compte" [level=2] [ref=e11]
          - generic [ref=e12]:
            - generic [ref=e13]:
              - generic [ref=e14]: Nom
              - textbox "Nom" [active] [ref=e15]:
                - /placeholder: Dupont
                - text: Triber
            - generic [ref=e16]:
              - generic [ref=e17]: Prénom
              - textbox "Prénom" [ref=e18]:
                - /placeholder: Marie
                - text: Test
            - generic [ref=e19]:
              - generic [ref=e20]: Email
              - textbox "Email" [ref=e21]:
                - /placeholder: president@monclub.fr
            - generic [ref=e22]:
              - generic [ref=e23]: Mot de passe
              - textbox "Mot de passe" [ref=e24]:
                - /placeholder: ••••••••
            - generic [ref=e25]:
              - generic [ref=e26]: Confirmer le mot de passe
              - textbox "Confirmer le mot de passe" [ref=e27]:
                - /placeholder: ••••••••
            - button "Créer mon compte" [ref=e28] [cursor=pointer]
            - paragraph [ref=e29]:
              - text: Déjà un compte ?
              - link "Se connecter" [ref=e30] [cursor=pointer]:
                - /url: /login
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37]
  - alert [ref=e40]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Authentification', () => {
  4  |   test('inscription → redirect vers confirmation email', async ({ page }) => {
  5  |     // Email unique à chaque exécution pour éviter les conflits en base
  6  |     const uniqueEmail = `test+${Date.now()}@triber-test.fr`
  7  | 
  8  |     await page.goto('/register')
  9  |     await page.getByPlaceholder('Marie').fill('Test')
  10 |     await page.getByPlaceholder('Dupont').fill('Triber')
> 11 |     await page.getByPlaceholder(/email/i).fill(uniqueEmail)
     |                                           ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  12 |     await page.getByPlaceholder('••••••••').first().fill('TestPassword123!')
  13 |     await page.getByPlaceholder('••••••••').last().fill('TestPassword123!')
  14 |     await page.getByRole('button', { name: /s'inscrire|créer/i }).click()
  15 | 
  16 |     // Vérifie redirect vers confirme OU message d'erreur absent
  17 |     await expect(page).toHaveURL(/confirme|onboarding/, { timeout: 10_000 })
  18 |   })
  19 | 
  20 |   test('accès /home sans connexion → redirect /login', async ({ page }) => {
  21 |     await page.goto('/home')
  22 |     await expect(page).toHaveURL(/login/)
  23 |   })
  24 | 
  25 |   test('accès /members sans connexion → redirect /login', async ({ page }) => {
  26 |     await page.goto('/members')
  27 |     await expect(page).toHaveURL(/login/)
  28 |   })
  29 | 
  30 |   test('accès /events sans connexion → redirect /login', async ({ page }) => {
  31 |     await page.goto('/events')
  32 |     await expect(page).toHaveURL(/login/)
  33 |   })
  34 | 
  35 |   test('page login : formulaire visible', async ({ page }) => {
  36 |     await page.goto('/login')
  37 |     await expect(page.getByLabel(/email/i)).toBeVisible()
  38 |     await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
  39 |     await expect(page.getByRole('button', { name: /connexion|se connecter/i })).toBeVisible()
  40 |   })
  41 | })
  42 | 
```