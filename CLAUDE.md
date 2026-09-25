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

PWA, connexion requise, production, pas POC.
Priorités : scalabilité et clarté architecturale.
UI en français.

---

## UI constraints

- Responsive obligatoire via les préfixes Tailwind.
- **No-scroll layout** : tout tient dans le viewport sur desktop (`md:` et supérieur). Le scroll est toléré sur mobile.
- Tailwind par défaut. CSS custom autorisé pour les cas que Tailwind ne couvre pas.
- Zéro commentaire dans le code.
- **Tablette portrait** : variante Tailwind custom `tablet:` (`src/index.css`, `@custom-variant`) = largeur 744-1023 px **ET** hauteur ≥ 960 px **ET** `orientation: portrait` (cible : iPad Air 820×1180). Ne s'active donc jamais sur une fenêtre desktop étroite/basse ni en paysage. Elle vient **après** `sm:` dans la cascade et le surcharge. Avant le 2026-09-24 elle n'était définie nulle part (classes `tablet:` mortes). Déjà traités : Layout, Journal (blocs macros agrandis, repas en carrousel **2 par 2**, `snap-start` une carte sur deux), Planning (grille **transposée** : jours en lignes, repas en colonnes `2fr/3fr/2fr/3fr`, même DOM que desktop via `grid-flow-col` — pas de second rendu, sinon ids dnd-kit en double ; débord `tablet:-mx-8` + `overflow-visible` pour annuler le padding du `main`). Hauteurs en `dvh`, pas `vh` (barre Safari iPad). **Reste à passer : Courses, Recettes, Congélateur, Recipe Builder, Dashboard.**

---

## Feedback de chargement

Toute mutation déclenchée par un clic (hors formulaire avec son propre état `submitting` local) doit donner un retour visuel instantané, pas seulement après le round-trip réseau — pas d'écriture optimiste (cf. Backend API), donc le seul signal possible est un état "pending" explicite.

- `shared/store/usePendingStore.ts` — `Set<string>` global de clés en cours.
- `shared/hooks/usePendingKey.ts` / `useAnyPendingKey.ts` — lecture d'une clé, ou du OU logique de plusieurs clés.
- `shared/utils/withPending.ts` — `withPending(key, () => apiCall())` : marque la clé pendant l'appel, et ignore silencieusement un second appel avec la même clé tant que le premier n'est pas résolu (anti double-clic). Renvoie `undefined` dans ce cas — toujours vérifier le retour avant de l'utiliser.
- `shared/components/ui/CheckToggleIcon.tsx` — remplace une paire `CheckCircle2`/`Circle` par un `Loader2` animé quand `pending`.

Clé au niveau de l'**action métier**, pas de la requête HTTP : une action qui déclenche plusieurs appels (ex. cocher tous les ingrédients d'une recette) utilise une seule clé par élément affecté, jamais une clé par requête — sinon le spinner clignote entre chaque appel.

**Piège** : ne jamais wrapper un `onChange` de saisie libre (texte tapé au clavier) avec `withPending` — le garde anti-doublon peut faire perdre la dernière frappe si elle tombe pendant qu'une requête précédente est encore en vol, sans qu'aucun événement ultérieur ne vienne la renvoyer. Réservé aux interactions discrètes (clic, blur, confirmation explicite).

Les hooks ne pouvant pas être appelés dans un `.map()`, toute ligne de liste ayant besoin de `usePendingKey`/`useAnyPendingKey` doit être son propre composant (voir `IngredientCheckRow`, `HouseholdCheckRow`, `FreezerBagRow`, `SourceGroupRow`, `RecipeBaseGroupSection` comme exemples).

Déjà branché sur : courses, ménager, journal (stepper portions), congélateur, planning (suppression, personnes/grammes, copie, sélecteurs, choix desserts au drag & drop). Dashboard/Compte/Import/Recipe Builder gardent leur propre état `submitting` local dans leurs modales — ne pas les migrer sans raison.

---

## Planning — desserts indépendants du plat principal

`MealSlot.dessertIds` n'a **aucune dépendance** envers `recipeIds` — un créneau déjeuner/dîner (`hasDessert: true` dans `MEAL_SLOTS`) peut avoir des desserts sans plat principal (`recipeIds: []`). Toute UI/logique touchant les créneaux doit respecter cet invariant, ne jamais gater l'affichage ou l'ajout d'un dessert sur la présence d'une recette (piège déjà rencontré dans `MealSlot.tsx` — `showDessertColumn` était gaté sur `hasPhoto`, corrigé).

