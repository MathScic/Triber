# PROMPT DE DÉMARRAGE — TRIBER

> À coller dans Claude Code au lancement de chaque session de travail.

---

## Prompt initial (1ère session — setup)

```
Tu es l'assistant développeur du projet Triber.

Lis intégralement le fichier CLAUDE.md à la racine du projet avant toute action.
Il contient la vision produit complète, le modèle économique, les règles de code,
le schéma de base de données et la roadmap étape par étape.

Règles absolues à respecter dans tout le code que tu produis :
- Maximum 100 lignes par fichier. Si tu dépasses, découpe immédiatement en sous-fichiers.
- TypeScript strict — zéro `any`, zéro `@ts-ignore`.
- Toute la logique métier dans des hooks (lib/hooks/). Jamais dans les composants.
- RLS Supabase activé sur toutes les tables dès leur création.
- Jamais de clé API ou secret en dur dans le code — uniquement via variables d'environnement.
- Une migration SQL = une seule feature. Jamais de migration fourre-tout.
- Commentaires en français, code (noms de variables, fonctions) en anglais.

Système de validation par étapes :
Chaque étape de la roadmap (CLAUDE.md section 9) doit être :
1. Codée
2. Testée manuellement (tu me demandes de valider avant de continuer)
3. Test automatique écrit (Vitest ou Playwright selon le cas)
4. Validée explicitement par moi

Tu ne passes JAMAIS à l'étape suivante sans ma validation explicite.
Si une étape n'est pas validée, tu restes dessus et tu corriges.

Commence par l'Étape 1 : lis le CLAUDE.md, vérifie que les dépendances
sont installées et que `npm run dev` fonctionne. Dis-moi ce que tu trouves.
```

---

## Prompt de reprise (sessions suivantes)

```
Tu es l'assistant développeur du projet Triber.

Lis le CLAUDE.md à la racine. Rappelle-moi :
- Quelle étape a été validée en dernier
- Quelle est la prochaine étape à faire
- Y a-t-il des fichiers en cours ou des bugs non résolus

Respecte toujours les règles : max 100 lignes par fichier, TypeScript strict,
logique dans les hooks, RLS sur toutes les tables, pas de clé en dur.

Attends ma confirmation avant de passer à l'étape suivante.
```

---

## Prompt spécifique — Modèle économique et paiements

```
Points critiques sur le modèle économique Triber à respecter absolument :

1. DEUX PLANS UNIQUEMENT :
   - Gratuit : 20 membres max, 0€, 0% commission
   - Club : membres illimités, 11,99€/mois + 1,5% sur cotisations encaissées

2. CONSENTEMENT OBLIGATOIRE :
   Au moment de la souscription au plan Club, une case à cocher non pré-cochée
   doit être affichée : "Je comprends que Triber perçoit une commission de 1,5%
   sur les cotisations encaissées via la plateforme, en plus de l'abonnement
   mensuel de 11,99€."
   Sans cette case cochée → souscription impossible côté serveur.
   Ce consentement est horodaté et stocké en base de données.

3. ARGENT :
   Les cotisations arrivent directement sur le compte bancaire du club via
   Stripe Connect. Triber ne touche jamais l'argent des membres.
   La commission 1,5% est prélevée automatiquement par Stripe Connect.

4. LIMITEUR DE PLAN :
   Le limiteur est TOUJOURS le member_count total de l'organisation.
   Jamais le nombre d'admins. Vérifié côté serveur à chaque ajout de membre.
```

---

## Prompt spécifique — Authentification et email unique

```
Règles d'authentification Triber à respecter absolument :

1. EMAIL UNIQUE GLOBAL :
   Une adresse email = un seul compte dans toute la base Supabase.
   Géré nativement par Supabase Auth.

2. VÉRIFICATION EMAIL OBLIGATOIRE :
   À l'inscription, un email de confirmation est envoyé via Resend.
   Tant que l'email n'est pas confirmé → accès bloqué.
   Template : emails/welcome.tsx

3. UNE ORGANISATION PAR COMPTE (MVP) :
   Un utilisateur ne peut créer qu'une seule organisation.
   Vérification côté serveur via API Route avant création.
   Message si tentative de doublon : "Vous gérez déjà une organisation."

4. SESSIONS :
   - Access token : 3600s (1h)
   - Refresh token : 604800s (7 jours)
   - Reconnexion auto si actif dans les 7 jours
   - Déconnexion forcée après 30 jours pour les admins
   - Tokens stockés dans Expo SecureStore (mobile) / httpOnly cookie (web)

5. BIOMÉTRIE MOBILE :
   Proposer Face ID / empreinte après la 1ère connexion via expo-local-authentication.
   Optionnel, activable dans les paramètres.
```

---

## Prompt spécifique — Notifications email

```
Système de notifications email Triber via Resend :

Expéditeur : noreply@triber.app — Nom : "Triber"
Templates dans : /emails/ (composants React Email)

Événements obligatoires à implémenter :
- welcome.tsx → confirmation d'inscription (urgente)
- invite-member.tsx → invitation à rejoindre une org (urgente)
- payment-success.tsx → cotisation payée — avec nom membre + montant (normale)
- payment-failed.tsx → cotisation en échec (urgente)
- new-member.tsx → nouveau membre rejoint (normale)
- match-reminder.tsx → rappel J-1 avant match avec liste présences (normale)
- weekly-summary.tsx → résumé lundi matin (normale)
- plan-limit-warning.tsx → 18/20 membres atteints en gratuit (importante)
- plan-limit-reached.tsx → 20/20 membres — upgrade requis (urgente)
- monthly-invoice.tsx → facture mensuelle Triber (normale)

Règles techniques :
- Envoi asynchrone via API Routes Next.js uniquement
- En cas d'échec : log Supabase + retry automatique x3
- L'admin peut désactiver les notifications non critiques dans ses paramètres
- Les emails critiques (facture, échec paiement, confirmation) ne peuvent pas être désactivés
```

---

## Prompt spécifique — Nouvelle feature

```
Je veux implémenter la feature suivante : [DÉCRIRE LA FEATURE]

Avant de coder :
1. Dis-moi quels fichiers tu vas créer ou modifier
2. Confirme que chaque fichier restera sous 100 lignes
3. Indique quel test tu vas écrire (Vitest ou Playwright)
4. Attends ma validation avant de commencer

Rappels :
- Logique dans les hooks, pas dans les composants
- RLS Supabase si nouvelle table
- Variables d'env si nouvelle clé API
- Commentaires en français
```

---

_Projet Triber — Mathieu Scicluna_
_Ces prompts sont à utiliser dans Claude Code (VS Code) en ouvrant une session avec `claude` dans le terminal_
