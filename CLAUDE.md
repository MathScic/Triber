# TRIBER — CLAUDE.md

> Document de référence technique et produit pour Claude Code.
> À placer à la racine du repo. Lire intégralement avant de toucher au code.

---

## 1. VISION PRODUIT

### Qu'est-ce que Triber ?

Triber est une application mobile **tout-en-un** de gestion pour clubs sportifs amateurs, associations locales et petites entreprises françaises.

**Le problème réel :** aujourd'hui, un président de club jongle en permanence entre 4 ou 5 outils qui ne se parlent pas — un groupe WhatsApp incontrôlable pour les convocations, un fichier Excel pour les membres, des espèces pour les cotisations, des emails pour les annonces, et rien pour les stats. C'est du temps perdu, des erreurs, et une vraie frustration pour des bénévoles qui gèrent déjà beaucoup.

**Ce que Triber change :** tout se passe dans une seule application, depuis son téléphone. Le président convoque, le trésorier encaisse, le joueur confirme sa présence, l'entraîneur consulte les stats — sans jamais ouvrir un ordinateur. C'est ça l'argument numéro un : **la simplicité du tout-en-un, dans la poche**.

---

### Priorité absolue : le mobile d'abord

Triber est pensé et conçu **téléphone en premier**. L'écrasante majorité des utilisateurs — joueurs, parents, bénévoles — n'ouvriront jamais un ordinateur pour gérer leur club. Ils ont leur téléphone. L'application doit donc être parfaitement fluide, rapide et intuitive sur mobile et tablette.

La version web a **deux rôles complémentaires** :
1. **Dashboard admin grand écran** — pour les présidents et trésoriers qui préfèrent l'ordinateur (gestion des membres, finances, paramètres)
2. **Pages publiques** — accessibles sans compte, partageables par lien : page du club et match en direct pour les supporters, parents, journalistes qui n'ont pas l'app

Chaque écran, chaque formulaire, chaque action doit être pensé pour **un pouce, un téléphone, 10 secondes maximum**.

---

### Le différenciateur secondaire : le White-Label

En plus du tout-en-un mobile, chaque organisation peut personnaliser son espace à ses couleurs — logo, couleurs, slogan. C'est un argument de différenciation face aux concurrents, mais ce n'est pas ce qui justifie le prix. Ce qui justifie le prix, c'est le temps gagné et la simplicité apportée au quotidien.

---

### Deux modes dans un seul produit

**Mode Club / Association**
Destiné aux clubs sportifs (football, basket, tennis, pêche, rugby...) et aux associations locales (culturelles, parentales, caritatives). Le vocabulaire, les modules et les fonctionnalités sont adaptés au monde associatif : adhérents, cotisations, convocations, résultats de matchs, statistiques sportives.

**Mode Entreprise**
Le même cœur technique, mais adapté au contexte professionnel : équipes, plannings, objectifs commerciaux, communication interne. Un président de club qui gère aussi une PME peut utiliser Triber pour les deux, avec le même compte.

---

### Le marché cible

- France : **1,3 million d'associations** déclarées
- Environ **300 000 clubs sportifs** affiliés à des fédérations
- Segment cible prioritaire : clubs amateurs régionaux de **50 à 300 membres**
- Démarrage géographique : **Normandie** (réseau local, prospection directe)
- Extension : national via bouche-à-oreille et référencement

---

### Modèle économique

Deux plans uniquement. Simple, lisible, sans surprise.

| Plan   | Membres max | Prix mensuel | Commission sur cotisations      |
| ------ | ----------- | ------------ | ------------------------------- |
| `free` | 20          | 0€           | 0%                              |
| `club` | Illimité    | 11,99€       | 1,5% sur cotisations encaissées |

**Le limiteur est toujours le `member_count` total**, jamais le nombre d'admins. Un club de 50 joueurs ne peut pas rester gratuit — il doit passer au plan Club.

**La commission de 1,5% :**
Elle s'applique uniquement sur les cotisations encaissées via Stripe dans l'application. Elle est prélevée automatiquement par Stripe Connect au moment du paiement. Elle ne s'applique pas à l'abonnement mensuel.

