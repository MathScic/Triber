import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

// Charge .env.local pour que TEST_PASSWORD soit disponible dans les tests
loadEnvConfig(process.cwd())

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 35_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    // 1. Setup : login une seule fois et sauvegarde l'état dans .auth/user.json
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts/,
    },

    // 2. Tests nécessitant une connexion (utilisent l'état sauvegardé)
    {
      name: 'chromium-auth',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      testIgnore: ['**/setup/**', '**/public.spec.ts', '**/auth.spec.ts', '**/organization.spec.ts', '**/dashboard.spec.ts'],
    },

    // 3. Tests publics / redirections sans session (sans état de connexion)
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/public.spec.ts', '**/auth.spec.ts', '**/organization.spec.ts', '**/dashboard.spec.ts'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