Déplacement (drag & drop) d'un repas ayant des desserts → l'utilisateur choisit de les faire suivre ou non (`MoveDessertsPrompt`), calcul dans `computeDragMoveSlots` (`core/logic/planning/planningLogic.ts`). Seul le cas où la destination a déjà une **vraie recette** déclenche un échange complet (recette + dessert des deux côtés) ; une destination « dessert seul » ne doit jamais céder son propre dessert au créneau de départ — piège déjà rencontré et corrigé (un dessert non lié au repas déplacé partait avec lui).

---

## Journal — moyenne de semaine et objectifs

- `WeekAverageModal` (bouton « Moyenne », à gauche de « Objectifs ») : moyenne par jour des macros sur les jours choisis (défaut lun→ven) de la semaine affichée. Calcul pur `core/logic/journal/weekAverageLogic.ts` ; les jours cochés **sans aucun repas planifié sont exclus** du dénominateur (le modal affiche le nombre de jours comptés).
- Objectifs : les **calories ne sont plus éditables**, elles sont calculées (Atwater `atwaterKcal`, `core/logic/dashboard/foodFormLogic.ts` : `4P + 9L + 4G + 2·fibres`) à partir des 4 macros et enregistrées à la validation. Un objectif kcal enregistré avant ce changement peut être incohérent jusqu'à la prochaine validation.

---

## Journal — quantités par ingrédient et par jour

Au-delà de l'override portions/grammes existant (par repas entier), le Journal permet de déplier un repas (chevron sur `RecipePortionRow`, uniquement pour un plat/base ayant des ingrédients) et d'ajuster la quantité de chaque ingrédient pour ce jour précis, sans jamais modifier la recette — 0 = ingrédient non utilisé ce jour-là.

- **Modèle unifié** : `useJournalStore.setPortionOverride`/`setGramOverride` calculent un ratio (`portions/defaultPortions` ou `grammes/baseGrams`) et l'appliquent à tous les ingrédients via `scaleIngredientsByRatio` (`core/logic/journal/journalOverrideLogic.ts`) pour peupler `ingredientOverrides`, en plus d'écrire `portionsOverride`/`gramsOverride` comme avant. L'édition fine d'un ingrédient (`setIngredientOverride`) corrige ensuite une entrée précise par-dessus — un seul mécanisme de « modifié aujourd'hui », pas deux systèmes parallèles.
- **`POST /journal-overrides` fait un remplacement total des 3 champs** (`portionsOverride`, `gramsOverride`, `ingredientOverrides`) à chaque appel — un champ omis du body est effacé, pas laissé tel quel. Le `persistOverride` interne du store lit toujours l'état courant des 3 champs avant d'envoyer ; ne jamais poster un patch partiel isolé sur cet endpoint.
- **Piège déjà rencontré et corrigé** : la quantité « par défaut » affichée pour un ingrédient (et utilisée en fallback pour un ingrédient non explicitement modifié) doit toujours être mise à l'échelle par le ratio de portions **courant** (`defaultIngredientOverridesForPortions`), jamais la quantité brute de la recette pour son `defaultPortions` — sinon éditer un seul ingrédient fait retomber tous les autres sur l'échelle de la recette entière au lieu de la portion réellement consommée.
- **Bases imbriquées** : dépliage à un seul niveau — un ingrédient `baseId` reste une ligne unique ajustable, jamais de récursion dans sa propre composition.
- **Ingrédients sans unité** (`Unit.NONE`, typiquement épices ajoutées « à vue ») exclus de la liste dépliable et de toute mise à l'échelle (`isOverridableIngredient`) — ils ne contribuent de toute façon jamais aux macros (`calculateRecipeMacros` les ignore déjà).
- Calcul : `calculateOverriddenRecipeMacros` (`shared/utils/macroUtils.ts`) patche `recipe.ingredients` avec les overrides puis force `defaultPortions: 1` pour obtenir un total absolu (pas une moyenne par portion). `computeSlotMacros`/`computeDayMacros` privilégient ce chemin quand `ingredientOverrides` existe pour un item, sinon retombent sur le calcul historique (facteur unique × macro précalculée) — rétrocompatible avec les overrides déjà en base avant ce chantier.
- Mobile : carrousel de repas (`JournalModule.tsx`, scroll-snap horizontal `< sm:`, indicateur à points) et scroll interne de la liste d'ingrédients dépliée (`MealSlotCard.tsx`, `overflow-y-auto`) sont deux axes distincts, pas de conflit de geste.

---

## Profils — personnes d'un foyer