Exemple concret : un club encaisse 5 000€/an → 75€ de commission annuelle (6,25€/mois). Total réel : ~18,24€/mois. HelloAsso prend jusqu'à 4% sur les mêmes 5 000€, soit 200€/an — Triber est moins cher dès 150€ de cotisations encaissées par mois.

**Consentement obligatoire à la souscription :**
Une case à cocher non pré-cochée, affichée en gros sur l'écran de paiement :

> ✅ _"Je comprends que Triber perçoit une commission de 1,5% sur les cotisations encaissées via la plateforme, en plus de l'abonnement mensuel de 11,99€. Ce montant est prélevé automatiquement à chaque transaction."_

Sans cette case cochée → souscription techniquement impossible. Le consentement est horodaté et stocké en base de données. C'est une obligation légale et une protection pour Triber.

**Objectif financier :** 50 clubs au plan Club = 600€/mois de MRR récurrent. Cible 18 mois après lancement.

---

### Positionnement concurrentiel

|                         | Scoreenco | HelloAsso | Assoconnect | **Triber** |
| ----------------------- | --------- | --------- | ----------- | ---------- |
| **Tout-en-un**          | ❌        | ❌        | Partiel     | ✅         |
| **Mobile natif first**  | ✅        | ❌        | ❌          | ✅         |
| Cotisations en ligne    | ❌        | ✅        | ✅          | ✅         |
| Convocations push       | ❌        | ❌        | ❌          | ✅         |
| Stats sportives joueurs | Basique   | ❌        | ❌          | ✅         |
| Galerie médias          | ❌        | ❌        | ❌          | ✅         |
| Mode Entreprise         | ❌        | ❌        | Partiel     | ✅         |
| White-label visuel      | ❌        | ❌        | ❌          | ✅         |
| Prix entrée de gamme    | Gratuit   | Gratuit   | 29€/mois    | 0-12€/mois |

---

## 2. UTILISATEURS ET RÔLES

### Les 3 rôles

| Rôle            | Exemples concrets                                | Ce qu'ils font dans l'app                              |
| --------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `admin`         | Président, gérant, trésorier principal           | Tout : paramètres, membres, finances, branding         |
| `member_active` | Entraîneur, trésorier adjoint, community manager | Saisie résultats, gestion événements, stats            |
| `member`        | Joueur, parent d'un joueur, employé              | Lecture, confirmation de présence, paiement cotisation |

### Parcours utilisateur type — Club de foot

1. Le président crée un compte → choisit "Mode Club"
2. Il personnalise l'espace : logo du club, couleurs, slogan, photo du stade
3. Il invite ses membres par email (joueurs, staff)
4. Le community manager saisit les résultats après chaque match
5. Les joueurs reçoivent une notification push → confirment leur présence au prochain match
6. Le trésorier envoie les cotisations en ligne → l'argent arrive sur le compte du club
7. L'entraîneur consulte les stats : meilleur buteur, temps de jeu, classement

### Contrainte UX critique

L'application doit être **utilisable par un président de club de 65 ans**. Chaque action importante doit tenir en 3 taps maximum sur mobile. Les formulaires sont courts, les labels sont clairs, aucun jargon technique.

---

## 3. FONCTIONNALITÉS

### Module Accueil

- Fil d'actualité de l'organisation (brandé aux couleurs du club)
- Affichage du dernier résultat de match
- Prochain événement en avant-première
- Top 3 buteurs de la saison
- Accès rapide aux actions fréquentes

### Module Membres

- Liste des adhérents avec rôles et statuts
- Invitation par email
- Changement de rôle par l'admin
- Compteur automatique `member_count` (déclenche les limites de plan)
- Fiche profil individuelle (nom, photo, téléphone, stats personnelles)

### Module Événements

- Calendrier des matchs, entraînements, réunions, sorties
- Création d'un événement : titre, type, date, lieu, adversaire (si match)
- Confirmation de présence : Présent / Absent / En attente
- Notification push automatique 24h avant l'événement

### Module Résultats et Stats

