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
- Intégration Score'n'co : URL du widget de classement officiel

### Module Communications (admin uniquement)

- Création d'annonces envoyées à tous les membres de l'organisation
- Catégorie optionnelle (info, urgence…)
- Lecture par tous les membres dans leur fil d'accueil
- Table `announcements` — RLS : lecture membres, écriture admin uniquement

### Module Équipes / Catégories

- Association des membres à une catégorie (Senior, U18, U16…)
- Création d'événements ciblés par catégorie et par équipe (A, B, C)
- Filtres par catégorie dans la liste des membres et des finances

### Module Profil

- Modification du nom, téléphone, photo
- Visualisation de ses propres cotisations
- Code d'invitation unique (partageable pour rejoindre une org)

### Page d'invitation (sans connexion)

- URL partageable : `triber.app/join/[code]`
- Rejoindre une organisation via un code unique issu du profil admin
- Flux : code → création de compte ou connexion → intégration automatique à l'org

### Pages légales (sans connexion)

- `triber.app/cgu` — Conditions générales d'utilisation
- `triber.app/mentions-legales` — Mentions légales

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
- CI GitHub Actions — deux jobs :
  - **`verify`** (push + PR) : `lint` → `typecheck` → `vitest run` (57 tests) → `build` (standalone)
  - **`e2e`** (PR vers main uniquement, dépend de `verify`) : Playwright Chromium headless ; rapport HTML uploadé en artifact si échec

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
| Tests unitaires    | Vitest                    | Logique métier (57 tests, lancés en CI) |
| Tests E2E          | Playwright / Chromium     | Parcours web (lancés en CI sur PR)      |
| CI                 | GitHub Actions            | verify (push+PR) + e2e (PR only)        |
| Conteneurisation   | Docker multi-stage        | Image standalone ~150 MB (node:20-alpine) |
| Déploiement web    | Vercel                    | Auto-deploy GitHub                      |
| Déploiement mobile | Expo EAS Build            | App Store + Play Store                  |

---

## 5. DESIGN SYSTEM

### Palette Triber

```ts
// tailwind.config.ts → theme.extend.colors
brand: {
  green:         '#2A9D4E',  // Primaire — vert sport (boutons, accents, actif sidebar)
  'green-light': '#E8F5EE',  // Fond vert doux (badges "Payé", highlights)
  orange:        '#E8622A',  // Accent — orange chaleureux (boutons secondaires)
  'orange-light':'#FDF0EB',  // Fond orange doux
  dark:          '#1A1F16',  // Sidebar, header match live, fond sombre
  cream:         '#FAF7F2',  // Fond général des pages
  sand:          '#F0EBE1',  // Fond sections alternées, cartes légères
  muted:         '#7A8070',  // Texte secondaire, labels
  border:        '#DDD8CE',  // Bordures légères sur cartes et tableaux
}
```

Chaque organisation surcharge `primary` et `secondary` via son profil branding — injectés en CSS custom properties à la racine du layout via `lib/utils/theme.ts`.

### Typographie

```
Barlow Condensed (700, 800) → Titres de page ("FINANCES", "MATCH"), scores,
                               stats sportives (7V · 3N · 2D), numéros clés
Nunito (400, 600, 700)      → Corps de texte, labels, boutons, descriptions
```

### Layout global

```
┌─────────────────────────────────────────────────────┐
│  Sidebar sombre (#1A1F16)  │  Zone principale (cream) │
│  w-64 desktop / drawer mob │  flex-1, overflow-y-auto  │
│                             │                          │
│  Logo + nom org             │  PageHeader (titre page)  │
│  ─────────────────         │  Contenu (grilles, cards) │
│  Nav items :                │                          │
│  • icône + label            │                          │
│  • actif = fond vert pill   │                          │
│  • inactif = transparent    │                          │
└─────────────────────────────────────────────────────┘
```

Mobile : sidebar masquée, drawer hamburger. Desktop : sidebar fixe w-64, contenu scrollable à droite.

### Page de connexion — layout split

```
┌──────────────────────┬──────────────────────────┐
│  Panneau gauche      │  Panneau droit           │
│  fond sombre         │  fond blanc              │
│  Logo du club        │  Titre + sous-titre      │
│  Nom de l'org        │  Champs email/password   │
│  Saison courante     │  Bouton "Se connecter"   │
│  Stats (7V 3N 2D)    │  Lien "Créer un compte"  │
└──────────────────────┴──────────────────────────┘
```

### Composants récurrents

**Carte standard**
- `bg-white rounded-2xl border border-brand-border shadow-sm p-4`
- Titre en Barlow Condensed uppercase, corps en Nunito

**Bannière organisation (home)**
- Dégradé vert foncé → vert Triber, logo club à gauche
- Nom en Barlow Condensed 800, stats en ligne (`7V · 3N · 2D · 12MJ · 24BM`)

