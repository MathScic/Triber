# Triber

Application web de gestion tout-en-un pour clubs sportifs amateurs et associations françaises.

Gestion des membres, événements, résultats, cotisations en ligne, match en direct public — dans une seule application, depuis son téléphone.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript strict |
| Style | Tailwind CSS 4 + shadcn/ui |
| Base de données | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (email + password, PKCE) |
| Paiements | Stripe + Stripe Connect |
| Emails | Resend (React Email) |
| Tests unitaires | Vitest (57 tests) |
| Tests E2E | Playwright (53 tests) |
| Déploiement | Vercel |

---

## Démarrage local

```bash
git clone https://github.com/MathScic/Triber
cd Triber
npm install
cp .env.local.example .env.local   # renseigner les variables
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Variables d'environnement

Créer `.env.local` à la racine :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CLUB=price_...

# Resend
RESEND_API_KEY=re_...

# Tests E2E
TEST_PASSWORD=MotDePasseTest123!
```

---

## Base de données

Appliquer les migrations dans l'ordre sur votre projet Supabase :

```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans Supabase Dashboard → SQL Editor
# Exécuter chaque fichier de supabase/migrations/ dans l'ordre
```

24 migrations, de `001_organizations.sql` à `024_performance_indexes.sql`.
RLS activé sur toutes les tables.

---

## Tests

```bash
# Unitaires (logique métier)
npm test

# E2E (parcours utilisateur complets)
npm run test:e2e

# TypeScript
npm run typecheck

# Lint
npm run lint
```

---

## Structure du projet

```
app/
  (auth)/          — Inscription, connexion
  (dashboard)/     — Interface admin (membres, events, stats, finances, settings)
  (public)/        — Pages sans connexion (club public, match en direct)
  api/             — Routes API Next.js
  auth/callback/   — Échange PKCE Supabase

components/        — Composants par domaine (events, finances, match, members…)
lib/
  hooks/           — Toute la logique métier (useAuth, useEvents, useContributions…)
  supabase/        — Clients browser et server
  stripe/          — Config et webhook handler
  email.ts         — Envois Resend
emails/            — Templates React Email
supabase/
  migrations/      — 24 migrations SQL atomiques
tests/
  unit/            — Vitest
  e2e/             — Playwright
```

---

## Fonctionnalités MVP

- **Membres** — invitation par email, rôles (admin / member_active / member), compteur plan
- **Événements** — création, confirmation de présence, notifications
- **Match en direct** — composition, timer, buts/cartons, page publique partageable sans compte
- **Stats** — bilan saison, classement buteurs, résultats
- **Finances** — cotisations en ligne (Stripe), suivi paiements, buvette
- **Branding** — logo, couleurs, slogan personnalisables par organisation
- **Pages publiques** — page club et match en direct accessibles sans connexion

---

## Plans

| Plan | Membres max | Prix |
|---|---|---|
| Gratuit | 20 | 0€/mois |
| Club | Illimité | 11,99€/mois + 1,5% sur cotisations |

---

## Déploiement production

1. Appliquer la migration `024_performance_indexes.sql` sur Supabase
2. Supabase → Authentication → activer "Confirm email"
3. Créer les prix live Stripe → récupérer `price_live_...`
4. Créer le webhook Stripe → `https://votre-domaine/api/webhooks/stripe`
5. Renseigner les variables d'environnement dans Vercel
6. `git push origin main` → déploiement automatique Vercel

---

Mathieu Scicluna — [scicluna.mathieu@hotmail.fr](mailto:scicluna.mathieu@hotmail.fr)