- Saisie du score post-match en moins de 10 secondes (écran ultra-simple)
- Saisie des statistiques joueurs : buts, passes, temps de jeu, cartons
- Classements internes automatiques : meilleur buteur, meilleur passeur, plus assidu
- Classement championnat (saisi manuellement par le CM — pas d'API externe au MVP)
- Visualisation par saison

### Module Finances

- Création de lignes de cotisation (ex : "Cotisation saison 2026-2027 — 80€")
- Paiement en ligne sécurisé via Stripe
- L'argent va directement sur le RIB du club (Stripe Connect)
- Suivi des paiements : en attente / payé / en échec
- Export de l'état des paiements (PDF)

### Module Médias

- Galerie photos par événement
- Upload depuis mobile ou web
- Légende optionnelle
- Affichage chronologique — pas de fil algorithmique

### Module Messagerie

- Annonces push de l'admin vers tous les membres
- Discussions internes par groupe
- Notifications push sur mobile

### Page publique du club (sans connexion)

- URL partageable : `triber.app/[club-slug]`
- Nom, logo et couleurs du club
- Dernier résultat de match
- Prochain événement
- Accessible sans compte — pour recrutement, sponsors, supporters

### Module Match en direct — web public (sans connexion)

- URL partageable : `triber.app/match/[id]` — le coach envoie ce lien dans le groupe WhatsApp
- Score mis à jour en temps réel via Supabase Realtime
- Composition du match : titulaires et remplaçants avec numéro de maillot (ex : `9 - M.Scicluna`)
- Événements au fil du match : buts, cartons
- Accessible sans compte — supporters, parents, journalistes qui n'ont pas l'app mobile

### Module Branding (admin uniquement)

- Upload du logo (format carré recommandé)
- Sélection de 2 couleurs (primaire + secondaire) via color picker
- Saisie du slogan
- Upload de la photo de couverture
- Aperçu en temps réel avant validation
- Application instantanée sur toute l'interface

### Mode Entreprise (plan Pro)

Mêmes modules, vocabulaire adapté :

- Membres → Équipe
- Cotisations → Frais / Dépenses
- Matchs → Réunions / Rendez-vous
- Stats sportives → Objectifs et performances commerciales

---

## 4. STACK TECHNIQUE

### Base de départ

Ce projet est initialisé depuis **MathScic/NextJs-Starter-kit** qui inclut déjà :

- Next.js 14+ App Router + TypeScript strict
- Tailwind CSS + tailwindcss-animate
- shadcn/ui (components.json configuré)
- ESLint + Prettier + Husky (lint avant commit)
- CI GitHub Actions (lint + typecheck + build)

Ne jamais reconfigurer ce qui existe déjà dans le starter.

### Stack complète

| Couche             | Technologie               | Rôle                         |
| ------------------ | ------------------------- | ---------------------------- |
| Web                | Next.js 14 App Router     | Frontend + API Routes        |
| Style              | Tailwind CSS + shadcn/ui  | UI composants                |
| Mobile             | Expo (React Native)       | iOS + Android                |
| UI mobile          | NativeWind                | Tailwind sur Expo            |
| Base de données    | Supabase PostgreSQL       | Données + Auth + Storage     |
| Auth               | Supabase Auth             | Sessions, JWT, RLS           |
| Biométrie          | expo-local-authentication | Face ID / empreinte (mobile) |
| Stockage           | Supabase Storage          | Logos, photos, avatars       |
| Paiements          | Stripe + Stripe Connect   | Cotisations → compte club    |
| Emails             | Resend                    | Invitations, convocations    |
| Push               | Expo Push Notifications   | Alertes mobiles              |
| Tests unitaires    | Vitest                    | Logique métier               |
| Tests E2E          | Playwright                | Parcours web                 |
| CI                 | GitHub Actions            | Déjà configuré               |
| Déploiement web    | Vercel                    | Auto-deploy GitHub           |
| Déploiement mobile | Expo EAS Build            | App Store + Play Store       |

---

## 5. DESIGN SYSTEM

### Palette Triber

```ts
// À ajouter dans tailwind.config.ts → theme.extend.colors
brand: {
  green:        '#2A9D4E',   // Primaire — vert sport
  'green-light':'#E8F5EEF',  // Fond vert doux
  orange:       '#E8622A',   // Accent — orange chaleureux
  'orange-light':'#FDF0EB',  // Fond orange doux
  dark:         '#1A1F16',   // Texte principal / fond sombre
  cream:        '#FAF7F2',   // Fond général
  sand:         '#F0EBE1',   // Fond sections alternées
  muted:        '#7A8070',   // Texte secondaire
  border:       '#DDD8CE',   // Bordures
}
```

Chaque organisation surcharge `primary` et `secondary` via son profil branding. Ces couleurs sont injectées via CSS custom properties à la racine du layout.

### Typographie

```
Barlow Condensed (700, 800) → Titres, scores, labels sportifs, chiffres clés
Nunito (400, 600, 700)      → Texte courant, descriptions, boutons
```

### Principes UI

- Interface **claire et aérée** — pas de surcharge visuelle
- Chaque action importante : **3 taps maximum** sur mobile
- Formulaires courts : jamais plus de 5 champs visibles à la fois
- Feedback immédiat sur chaque action (toast, loading state, confirmation)
- Accessible : contrastes WCAG AA minimum

---

## 6. STRUCTURE DES DOSSIERS

```
triber/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── home/page.tsx
│   │   ├── members/page.tsx
│   │   ├── events/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── finances/page.tsx
│   │   ├── media/page.tsx
│   │   └── settings/page.tsx
│   ├── (public)/              # Pages sans connexion requise
│   │   ├── [club-slug]/page.tsx   # Page publique du club
│   │   └── match/[id]/page.tsx    # Match en direct public
│   ├── api/
│   │   ├── webhooks/stripe/route.ts
│   │   └── notifications/route.ts
│   └── layout.tsx
│
├── components/
│   ├── ui/              # shadcn/ui — ne pas modifier
│   ├── auth/            # LoginForm, RegisterForm
│   ├── dashboard/       # HomeWidgets, StatsSummary
│   ├── members/         # MemberList, MemberCard, InviteForm
│   ├── events/          # EventCard, EventForm, AttendanceButton
│   ├── stats/           # PlayerRanking, MatchResultForm, StatsChart
│   ├── finances/        # ContributionList, PaymentForm
│   ├── media/           # MediaGallery, UploadButton
│   ├── settings/        # BrandingForm, ColorPicker
│   └── shared/          # Header, Nav, Logo, ThemeProvider
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Client browser
│   │   ├── server.ts    # Client server (cookies)
│   │   └── types.ts     # Types générés CLI
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrganization.ts
│   │   ├── useMembers.ts
│   │   ├── useEvents.ts
│   │   ├── useStats.ts
│   │   └── useFinances.ts
│   └── utils/
│       ├── plan-limits.ts
│       ├── apply-theme.ts
│       └── formatting.ts
│
├── mobile/              # App Expo séparée
│   ├── app/             # Expo Router
│   ├── components/
│   ├── hooks/
│   └── lib/
│
├── supabase/
│   ├── migrations/      # Une migration par feature
│   └── seed.sql
│
├── tests/
│   ├── unit/            # Vitest
│   └── e2e/             # Playwright
│
├── CLAUDE.md
├── .env.example
└── .env.local           # Jamais committé
```

---

## 7. BASE DE DONNÉES

### Règle migrations

Une migration SQL = une feature. Jamais de migration fourre-tout.
Toutes les tables ont RLS activé dès leur création.

```
001_organizations.sql
002_profiles.sql
003_organization_members.sql
004_events.sql
005_event_attendees.sql
006_match_results.sql
007_player_stats.sql
008_contributions.sql
009_media.sql
010_messages.sql
```

### Schéma

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('club', 'enterprise')),
  plan text not null default 'free' check (plan in ('free', 'club', 'pro')),
  member_count int not null default 0,
  logo_url text,
  cover_url text,
  primary_color text default '#2A9D4E',
  secondary_color text default '#E8622A',
  slogan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  push_token text,
  updated_at timestamptz default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('admin', 'member_active', 'member')),
  joined_at timestamptz default now(),
  unique(organization_id, user_id)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  title text not null,
  type text not null check (type in ('match', 'training', 'meeting', 'other')),
  start_at timestamptz not null,
  location text,
  opponent text,
  is_home boolean,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table event_attendees (
  event_id uuid references events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  status text not null check (status in ('confirmed', 'declined', 'pending')),
  primary key (event_id, user_id)
);