**Header match en direct (public)**
- Fond sombre (#1A1F16) pleine largeur
- Badge "EN DIRECT" vert clignotant · Score central Barlow 800 blanc · Chrono + statut

**Icônes d'actions match** — composants partagés dans `components/match/MatchIcons.tsx`
- But : `BallIcon` — cercle vert avec cible SVG
- Carton jaune : `CardRect` couleur `#F59E0B`
- Carton rouge : `CardRect` couleur `#EF4444`

**Cartes KPI finances**
- Grille 3 colonnes desktop / 1 colonne mobile
- Valeur en Barlow Condensed 700 (ex : `345 €`), label muted en Nunito

**Badges de statut**

| Statut     | Classes Tailwind                                |
| ---------- | ----------------------------------------------- |
| Payé       | `bg-green-100 text-green-700 rounded-full px-2` |
| En attente | `bg-amber-100 text-amber-700 rounded-full px-2` |
| Échec      | `bg-red-100 text-red-700 rounded-full px-2`     |

**Avatars membres** — `lib/utils/avatar.ts`
- Cercle coloré via `avatarColor(name)` + initiales via `initials(name)`

**Boutons**
- Primaire : `bg-brand-green text-white hover:bg-brand-green/90 rounded-xl`
- Secondaire : `bg-brand-orange text-white hover:bg-brand-orange/90 rounded-xl`
- Fantôme : `border border-brand-border bg-white hover:bg-brand-sand rounded-xl`

### Principes UI

- Interface **claire et aérée** — fond cream, cartes blanches, pas de surcharge
- Chaque action importante : **3 taps maximum** sur mobile
- Formulaires courts : jamais plus de 5 champs visibles à la fois
- Feedback immédiat : toast, loading spinner, état de confirmation
- Accessible : contrastes WCAG AA minimum
- **Aucun ajout ou changement visuel sans validation explicite** — soumettre la proposition avant d'implémenter

---

## 6. STRUCTURE DES DOSSIERS

```
triber/
├── app/
│   ├── page.tsx                            # Redirect → /home
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── confirme/page.tsx           # Email de confirmation envoyé
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx              # Redirect → /home
│   │   ├── onboarding/page.tsx             # Création d'organisation (1ère connexion)
│   │   ├── home/page.tsx
│   │   ├── members/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx                # Détail événement + présences
│   │   │       └── live/page.tsx           # Interface coach match en direct
│   │   ├── stats/page.tsx
│   │   ├── teams/page.tsx                  # Gestion des équipes / catégories
│   │   ├── finances/
│   │   │   ├── page.tsx                    # Liste des cotisations
│   │   │   └── [id]/page.tsx              # Détail cotisation + paiements membres
│   │   ├── media/page.tsx
│   │   ├── communications/page.tsx         # Annonces admin → membres
│   │   ├── profile/page.tsx               # Profil utilisateur
│   │   └── settings/page.tsx
│   ├── (public)/                           # Pages sans connexion requise
│   │   ├── [club-slug]/page.tsx            # Page publique du club
│   │   ├── match/[id]/page.tsx             # Match en direct public (Realtime)
│   │   ├── join/[code]/page.tsx            # Rejoindre via code d'invitation
│   │   ├── cgu/page.tsx                    # Conditions générales
│   │   └── mentions-legales/page.tsx       # Mentions légales
│   └── api/
│       ├── organizations/create/route.ts
│       ├── members/
│       │   ├── invite/route.ts             # Créer invitation (envoie email)
│       │   └── send-invite/route.ts        # Renvoyer une invitation existante
│       ├── stats/
│       │   ├── match-result/route.ts
│       │   └── player-stats/route.ts
│       ├── contributions/
│       │   ├── create/route.ts
│       │   ├── pay/route.ts                # Initie paiement Stripe
│       │   └── remind/route.ts             # Relance email cotisation impayée
│       ├── stripe/subscribe/route.ts       # Abonnement plan Club
│       ├── match/[id]/
│       │   ├── lineup/route.ts             # Gestion composition
│       │   ├── control/route.ts            # Contrôle chrono (start/pause/fin)
│       │   └── event/route.ts              # Ajout/suppression actions (buts, cartons)
│       ├── join/[code]/route.ts            # Valider code d'invitation
│       └── webhooks/stripe/route.ts        # Webhook paiements Stripe
│
├── components/
│   ├── ui/              # shadcn/ui — ne pas modifier
│   ├── auth/            # LoginForm, RegisterForm
│   ├── onboarding/      # CreateOrgForm, StepType, StepClub, StepEnterprise
│   ├── home/            # OrgBanner, ModuleGrid, LastMatchCard, NextEventCard,
│   │                    # TopScorerCard, AnnouncementSection, LiveMatchBanner, StandingsCard
│   ├── members/         # MemberList, MemberCard, MemberTable, InviteForm
│   ├── events/          # EventCard, EventCardHeader, EventCardActions, EventForm,
│   │                    # EventDetailView, AttendanceButton, AttendeesList, DeleteConfirmModal
│   ├── stats/           # PlayerRanking, PlayerStatsForm, PlayerStatsTable,
│   │                    # MatchResultForm, MatchResultsTable, StandingsForm, StandingsTable,
│   │                    # SeasonBilan, ScoreEncoWidget
│   ├── finances/        # ContributionList, ContributionCard, CreateContributionModal,
│   │                    # EditContributionModal, PaymentForm, PaymentMemberList,
│   │                    # MarkPaidModal, AddManualMemberModal, TarifsEditor,
│   │                    # BuvetteEntryForm, BuvetteList
│   ├── match/           # LiveMatchManager, AddEventForm, EventTimeline, MatchLiveCard,
│   │                    # ScoreCard, ScoreHeader, LiveScoreBoard, LiveTimer, LiveBand,
│   │                    # MatchControls, MatchCompositionSection, LineupSection,
│   │                    # LineupDisplay, LineupEditor, LineupModal, ActionRow, Timeline, MatchIcons
│   ├── media/           # MediaGallery, MediaUploadButton
│   ├── profile/         # ProfileForm, MyContributions
│   ├── join/            # JoinAuthForm, JoinOrgCard
│   ├── settings/        # BrandingForm, ColorPicker, UploadZone, ScoreEncoSettings,
│   │                    # UpgradeSection, LogoutButton
│   └── shared/          # AppNav, SidebarDesktop, SidebarMobile, PageHeader, ThemeProvider
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Client browser
│   │   └── server.ts    # Client server (cookies)
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrganization.ts
│   │   ├── useMembers.ts
│   │   ├── useEvents.ts
│   │   ├── useStats.ts
│   │   ├── useStandings.ts
│   │   ├── useMedia.ts
│   │   ├── useContributions.ts
│   │   ├── useContributionPayments.ts
│   │   ├── useFinances.ts
│   │   ├── useTreasury.ts
│   │   ├── useBranding.ts
│   │   ├── useAnnouncements.ts
│   │   ├── useMatchLive.ts
│   │   └── useLiveMatchPublic.ts
│   └── utils/
│       ├── plan-limits.ts
│       ├── theme.ts      # Application CSS variables branding (ex apply-theme)
│       ├── finances.ts   # Helpers calcul/formatage finances
│       ├── match.ts      # Helpers match (pairActionsWithAssists…)
│       └── avatar.ts     # avatarColor, initials
│
├── emails/              # Templates React Email (Resend)
│   ├── welcome.tsx
│   ├── invite-member.tsx
│   └── …
│
├── supabase/
│   └── migrations/      # Une migration par feature
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
008_contributions.sql          ← table contributions legacy (remplacée par 022)
009_media.sql
010_messages.sql
011_fix_organization_members_rls.sql
011_event_status.sql           ← ajoute events.status + index
012_user_code.sql              ← profiles.invite_code + trigger
012_match_actions.sql          ← table match_actions + Realtime
013_divisions.sql              ← organizations.division/category/season + org_members.category
014_categories_statuts.sql     ← table member_categories + events.category
015_profiles_trigger.sql       ← trigger auto-création profile à l'inscription
016_announcements.sql          ← table announcements
017_match_events.sql           ← table match_events (legacy, remplacée par match_actions)
018_public_read_policies.sql   ← policies de lecture publique (pages sans connexion)
019_events_category_team.sql   ← events.category + events.team_label
020_standings.sql              ← table standings (classement manuel)
021_scoreenco.sql              ← organizations.scoreenco_url
022_finance_v2.sql             ← tables contribution_templates, contribution_tarifs,
                                  contribution_payments, treasury_entries
023_member_own_payment_rls.sql ← membres peuvent lire/écrire leurs propres paiements
024_performance_indexes.sql    ← indexes B-tree sur colonnes haute fréquence RLS
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
  -- Champs ajoutés par migrations ultérieures :
  division text,                 -- ex: "Régional 1" (migration 013)
  category text,                 -- ex: "Senior" (migration 013)
  season   text default '2025-2026', -- saison courante (migration 013)
  scoreenco_url text,            -- URL widget classement officiel (migration 021)
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  push_token text,
  invite_code text unique,       -- généré automatiquement par trigger (migration 012)
  updated_at timestamptz default now()
);
-- Trigger handle_new_user : crée profile automatiquement à l'inscription (migration 015)

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('admin', 'member_active', 'member')),
  joined_at timestamptz default now(),
  -- Champs ajoutés par migrations ultérieures :
  jersey_number int,             -- numéro de maillot (triber-mobile)
  category text,                 -- catégorie/équipe du membre (migration 013)
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
  created_at timestamptz default now(),
  -- Champs ajoutés par migrations ultérieures :
  status text not null default 'upcoming'
    check (status in ('upcoming','ongoing','half_time','finished')), -- migration 011
  category   text,               -- catégorie (Senior, U18…) (migrations 014, 019)
  team_label text,               -- équipe (A, B…) (migration 019)
  -- Champs timer match en direct (ajoutés en prod par triber-mobile, pas de migration locale) :
  started_at          timestamptz,
  paused_at           timestamptz,
  total_paused_seconds int
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

-- Module finances v2 (migration 022) — remplace la table contributions legacy
create table contribution_templates (
  id              uuid        primary key default gen_random_uuid(),
  organization_id uuid        not null references organizations on delete cascade,
  title           text        not null,
  description     text,
  deadline        date,
  warning_message text,
  is_buvette      boolean     not null default false,
  is_active       boolean     not null default true,
  created_by      uuid        references auth.users,
  created_at      timestamptz default now()
);

create table contribution_tarifs (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references contribution_templates on delete cascade,
  category    text not null,
  amount_cents int  not null check (amount_cents > 0),
  unique(template_id, category)
);

create table contribution_payments (
  id                uuid        primary key default gen_random_uuid(),
  template_id       uuid        not null references contribution_templates on delete cascade,
  organization_id   uuid        not null references organizations on delete cascade,
  user_id           uuid        references auth.users on delete set null,
  manual_name       text,        -- personne hors app (ex: parent non inscrit)
  category          text,
  amount_cents      int         not null,
  status            text        not null default 'pending'
                                check (status in ('pending','paid','failed')),
  payment_method    text        check (payment_method in ('cash','tpe','stripe','transfer','autre')),
  stripe_payment_id text,
  paid_at           timestamptz,
  paid_by           uuid        references auth.users,
  notes             text,
  created_at        timestamptz default now(),
  constraint check_person check (user_id is not null or manual_name is not null)
);

create table treasury_entries (
  id                    uuid        primary key default gen_random_uuid(),
  organization_id       uuid        not null references organizations on delete cascade,
  template_id           uuid        references contribution_templates on delete set null,
  amount_declared_cents int         not null,
  amount_ticket_cents   int,
  photo_url             text,
  entry_date            date        not null default current_date,
  notes                 text,
  entered_by            uuid        references auth.users,
  reviewed_by           uuid        references auth.users,
  reviewed_at           timestamptz,
  created_at            timestamptz default now()
);

-- Annonces admin → membres (migration 016)
create table announcements (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade,
  author_id       uuid references profiles(id),
  title           text not null,
  message         text not null,
  category        text,
  created_at      timestamptz default now()
);

-- Classement de championnat saisi manuellement (migration 020)
create table standings (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations on delete cascade not null,
  season          text not null default '2025-2026',
  rank            int  not null,
  team_name       text not null,
  played          int  not null default 0,
  won             int  not null default 0,
  drawn           int  not null default 0,
  lost            int  not null default 0,
  goals_for       int  not null default 0,
  goals_against   int  not null default 0,
  points          int  not null default 0,
  is_own_team     boolean not null default false,
  updated_at      timestamptz default now()
);

-- Catégories d'un membre (statut : joueur, bureau, parent) (migration 014)
create table member_categories (
  id                     uuid primary key default gen_random_uuid(),
  organization_member_id uuid references organization_members on delete cascade,
  status                 text not null check (status in ('joueur', 'bureau', 'parent')),
  category               text not null,
  created_at             timestamptz default now()
);

-- Actions en temps réel lors d'un match en direct (migration 012)
create table match_actions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events on delete cascade not null,
  user_id      uuid references auth.users,
  player_name  text,               -- nom libre si joueur hors app
  player_in_id uuid references auth.users,  -- entrant (substitution)
  type         text not null check (type in ('goal','assist','yellow_card','red_card','substitution')),
  minute       int  not null,
  is_own_team  boolean not null default true,
  created_at   timestamptz default now()
);
-- Realtime activé : alter publication supabase_realtime add table match_actions;

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

> **Note — Champs sans migration locale :** les champs `events.started_at`, `events.paused_at` et `events.total_paused_seconds` ont été ajoutés directement en production (par triber-mobile). Ils n'ont pas de migration dans ce repo. Ils sont documentés dans le schéma ci-dessus et utilisés par `app/api/match/[id]/control/route.ts`. Ne pas les recréer en migration — ils existent déjà en base.
>
> `organization_members.jersey_number` existe également en base (ajouté par triber-mobile) sans migration locale dans ce repo.

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
