# CLAUDE.md

## Commands

```bash
npm run dev          # serveur de développement (Vite, port 5173)
npm run build        # ⚠️ INTERDIT — ne jamais lancer. Vérifier avec `npx tsc -b` + `npm run lint`
npm run lint         # eslint
npm run preview      # preview du build
```

---

## Product context

PWA offline, production, pas POC.
Priorités : scalabilité et clarté architecturale.
UI en français.

---

## UI constraints

- Responsive obligatoire via les préfixes Tailwind.
- **No-scroll layout** : tout tient dans le viewport sur desktop (`md:` et supérieur). Le scroll est toléré sur mobile.
- Tailwind par défaut. CSS custom autorisé pour les cas que Tailwind ne couvre pas.
- Zéro commentaire dans le code.

---

## Architecture

Trois couches, sans exception :

| Couche      | Rôle                                                           |
| ----------- | -------------------------------------------------------------- |
| `core/`     | Logique métier pure, migrations DB, types fondamentaux         |
| `features/` | Composants et hooks propres à une feature                      |
| `shared/`   | Ce qui est réutilisé entre features (composants, hooks, utils) |

### Règles de placement (invariants)

- Logique métier → `core/logic/<feature>/` — jamais inline dans un composant ou un hook.
- Toute fonction logique est une **fonction nommée pure**, testable isolément.
- Utils transverses → `shared/utils/`
- Hooks → `shared/hooks/` — jamais dans un composant directement.
- Données statiques → fichier dédié dans le dossier de la feature, pas dans le composant.
- Un seul composant par fichier.

---

## Data flow

1. Chargement des données depuis IndexedDB via les stores Zustand.
2. Les stores exposent uniquement les données et les actions — aucune logique de transformation inline.
3. La logique de transformation vit dans `core/logic/<feature>/`.
4. Les composants consomment les stores et appellent des fonctions nommées pures.
5. Les mutations (ajout, modification, suppression) passent systématiquement par les actions du store.
6. Le store notifie les abonnés après mutation — pas d'effet de bord dans les composants.
7. Les données dérivées (agrégations, filtres) sont calculées dans `core/logic/` et non recalculées dans le rendu.

---

## DB — IndexedDB migrations

- Schéma et version courante : `src/core/services/databaseService.ts` (version 13). Une v14 (catégories enum → slug) a été **tentée puis abandonnée** — ne pas la ressusciter sans nouveau cadrage.
- **Règle absolue** : ne jamais modifier un bloc `.version(n)` existant. Toute évolution de schéma = nouveau `.version(n+1)`.
- Ajouter un champ non indexé à une table existante ne demande **pas** de nouvelle `.version()` (Dexie ne versionne que les index).
- Les types de la DB sont isolés dans `core/typed-db/`.
- Depuis le raccordement API, IndexedDB n'est **qu'un cache de lecture** : la source de vérité est `meals-planning-api`.

---

## Routing

- Toutes les routes utilisent `React.lazy` — pas d'import statique de page.
- Le tableau des routes est inline dans `src/App.tsx` (`HashRouter`, base `/artemis-foodlab/`).
- `/recipe-builder` et `/dashboard` ne sont montés que pour `user.role === "admin"` (`useIsAdmin`) ; une route inconnue redirige vers `/journal`.
- Barre latérale = 5 entrées (Journal · Menu · Recettes · Courses · Congélateur) + icône Dashboard en bas pour l'admin. `/recipe-builder` n'y est **pas** : accès par le bouton « Recette » de `RecipeModule` (admin) ou le crayon d'une recette. `/household` redirige vers `/shopping` (le ménager est un onglet de la vue Courses).

---

## Identifiants de recette — deux formats à ne pas confondre

- `buildRecipeId` → `CHAR_01` : sert aux **noms de fichiers image** uniquement.
- `buildRecipeDbId` → `char-001` : **vraie clé interne** (clé de `typedRecipesDb`, `MealSlot.recipeIds`, etc.).
- Les deux sont dans `core/logic/recipeBuilder/recipeBuilderLogic.ts`.
- L'`id` uuid de l'API est stocké à part dans `RecipeDetails.apiId` ; la traduction code ↔ uuid passe par `core/typed-db/recipeIdMap.ts` (`getIdByCode` / `getCodeById`), reconstruit à chaque hydratation du catalogue.
- `typedRecipesDb` / `typedFoodDb` / `typedOutdoorDb` restent des objets mutables rafraîchis en place (`replaceRecipesDb` etc.), pas de `useLiveQuery`.

> La Google Sheets Gateway (dossier `/worker`) a été **abandonnée** (2026-07-21) et tout son code supprimé. Ne pas la ressusciter.

---

## Theming

- **CSS variables uniquement** pour les couleurs `slate-*` et `white`. Ne pas utiliser `dark:text-slate-*` ni `dark:bg-slate-*` : ces valeurs sont gérées par les variables, le dark mode est automatique.
- `dark:text-orange-*` et autres couleurs sémantiques non-slate : usage `dark:` **légitime**, à utiliser normalement.
- Dark mode : class-based via `ThemeProvider`. Ne pas utiliser `prefers-color-scheme` directement.
- Overlays et animations : suivre les tokens définis dans le système de thème.