create table match_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade unique,
  score_home int not null,
  score_away int not null,
  entered_by uuid references auth.users,
  entered_at timestamptz default now()
);

create table player_stats (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  goals int default 0,
  assists int default 0,
  minutes_played int default 0,
  yellow_cards int default 0,
  red_cards int default 0,
  unique(event_id, user_id)
);

create table contributions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  amount int not null,
  label text not null,
  status text not null check (status in ('pending', 'paid', 'failed')),
  stripe_payment_id text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  event_id uuid references events on delete set null,
  uploader_id uuid references auth.users,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  sender_id uuid references auth.users,
  content text not null,
  sent_at timestamptz default now()
);

-- Composition d'un match (titulaires / remplaçants)
-- Utilisée par triber-mobile et la page publique /match/[id]
create table match_lineups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  organization_member_id uuid references organization_members on delete cascade,
  is_starter boolean not null default true,
  unique(event_id, organization_member_id)
);
```

> **Note — Champs additionnels triber-mobile :** le projet `triber-mobile` a étendu certaines tables en production. Champs à connaître :
> - `events` : `status text` ('upcoming' | 'ongoing' | 'finished'), `started_at timestamptz`
> - `organization_members` : `jersey_number int`, `category text`
> - `profiles` : `invite_code text`
>
> Ces champs existent déjà en base. Ne pas les recréer en migration — les référencer directement.

### RLS — pattern obligatoire sur toutes les tables

```sql
-- Activer sur chaque table
alter table organizations enable row level security;