Un compte = un foyer ; un **profil** = une personne (sans identifiants), max **3** par compte (`MAX_PROFILES`, `core/domain/profileConfig.ts`, imposé aussi par l'API : 409). Chaque profil porte ses objectifs kcal/macros et **ses propres overrides du journal** ; planning, courses, ménager et congélateur restent partagés. V1 = Journal uniquement.

- `useProfileStore` (`shared/store/`) : `profiles` + `activeProfileId` (seul persisté, `localStorage`, par appareil). `replaceProfiles` (boot) résout un id actif valide, sinon le premier. Les écritures passent par l'API d'abord (`profileService`), pas d'optimiste.
- `useJournalStore.overridesByProfile` : `Record<profileId, JournalOverrides>`. Les composants lisent le profil actif via `useActiveJournalOverrides` ; objectifs via `useActiveProfile`/`useActiveTargets` (fallback `DEFAULT_PROFILE_TARGETS` avant le boot). `persistOverride` capture le `profileId` au lancement (un changement de profil en vol ne mélange rien) et l'envoie dans `POST /journal-overrides`.
- Les objectifs se modifient via `updateProfile` (plus de `/journal-settings`, déprécié côté API). `journalSettings` n'est plus lu depuis `/bootstrap` ; il fournit `profiles` + `journalOverrides` de tous les profils.
- UI : `ProfileSwitcher` (Journal, en-tête de `MacroSummary`) + `ProfilesModal` (`shared/components/ui/profiles/`, aussi dans `SettingsPopover`). Couleurs : slug API → hex inline (`PROFILE_COLORS`), jamais de classe Tailwind runtime.
- **Déploiement** : l'API doit être en prod avant le front (le boot lit `profiles`).
- Nommage : `displayName` = nom du compte (AccountModal), « Profils » = personnes du foyer.

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
- Le catalogue en mémoire (recettes, aliments, activités, articles ménagers, catégories) vit dans `core/catalogue/` ; les composants le lisent via les snapshots de `shared/hooks/useCatalogueSnapshot.ts`, jamais directement.
- Depuis le raccordement API, IndexedDB n'est **qu'un cache de lecture** : la source de vérité est `meals-planning-api`.

---

## Routing

- Toutes les routes utilisent `React.lazy` — pas d'import statique de page.
- Le tableau des routes est inline dans `src/App.tsx` (`HashRouter`, base `/artemis-foodlab/`).
- `/recipe-builder` et `/dashboard` ne sont montés que pour `user.role === "admin"` (`useIsAdmin`) ; une route inconnue redirige vers `/journal`.
- Barre latérale = 5 entrées (Journal · Menu · Recettes · Courses · Congélateur) + icônes Créateur de recette et Dashboard en bas pour l'admin (`Layout.tsx`, pas `SidebarNav.tsx`). `/household` redirige vers `/shopping` (le ménager est un onglet de la vue Courses).

---

## Recette — quantités selon le nombre de parts

`RecipeDetail` affiche la carte SVG « recette » (`RecipeRecetteCard`, ou `RecipeBookCard` si photo livre) avec des quantités mises à l'échelle : `scaleRecipeToPortions(recipe, portions)` (`core/logic/recipe/recipeLogic.ts`, linéaire `portions / defaultPortions`, arrondi 2 décimales, inclut les ingrédients `baseId`). Les parts viennent de `?portions=N` (`resolveInitialPortions`) ou du `PortionsStepper` du header ; state **local**, non persisté, remis au défaut quand `recipeId` change (chevrons précédent/suivant).

- **Ouverture depuis le planning** : toujours `navigate(buildRecipeDetailUrl(recipeId, portions))` — créneau simple = `savedMeal.persons`, multi = `recipePersons?.[rid] ?? persons`, dessert = `persons` effectif de `DessertColumn`. `persons` planning ≡ « parts » (`persons / defaultPortions`). Les overrides en grammes (`recipeQuantities`) ne sont pas des parts → ignorés ici.
- **Macros = par portion, donc invariantes au scaling** : `macros` et `handleEditInBuilder` utilisent la recette **non** scalée ; seule la carte reçoit `scaledRecipe`.
- **Cache des cartes SVG** : chaque carte mémoïse son SVG via `createCardCache` (`shared/utils/cards/cardCache.ts`), dont la clé est le JSON des données de rendu (`recipeTo…CardData`). Le cache ne peut donc plus être périmé : toute donnée qui change le rendu change la clé. Avant le 2026-09-25 la clé était `id|image|parts` et ignorait nom/ingrédients/instructions (carte périmée jusqu'au rechargement).
- `RecipeMacroPage` (calculateur, route séparée) n'est pas portion-aware et ne reçoit pas `?portions`.

---

## Recipe Builder — points d'attention

- **Téléchargement** : « Télécharger la recette » (`PhotoPanel`) génère la carte SVG recette depuis l'**état courant du builder** (`builderStateToRecetteCardData` / `builderStateToBookCardData` dans `shared/utils/cards/cardAdapter.ts`) puis la rasterise en PNG ×3 (`shared/utils/cards/cardExport.ts`, images converties en `data:` URL pour éviter un canvas tainted). Ce n'est **pas** la photo brute du plat.
- **Instructions** : `RecipeMetaForm` n'a qu'un bouton ; l'édition se fait dans `InstructionsModal` (une ligne = une étape, `state.instructions: string[]`, `Entrée` = étape suivante, `Maj+Entrée` = saut de ligne). Un collage multi-lignes est éclaté en étapes (`splitPastedInstructionLines` / `spliceInstructionPaste`, `recipeBuilderLogic.ts`).
- Portions par défaut d'une nouvelle recette : **2** (`initialRecipeBuilderState`).
- Accès : icône `ChefHat` dans `Layout.tsx` (admin), bouton « Nouvelle recette » de `RecipeModule`, crayon de `RecipeDetail`.

---

## Identifiants de recette — deux formats à ne pas confondre

- `buildRecipeId` → `CHAR_01` : sert aux **noms de fichiers image** uniquement.
- `buildRecipeDbId` → `char-001` : **vraie clé interne** (clé de `typedRecipesDb`, `MealSlot.recipeIds`, etc.).
- Les deux sont dans `core/logic/recipeBuilder/recipeBuilderLogic.ts`.
- L'`id` uuid de l'API est stocké à part dans `RecipeDetails.apiId` ; la traduction code ↔ uuid passe par `core/catalogue/recipeIdMap.ts` (`getIdByCode` / `getCodeById`), reconstruit à chaque hydratation du catalogue.
- `typedRecipesDb` / `typedFoodDb` / `typedOutdoorDb` restent des objets mutables rafraîchis en place (`replaceRecipesDb` etc.), pas de `useLiveQuery`.
- **`Ingredient.id` est stable** d'un enregistrement à l'autre : `PUT /recipes/:id` fait un upsert par id (connu → update en place, absent → nouvelle ligne, disparu du tableau envoyé → supprimé ; id étranger à la recette → `400`). `recipeToBuilderState` préserve `ing.id` dans `DraftIngredient.apiId` (distinct de `DraftIngredient.id`, la clé locale/React) ; `builderStateToApiBody` le renvoie quand présent, l'omet pour un ingrédient ajouté dans le builder.

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
- `as unknown as X` interdit partout.
- Enums en anglais.
- Props interfaces nommées `<ComponentName>Props`.

---

## Code quality

- Pas de logique dans `setState` appelé depuis `useEffect`. Le lint (`react-hooks/set-state-in-effect`) **refuse tout `setState` synchrone dans un effet** : pour réinitialiser un state quand une prop/param change, utiliser le reset pendant le rendu (`if (id !== lastId) { setLastId(id); setX(...) }`) + lazy `useState` pour l'init (exemple : `RecipeDetail`, parts).
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

- **Écritures** : toujours l'API d'abord, cache mis à jour seulement après succès. Pas d'écriture optimiste, pas de file d'attente hors-ligne (connexion requise).
- **Erreurs** : `apiClient` appelle `onApiError` → notification globale (`useAuthInit`). Un composant ne catche en local que pour piloter l'état de son formulaire, jamais pour ré-afficher le message. Opt-out du handler global : `apiFetch(path, { suppressGlobalError: true })` (utilisé par l'import).
- **Photos de recettes** : servies par l'API (`assets.mealPhoto.url` / `assets.bookPhoto.url`, URL absolue directement dans `<img src>` ; route `/media/…` → 302 vers URL signée courte, **ne pas stocker la cible**). Les webp bundlés ont été purgés.
- **Cold start Render (free tier)** : 1re requête après ~15 min d'inactivité peut prendre 30-60 s. `useDelayedFlag` affiche un message « Réveil du serveur… » après 5 s (splash + login). Pas de timeout `fetch`.
- **Import de sauvegarde** : `POST /import` (un seul appel, `SyncPayload` v3) via `core/services/importService.ts` + `features/sync/ImportModal.tsx`. Remplacement par scope, garde anti-écrasement (409 → confirmer avec `overwrite: true`).
- **Planning — écritures d'items en batch** : `PUT /planning-slots/:id/items/batch` (`{add?, remove?, update?}`, au moins un tableau non vide) remplace les appels un par un. Réponse = état **complet et à jour** du créneau (`{items:[...]}`, triés par `position`) — reconstruire le cache local depuis ce tableau entier, jamais en corrélant par index avec l'`add` envoyé. Tout-ou-rien : un `itemId`/`id` invalide → 400/404, rien n'est appliqué. `core/services/planningService.ts` (`saveSlot`) + `core/logic/planning/planningApiMapper.ts` (`buildSlotItemsBatchPayload`, `mapApiItemsToSlotFields`).
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