---

## TypeScript

- `any` interdit partout.
- `as unknown as X` interdit hors `core/typed-db/`.
- Enums en anglais.
- Props interfaces nommées `<ComponentName>Props`.

---

## Code quality

- Pas de logique dans `setState` appelé depuis `useEffect`.
- `exhaustive-deps` respecté — pas de suppression du warning.
- `eslint-disable` interdit.
- `react-refresh` : pas d'export mixte (composant + constante non-composant dans le même fichier).

---

## Domain predicates

Les prédicats recette et slot sont la source de vérité pour toute condition métier.
Ils vivent dans `core/logic/<feature>/` et sont réutilisés partout — jamais réécrits inline.

---

## Backend API (projet séparé)

`../meals-planning-api` (`E:\Développement\Jason\meals-planning-api`, chemin frère de ce repo, pas un sous-dossier) — API Express + PostgreSQL + Prisma qui remplace les JSON statiques (`src/core/data/`) et l'IndexedDB comme source de vérité. Cahier des charges complet dans ce projet séparé, pas dupliqué ici.

**Statut : EN PRODUCTION depuis le 2026-09-09.** `master` est déployé sur GitHub Pages via `.github/workflows/deploy.yml` (sur push `master`) et sert le bundle branché API ; **`Dev` = branche de travail, `master` = prod**. Source de vérité pour recettes, aliments, activités extérieures, articles ménagers, catégories, ainsi que les données utilisateur (planning, congélateur, coches ménagères, journal, courses) et l'authentification par token JWT (`role: "admin" | "guest"`). IndexedDB sert de cache de lecture uniquement. Config : `VITE_API_URL` — dans `.env` en local, dans **`.env.production` (committé)** pour le build CI (l'URL de l'API n'est pas un secret, elle est dans le bundle) ; aucun secret GitHub. `apiClient` concatène `` `${API_URL}${path}` `` (URL nue, sans slash final ni `/api`).

- **Écritures** : toujours l'API d'abord, cache mis à jour seulement après succès. Pas d'écriture optimiste, pas de file d'attente hors-ligne (hors-ligne = lecture seule).
- **Erreurs** : `apiClient` appelle `onApiError` → notification globale (`useAuthInit`). Un composant ne catche en local que pour piloter l'état de son formulaire, jamais pour ré-afficher le message. Opt-out du handler global : `apiFetch(path, { suppressGlobalError: true })` (utilisé par l'import).
- **Photos de recettes** : servies par l'API (`assets.mealPhoto.url` / `assets.bookPhoto.url`, URL absolue directement dans `<img src>` ; route `/media/…` → 302 vers URL signée courte, **ne pas stocker la cible**). Les webp bundlés ont été purgés.
- **Cold start Render (free tier)** : 1re requête après ~15 min d'inactivité peut prendre 30-60 s. `useDelayedFlag` affiche un message « Réveil du serveur… » après 5 s (splash + login). Pas de timeout `fetch`.
- **Import de sauvegarde** : `POST /import` (un seul appel, `SyncPayload` v3) via `core/services/importService.ts` + `features/sync/ImportModal.tsx`. Remplacement par scope, garde anti-écrasement (409 → confirmer avec `overwrite: true`).
- **Collaboration front/back** : une session Claude Code séparée gère `meals-planning-api`. Ne pas deviner un contrat d'endpoint complexe — écrire un prompt autonome que l'utilisateur relaie, et attendre les payloads réels capturés en prod.
- Détail des contrats et de l'historique d'intégration : mémoire `project_frontend_api_integration.md` + `reference_api_write_endpoints.md`.

---

## Git

Format de commit : `feature: <description>` ou `fix: <description>` (aussi `refactor:`, `chore:`, `docs:` pour le reste). En anglais, court, pas de bullet points ni de détails techniques.

La version courante est dans `package.json` (+ `public/version.json` en miroir) — c'est la seule source de vérité. À incrémenter à chaque commit : patch pour fix/refactor/chore, minor pour feature.

When the user asks for a **commit**, respond with only the commit message text — do not run any git commands. Format: `feature: <description>` or `fix: <description>`. In English. Short, no bullet points, no technical details. Bump the version in `package.json` (+ `public/version.json`) first — patch for fix/refactor/chore, minor for feature.

---

## Issues

Les issues sont stockées dans `dev/issues.json`.

Le schéma exact est dans le `_schema` en tête du fichier (`id` numérique, `title`, `description`, `labels[]`, `status: open|in-progress|closed`, `priority`, `createdAt`, `closedAt`).

**Commandes disponibles :**

- `nouvelle issue` → ajoute une entrée (`status: open`, `createdAt` = aujourd'hui, id auto-incrémenté).
- `analyse nos issues` → résumé par statut + recommandations de priorisation.
- `clore issue <id>` → `status: closed` + `closedAt`. On complète aussi la `description` avec ce qui a été fait.

`dev/issues.json` n'est pas chargé automatiquement — le lire au début d'une session qui travaille sur le backlog.