-- Lecture : membres de l'org uniquement
create policy "members_read_own_org" on events for select
using (
  organization_id in (
    select organization_id from organization_members
    where user_id = auth.uid()
  )
);

-- Écriture : admin et member_active uniquement
create policy "active_members_write" on events for insert
with check (
  exists (
    select 1 from organization_members
    where user_id = auth.uid()
    and organization_id = events.organization_id
    and role in ('admin', 'member_active')
  )
);
```

---

## 8. AUTHENTIFICATION

```
1ère connexion
└── Email + mot de passe
    └── Proposer d'activer Face ID / empreinte (mobile)

Retour < 7 jours → reconnexion automatique silencieuse
  └── Si Face ID activé → validation biométrique d'abord

Inactivité > 7 jours → écran de connexion obligatoire
Compte admin → déconnexion forcée après 30 jours

Tokens → Expo SecureStore (mobile) / httpOnly cookie (web)
Mot de passe → jamais stocké
```

Config Supabase : access token 3600s · refresh token 604800s (7 jours)

### Auth partagée mobile ↔ web

Mobile (`triber-mobile`) et web (`triber`) utilisent le **même projet Supabase**. Un compte créé sur l'app mobile fonctionne automatiquement sur le web avec les mêmes identifiants, et vice versa. Aucune synchronisation à implémenter — c'est natif à Supabase Auth.

Les pages publiques (`/match/[id]`, `/[club-slug]`) ne nécessitent **aucune connexion**. Elles utilisent la clé `anon` Supabase avec des policies RLS en lecture seule sur les données publiques.

---

## 9. ROADMAP PAR ÉTAPES

### Règle de progression

Chaque étape doit être : codée → testée manuellement → test automatique écrit → validée.
Passer à l'étape suivante uniquement quand la précédente est ✅ validée.

---

**Étape 1 — Setup**
Cloner le starter, installer les dépendances Triber, configurer `.env.local`, vérifier `npm run dev`.
Validation : page visible sur localhost:3000. ✅

**Étape 2 — Connexion Supabase**
Créer `lib/supabase/client.ts`, `server.ts`, `types.ts`.
Validation : requête Supabase sans erreur en console. ✅

**Étape 3 — Migrations BDD**
Exécuter les 10 migrations dans l'ordre. RLS activé sur chaque table.
Validation : tables visibles dans Supabase Dashboard. ✅

**Étape 4 — Auth web**
Inscription, connexion, déconnexion, middleware de protection des routes.
Test Vitest : session nulle si non connecté, redirect si non authentifié.
Validation : créer un compte → se connecter → voir le dashboard. ✅

**Étape 5 — Création d'organisation**
Formulaire onboarding : nom, type (club/entreprise).
Test Vitest : plan 'free' par défaut, member_count à 0.
Validation : créer "FC Test" → le voir dans le dashboard. ✅

**Étape 6 — Gestion membres**
Invitation, liste, changement de rôle, compteur member_count.
Test Vitest : limites de plan (16ème membre refusé en free, 151ème en club).
Validation : inviter 3 membres → liste → changer un rôle. ✅

**Étape 7 — Événements et calendrier**
Créer un événement, confirmer sa présence, notification push.
Validation : créer un match → confirmer présence → voir dans le calendrier. ✅

**Étape 8 — Résultats et stats**
Saisie du score en moins de 10 secondes. Stats joueurs. Classements automatiques.
Validation : saisir 3-1 → voir le résultat sur l'accueil. ✅

**Étape 9 — Branding white-label**
Logo, couleurs, slogan, cover. Aperçu temps réel. CSS variables dynamiques.
Validation : changer la couleur primaire → interface change. ✅

**Étape 10 — Stripe + cotisations**
Paiement en ligne, webhook, argent sur le compte du club.
Test Vitest : webhook met à jour le statut 'paid'.
Validation : payer en mode test → statut passe à 'paid'. ✅

**Étape 11 — Pages publiques**
Page club (`/[club-slug]`) et match en direct (`/match/[id]`) sans connexion.
Supabase Realtime pour le score et les événements en live.
Validation : partager le lien → score se met à jour sans recharger la page. ✅

**Étape 12 — Tests E2E Playwright**
Parcours : inscription → org → membre / connexion → résultat → stats / paiement / page publique match.
Validation : `npm run test:e2e` passe en vert. ✅

---

> **Note — Application mobile :** `triber-mobile` est un repo Expo séparé, déjà en développement actif. Il partage le même projet Supabase. Ne pas reconstruire la logique mobile ici — se concentrer sur le web et les pages publiques.

---

## 10. RÈGLES DE CODE

| Règle                           | Détail                                    |
| ------------------------------- | ----------------------------------------- |
| **Max 100 lignes par fichier**  | Découper immédiatement si dépassé         |
| **TypeScript strict**           | Pas de `any`, pas de `@ts-ignore`         |
| **Logique dans les hooks**      | Jamais de fetch dans un composant         |
| **RLS sur toutes les tables**   | Sans exception, dès la migration          |
| **Variables d'env**             | Jamais de clé en dur dans le code         |
| **Une migration = une feature** | Jamais de migration fourre-tout           |
| **Commentaires en français**    | Noms de variables et fonctions en anglais |
| **Un test par feature**         | Écrit au moment du développement          |

### Exemple de découpe si > 100 lignes

```
MemberList.tsx     60 lignes  — rendu de la liste
MemberCard.tsx     50 lignes  — carte individuelle
MemberActions.tsx  40 lignes  — boutons d'action
useMembers.ts      70 lignes  — logique fetch + état
```

---

## 11. VARIABLES D'ENVIRONNEMENT

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_CLUB=
STRIPE_PRICE_PRO=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. CE QU'ON NE FAIT PAS

- Pas d'API résultats temps réel externe (FFF/Scoreenco — hors MVP)
- Pas de chat temps réel WebSocket dans la messagerie (complexité inutile — Supabase Realtime est autorisé uniquement pour le match en direct public)
- Pas de multi-langue (français uniquement)
- Pas de fichier > 100 lignes sans découpe
- Pas de `any` TypeScript
- Pas de logique métier dans les composants UI
- Pas de clés API en dur dans le code
- Pas de duplication des fonctionnalités mobiles — `triber-mobile` gère l'expérience quotidienne des membres

---

_Triber — Mathieu Scicluna · mathieu.scicluna@hotmail.fr_
_Lancement MVP : Automne 2026 · Cible premier abonné payant : Printemps 2027_

---

## 13. COMPTE ET EMAIL UNIQUE

### Une adresse mail = un seul compte

Chaque utilisateur s'inscrit avec une adresse email. Cette adresse est **unique dans toute la base Supabase Auth** — impossible de créer deux comptes avec le même email. C'est géré nativement par Supabase.

**Vérification email obligatoire à l'inscription :**

- Un lien de confirmation est envoyé automatiquement à l'inscription via Resend
- Tant que l'email n'est pas confirmé → accès bloqué, message clair affiché
- Pas de confirmation → pas de compte actif

**Une organisation par compte (MVP) :**

- Un admin ne peut créer qu'une seule organisation avec son compte
- Si tentative de création d'une 2ème organisation → message : _"Vous gérez déjà une organisation avec ce compte. Contactez-nous pour une configuration multi-organisations."_
- Ce comportement est contrôlé côté serveur via RLS + vérification en API Route

**Pourquoi cette règle :**
Empêcher les abus où quelqu'un créerait 10 comptes avec 10 emails pour toujours rester gratuit sous les 20 membres. La vérification email + la limite une-org-par-compte rend le contournement non viable.

---

## 14. NOTIFICATIONS EMAIL

L'adresse email de l'admin reçoit automatiquement des notifications transactionnelles via **Resend**. Ces emails sont envoyés depuis une adresse `noreply@triber.app` avec le nom d'expéditeur **"Triber"**.

### Événements déclencheurs

| Événement                                   | Destinataire          | Priorité                                          |
| ------------------------------------------- | --------------------- | ------------------------------------------------- |
| Nouveau membre a rejoint l'organisation     | Admin                 | Normale                                           |
| Cotisation payée par un membre              | Admin                 | Normale — avec nom + montant                      |
| Cotisation en échec (paiement refusé)       | Admin                 | Urgente                                           |
| Rappel match J-1                            | Admin + member_active | Normale — avec liste présences confirmées         |
| Résumé hebdomadaire du lundi                | Admin                 | Normale — membres actifs, cotisations en attente  |
| Facture mensuelle Triber                    | Admin                 | Normale                                           |
| Limite approchée (18/20 membres en gratuit) | Admin                 | Importante — invitation à upgrader                |
| Limite atteinte (20/20 membres en gratuit)  | Admin                 | Urgente — upgrade requis pour ajouter des membres |
| Invitation à rejoindre l'organisation       | Nouveau membre invité | Urgente                                           |
| Confirmation d'inscription                  | Nouvel utilisateur    | Urgente                                           |

### Règles d'implémentation

- Tous les envois passent par Resend — jamais de SMTP direct
- Chaque type d'email a son propre template React Email dans `/emails/`
- Les emails sont envoyés de manière **asynchrone** via des API Routes Next.js
- En cas d'échec d'envoi → log dans Supabase, retry automatique x3
- L'admin peut désactiver certaines notifications depuis ses paramètres (sauf les emails critiques : facture, échec paiement, confirmation inscription)

### Structure des templates

```
emails/
  welcome.tsx              # Confirmation d'inscription
  invite-member.tsx        # Invitation à rejoindre une org
  payment-success.tsx      # Cotisation payée
  payment-failed.tsx       # Cotisation en échec
  new-member.tsx           # Nouveau membre rejoint
  match-reminder.tsx       # Rappel J-1 avant match
  weekly-summary.tsx       # Résumé hebdomadaire
  plan-limit-warning.tsx   # Limite approchée
  plan-limit-reached.tsx   # Limite atteinte
  monthly-invoice.tsx      # Facture mensuelle Triber
```

Chaque template est un composant React Email, rendu côté serveur, envoyé via `resend.emails.send()`.

---

_Triber — Mathieu Scicluna · scicluna.mathieu@hotmail.fr · 07 60 96 14 23_
_Lancement MVP : Automne 2026 · Cible premier abonné payant : Printemps 2027_
