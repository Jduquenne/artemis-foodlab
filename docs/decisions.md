# Decisions

Lightweight ADRs. New architecture decisions are proposed by the agent, validated by the owner, then recorded here. Statuses: accepted · proposed · superseded · rejected.

---

## D-001 — Three layers and strict placement rules

- **Date**: 2026-06-03
- **Status**: accepted
- **Context**: `core/utils/` mixed feature-specific business logic and truly shared utilities; a hook (`useQRCamera`) had been put inside a feature folder.
- **Decision**: `core/` (pure logic, domain, services), `features/`, `shared/`. Business logic → `core/logic/<feature>/` as named pure functions; hooks → `shared/hooks/` and utils → `shared/utils/` without exception; `core/utils/` removed.
- **Alternatives considered**: not documented.
- **Consequences**: rules in `docs/architecture.md` § Layers. Open debt: `core/logic` still imports `shared/utils` (see `dev/refactoring.md`).

## D-002 — Separate backend repo `meals-planning-api`

- **Date**: 2026-07-21
- **Status**: accepted
- **Context**: the catalogue was managed through a Google Sheet + manual Python pipeline, and the planning had to be exported/imported by hand between devices.
- **Decision**: a real Node/Express API (TypeScript, PostgreSQL + Prisma, Zod) in a separate sibling repo, owning catalogue, user data and auth. Live in production since 2026-09-09.
- **Alternatives considered**: Cloudflare Worker + Google Sheets API (D-003, rejected).
- **Consequences**: two repos, two Claude Code sessions, relay workflow (`docs/api.md` § Working with the API session); deploy API before the front when contracts change.

## D-003 — Google Sheets Gateway (Cloudflare Worker)

- **Date**: 2026-07-21
- **Status**: rejected
- **Context**: first attempt to drive the Google Sheet directly from a Worker.
- **Decision**: abandoned; all code deleted (`worker/`). Do not revive.
- **Alternatives considered**: storing photos via Cloudflare R2 / Google Cloud Storage (credit card required) or committing them to the repo through the GitHub Contents API (judged too hacky).
- **Consequences**: replaced by D-002.

## D-004 — Hosting: Supabase + Render, no credit card

- **Date**: 2026-07-21
- **Status**: accepted
- **Context**: strong constraint to avoid any credit card; Render's free tier has an ephemeral filesystem.
- **Decision**: Supabase (PostgreSQL + object storage in one provider) + Render free Web Service for the API.
- **Alternatives considered**: Neon (Postgres only), Backblaze B2 (plan B storage), Fly.io and Oracle Cloud (card required).
- **Consequences**: cold starts of 30-60 s after ~15 min idle (`docs/development.md` § Debugging); real fix = paid plan or keep-alive ping.

## D-005 — API as source of truth, IndexedDB read cache, no optimistic writes, no offline queue

- **Date**: 2026-07-21
- **Status**: accepted
- **Context**: usage by 1-2 accounts; an offline write queue would reintroduce two diverging systems.
- **Decision**: catalogue read in bulk (no pagination) and kept in memory; the API reassembles the nested shape the front expects; IndexedDB is a read cache only; writes need the network (API first, cache after success); clear error otherwise.
- **Alternatives considered**: offline write queue with conflict resolution (abandoned).
- **Consequences**: explicit pending feedback needed on clicks (D-008).

## D-006 — Data model: plannable items and stable internal keys

- **Date**: 2026-07-21 (API spec), integration 2026-09
- **Status**: accepted
- **Context**: recipes and outdoor activities were merged at runtime; front keys are recipe codes everywhere.
- **Decision**: one `plannable_items` identity (type recipe | outdoor) with `recipes` as a 1:1 extension; base = recipe of kind `base`; instructions merged into recipes; freezer as table-per-type; `RecipeAssetKey` reduced to `mealPhoto` / `bookPhoto`; boolean columns prefixed `is_`; `household_shopping_flags` (checked = to buy), `shopping_item_checks`. Front keeps codes (`char-001`) as internal keys and translates to uuids at the API boundary (`recipeIdMap`).
- **Alternatives considered**: `recipes.kind = 'outdoor'` in a single table (rejected: semantic mix).
- **Consequences**: `docs/architecture.md` § Identifiers.

## D-007 — Refresh token outside the cookie (localStorage + rotation)

- **Date**: 2026-09-10
- **Status**: accepted
- **Context**: the cross-site refresh cookie (`github.io` → `onrender.com`) was refused by Safari ITP and hardened Chrome even with `SameSite=None` → logout on every reload.
- **Decision**: the API also returns the refresh token in the body; the front stores it in `localStorage` and sends it in the body. Accepted trade-off: readable by JS (XSS exfiltration); mitigated by rotation on every use + replay detection.
- **Alternatives considered**: cookie only.
- **Consequences**: `docs/spec-accounts.md` § Session.

## D-008 — Pending feedback at the business-action level, not in `apiClient`

- **Date**: 2026-09 (v6.62.0 → 6.65.0)
- **Status**: accepted
- **Context**: checking an item on a slow network gave no signal. Suggested: track pending state in `apiClient` per HTTP request.
- **Decision**: rejected the request-level approach (some actions fire several sequential requests → spinner flicker); primitives in `shared/` keyed by business action.
- **Consequences**: `docs/conventions.md` § Loading feedback.

## D-009 — Planning item writes in one batch call, no fallback

- **Date**: 2026-09-18
- **Status**: accepted
- **Context**: `saveSlot` made one sequential HTTP call per added/removed/updated item.
- **Decision**: `PUT /planning-slots/:id/items/batch`, negotiated with the API session and verified locally. No automatic fallback to one-by-one calls (a "route missing" 404 is indistinguishable from a business 404).
- **Consequences**: the front change could only ship after the route was deployed.

## D-010 — Desserts independent from the main dish; user chooses on drag & drop

- **Date**: 2026-09-18
- **Status**: accepted
- **Context**: a dessert alone was impossible and dragging a meal silently dropped its desserts.
- **Decision**: invariant "desserts never depend on `recipeIds`"; on drag & drop the user chooses whether desserts follow (explicit prompt rather than an imposed behaviour).
- **Consequences**: `docs/spec-planning.md`.

## D-011 — Journal: unified per-ingredient override model

- **Date**: 2026-09-23
- **Status**: accepted
- **Context**: only whole-meal portion/gram overrides existed.
- **Decision**: the portion/gram stepper writes into the same per-ingredient structure (uniform ratio), fine edits correct on top; nested bases one level only; strictly stable ingredient ids required (hence `PUT /recipes` upsert by id instead of working around with another key); overrides cascade when the meal leaves the planning; always persisted in the database.
- **Consequences**: `docs/spec-journal.md`.

## D-012 — Profiles: people of a household

- **Date**: 2026-09-24
- **Status**: accepted
- **Context**: journal overrides ("I ate 1.5 portions") are personal; with one set per account, two members overwrite each other. Targets alone were not enough.
- **Decision**: profile = person without credentials, max 3 per account (API-enforced, global constant for now); V1 = journal targets + overrides only; active profile chosen per device (`localStorage`), not server-side. Keep `Profile` extensible for V2.
- **Consequences**: `docs/spec-accounts.md` § Profiles. V2 ideas tracked in `dev/issues.json`.

## D-013 — Demo mode instead of registration

- **Date**: 2026-10-05
- **Status**: accepted
- **Context**: need to let an external visitor try the app without friction; no open or invite-based registration wanted; concern about server load (seeding on each creation).
- **Decision**: « Essayer la démo » creates an isolated ephemeral guest account (~2 h), seeded in one transaction API-side, with global cap, IP rate limit, daily cap and lazy purge.
- **Consequences**: `docs/spec-accounts.md` § Demo mode.

## D-014 — Editable ingredient / household categories (enum → slug, IndexedDB v14)

- **Date**: 2026-09-09
- **Status**: rejected
- **Context**: attempt to make categories editable from the dashboard.
- **Decision**: reverted before commit. Ingredient categories stay frozen French enums. Reasons: broke shopping and card rendering during re-sync (stale cache), confusing UX (non-editable English slugs, grey cards for new categories), ~30 files for a rare need.
- **Alternatives considered**: light version — keep the enum as identity and fetch a small `slug → label` table only to rename the display (no create/delete, no DB migration).
- **Consequences**: no category-editing UI; do not revive Dexie v14 without new scoping.

## D-015 — Media: private bucket, long signed URLs, batch resolution

- **Date**: 2026-09-10
- **Status**: accepted
- **Context**: image loading was slow (one 302 per image) and hit rate limits.
- **Decision**: keep the Supabase bucket private; signed URLs kept but long (7 days) and resolvable in batch (`POST /media/resolve`); stable `/media/<key>` redirect usable as fallback.
- **Consequences**: `docs/architecture.md` § Media.

## D-016 — Single `GET /bootstrap` at boot

- **Date**: 2026-09-23
- **Status**: accepted
- **Context**: ~9-10 requests at boot.
- **Decision**: one endpoint returning every boot resource, each key identical to its standalone endpoint.
- **Alternatives considered**: ETag/304 on the catalogue (not done, see roadmap ideas).

## D-017 — Catalogue change signal, snapshots, polling refresh (no real time)

- **Date**: 2026-09-25
- **Status**: accepted
- **Context**: mutable catalogue objects had no change notification; React did not re-render after a sync; SVG card caches went stale.
- **Decision**: event emitter notified once by `catalogueSyncService`, snapshot hooks, logic receives data as parameters, `useAppRefresh` polling (focus / network / 5 min, throttled 2 min).
- **Alternatives considered**: server channel (SSE / WebSocket) for real time — not done.
- **Consequences**: up to 2 min delay between devices, last write wins.

## D-020 — Recipe filters by type with median thresholds

- **Date**: 2026-10-03
- **Status**: accepted (supersedes 6 fixed predefined filters and fixed kcal thresholds 350/450)
- **Decision**: filter by type (dishes / breakfast / snack) and « below / above the median » of each macro for that type.
- **Consequences**: `docs/spec-recipes.md` § Filters.

## D-021 — Calorie targets computed with Atwater

- **Date**: 2026-09-24
- **Status**: accepted
- **Decision**: kcal targets are no longer editable; computed `4P + 9L + 4G + 2·fibres` from the macros. Same formula for food kcal in the dashboard.

## D-022 — Shopping list grouped by food id

- **Date**: 2026-07-21
- **Status**: accepted
- **Context**: grouping on free-text `name-unit` never merged two spellings of the same ingredient; some shopping state was lost between devices.
- **Decision**: `recipe_ingredients.food_id` as a real FK; shopping state (periods, days, item checks, freezer bags, source checks) stored server-side.
- **Consequences**: the front still groups by `${name}-${unit}` and translates to `foodId` when writing (`docs/spec-shopping.md`).

## D-023 — `dev/` is not versioned

- **Date**: 2026-09-25 (confirmed 2026-10-07)
- **Status**: accepted
- **Decision**: `dev/` (owner's project management: `issues.json`, `refactoring.md`, future features) stays in `.gitignore`. Agents may read and update it when asked; nothing from it is copied into versioned docs beyond links.

## D-024 — `tablet:` variant scoped to portrait tablets

- **Date**: 2026-09-24
- **Status**: accepted
- **Context**: a width-only first version broke short desktop windows.
- **Decision**: width 744-1023 px + height ≥ 960 px + portrait. Landscape-oriented 7×4 grids do not fit 820 px wide, while height is abundant → transposed layouts.

## D-025 — Account management without e-mail flows

- **Date**: 2026-09-09
- **Status**: accepted
- **Decision**: no password reset by e-mail (would need an e-mail service; disproportionate for a handful of users); `displayName` display-only; e-mail change without re-verification; locked-out recovery by another admin.

## D-026 — Planning pickers capped, no virtualisation

- **Date**: 2026-09-27 (v6.75.25)
- **Status**: accepted
- **Decision**: cap results at 30 + `useDeferredValue`, reusing the existing capping pattern; no virtualisation or redesign.

## D-027 — No local copy of journal targets/overrides or shopping days

- **Date**: 2026-09-08
- **Status**: accepted
- **Decision**: the related `localStorage` keys were removed; the API is the only source. Old keys are not purged.

## D-028 — QR sync and JSON export removed; import through the API

- **Date**: 2026-09-08
- **Status**: accepted
- **Decision**: QR sync, JSON export and backup reminder removed (with their dependencies); a legacy backup can still be imported with `POST /import` (replacement by scope).

## D-029 — Google sign-in

- **Date**: 2026-09-08
- **Status**: proposed (blocked on the API, `dev/issues.json` #10)
- **Decision (product, agreed with the API session)**: see `docs/spec-accounts.md` § Google sign-in.

## D-030 — Dashboard planning usage: "planned = made"

- **Date**: 2026-09-09
- **Status**: accepted
- **Decision**: a planned recipe counts as made; scope = calling admin's planning only; lunch and dinner only (server-side aggregation, since the front only caches visited weeks).

## D-031 — Named theme colours instead of `dark:` slate pairs

- **Date**: 2026-10-07
- **Status**: accepted
- **Context**: `white` is deliberately not overridden in dark mode (white text on orange must stay readable), so a light background needed a `dark:bg-slate-*` partner (`bg-white dark:bg-slate-100`, ~300 pairs). The rule "never `dark:bg-slate-*`" could not be met without changing the dark rendering.
- **Decision**: six semantic colours defined as CSS variables in `src/index.css` (light / dark values, mapped in `@theme inline`): `surface`, `surface-raised`, `muted`, `subtle`, `subtle-tint`, `strong` (table in `docs/ui-design.md` § Theming). Each replaces one existing pair with an identical rendering; one-off pairs are mapped to the nearest colour or reported to the owner, no colour is created for a single use. Migration feature by feature during the P4 review, starting with Shopping.
- **Names chosen by**: the owner, 2026-10-07.

## D-032 — Generic utilities in `core/utils/`, browser utilities in `shared/utils/`

- **Date**: 2026-10-08
- **Status**: accepted (owner)
- **Context**: D-001 put every utility in `shared/utils/` "without exception", so `core/logic` and `core/services` imported `shared/utils/` (36 imports), an inversion of the layering. D-001 had removed `core/utils/` because it mixed feature business logic with shared utilities.
- **Decision**: split utilities by nature. `core/utils/` holds generic pure helpers with no business meaning (`numberUtils`, `collectionUtils`, `sortUtils`, `textUtils`, `codeUtils`, `columnUtils`, `dateUtils`, `weekUtils`): no React, no browser API, no catalogue, no business rule. Business helpers go to `core/logic/<feature>/` (`unitUtils` → `core/logic/unit/`, `macroUtils` → `core/logic/nutrition/`, its caches → `core/catalogue/recipeMetrics.ts`). `shared/utils/` keeps what is bound to the browser or React (scroll, theme colour, `withPending`, refresh orchestration, SVG cards, asset URLs). `core/` never imports `shared/`.
- **Alternatives considered**: a common folder inside `core/logic/` (rejected: generic helpers are not business logic); keeping everything in `shared/utils/` and accepting the inverted dependency (rejected).
- **Consequences**: supersedes the "utils → `shared/utils/` without exception" part of D-001; the guard against the former mix is the rule above, checked during reviews.


## D-033 — Food groups and per-profile choices on planned meals

- **Date**: 2026-10-15
- **Status**: accepted (owner); live in prod 2026-10-15
- **Context**: users find recipes such as « Pâtes au fromage » too generic: the cheese should be chosen when the meal is planned, per profile (each person of the household has their own preference), and follow into the shopping list and the journal. First and only case for now: cheese. Prepares the profile tastes feature (`dev/issues.json` #20-#24) on an easy case (substitution inside one food group, where grams are a meaningful equivalence).
- **Decision**:
  - **Food group** (catalogue, admin): new resource; a food belongs to at most one group (`groupId`, optional).
  - **Group ingredient**: a recipe ingredient may carry a `foodGroupId`; its `foodId` stays required and is the **recipe default** (member of the group). Nothing changes when no choice exists: recipe macros, shopping and journal use the default, journal ingredient overrides stay keyed by ingredient id.
  - **Profile default** (user data): each profile may set its preferred food per group.
  - **Choice per planned meal** (user data): per planning item × group ingredient × profile, a chosen food and an optional **quantity per portion** (in the ingredient's unit; `null` = the recipe quantity per portion), because 30 g of comté and 30 g of mozzarella are not the same meal (owner, 2026-10-15). Resolution for a profile: meal choice → profile default → recipe default; the quantity only exists on a meal choice.
  - **Shopping**: the parts are split pro rata across the account's profiles, each profile's share uses its resolved food and its quantity per portion (e.g. 4 parts, 2 profiles, recipe 30 g / portion: Léa mozzarella 60 g, Tom comté without quantity → mozzarella 2 × 60 = 120 g, comté 2 × 30 = 60 g); works with any number of parts without knowing who eats (#23). A line resolved only by the recipe default shows « à préciser ».
  - **Journal**: a profile's macros use its resolved food and, when set, its quantity per portion as the base quantity of that ingredient (per-day journal overrides still apply on top).
  - **Planning**: choices follow the meal on move and copy; replacing the dish drops them.
  - **V1 limits**: no group ingredient inside a base recipe (lifted by D-037 step 1, pending); allowed in demo (user data, cascades with the profile and the planning item).
- **Alternatives considered**: recipe variants per cheese (catalogue explosion, no per-profile choice); choice only in the shopping list (journal wrong, no per-profile choice); a candidate list per recipe ingredient instead of a reusable group (to re-enter in every recipe).

## D-034 — Food seasons by month

- **Date**: 2026-10-16
- **Status**: accepted (owner); API D-055 live in prod 2026-10-16, seasons imported (70 foods)
- **Context**: the weekly menu generator (roadmap § Ideas) should favour seasonal recipes from the first generation. Nothing in the catalogue said when a fruit or vegetable is in season.
- **Decision**:
  - **Data**: `Food.months` (1..12, `[]` = all year), on foods only, any category; mostly filled for « Fruits et légumes ». Months rather than 4 seasons (more precise, covers the seasons).
  - **Source**: ADEME Impact CO2 calendar (France), plus common sense for staples kept all year (garlic, onions, shallot, carrots, lemon) so that most savoury recipes are not blocked out of season; foods missing from ADEME (processed, imported, potatoes…) set by hand. Imported once by an API script, then edited in the Dashboard.
  - **Recipe season**: derived client-side, never stored: a recipe is in season for a month when every seasonal food it uses (bases included) is.
- **Alternatives considered**: 4 seasons (too coarse: strawberries vs squash); a season on recipes (redundant with their foods, drifts when a recipe changes); a server-side month filter (the catalogue is already in memory).

## D-035 — Weekly menu generator V1: front-only engine, scope

- **Date**: 2026-10-16
- **Status**: accepted (owner); in progress
- **Context**: households want a first menu proposal for a period that is good from the first generation. Everything needed already exists: recipes (meal types, categories, ingredients, bases, batch cooking), foods (categories, macros, seasons D-034), profiles (targets), freezer, per-account history (`GET /planning-slots/recipe-usage`) and the planning write path.
- **Decision**:
  - **Engine**: pure front logic in `core/logic/menuGenerator/`, catalogue passed as a parameter, seeded randomness (regenerate = new seed). **Write** (owner, 2026-10-17, replaces the first plan « existing slot path, not atomic »): one atomic call `POST /planning-slots/bulk-items` (API, built on request) with `onConflict: "skip"`: a slot filled meanwhile on another device is left as it is and reported, everything else is written in one transaction; the local cache is rebuilt from the response. Rejected: up to ~56 non-atomic calls through `saveSlot` (simple, available, but not optimised; owner preferred to wait for the API).
  - **Scope V1** (owner): free period (start → end, 7 to 14 days since 2026-10-17, may cross ISO weeks); lunch and dinner only (no breakfast; desserts added on 2026-10-17 through dessert rules, D-036); filled slots are kept, only empty ones are filled; hard filters: diet all / pescatarian / vegetarian (derived from ingredient categories meat, deli, fish and recipe categories, bases included), excluded foods (a group ingredient is excluded only when every food of its family is), season strict / preferred / off; scoring: no duplicate, no same category on consecutive meals, history (recently eaten recipes penalised), kcal of the meal near the active profile's target share (lunch 35 %, dinner 30 %, ±15 %); freezer batch portions all placed, spread at random over the period (2026-10-17, was « placed first »).
  - **UX**: settings window → preview (reason per meal, lock, regenerate a slot or the rest, kcal per day vs target) → write → offer to set the shopping days when the period has ≤ 10 days.
  - **Access**: built on `master` behind an admin guard (`useIsAdmin`), opened to everyone once validated by the owner.
  - **Not in V1**: food tags (pork, gluten…; owner: not useful for now), per-profile kcal (needs « who eats which meal », #23), presets, preparation time, cost.
- **Alternatives considered**: a `Dev` branch for the whole feature (merges and version conflicts); a server-side generator (catalogue already in memory on the client, no benefit); the displayed week only (owner wants a free period).

## D-036 — Menu generator settings V2: habits, quotas, foods to use, saved on the device

- **Date**: 2026-10-17
- **Status**: accepted (owner); in progress
- **Context**: owner feedback on the V1 (D-035): the target users are households with habits and strict rules (e.g. fish on Friday); the V1 settings are too coarse, must be retyped on each opening, the freezer meals always came first, and the settings window scrolls on a large screen.
- **Decision** (owner, 2026-10-17):
  - Every new setting is either **strict** (never bent: a slot that cannot respect it stays empty with the reason) or a **preference** (score).
  - **Habits**: rules « when » (days of the week picked one by one, or a range of days; no « week » / « weekend » notion; lunch / dinner / both) × « what » (protein type fish / red meat / white meat / deli / vegetarian, recipe category, a food, a recipe, « no meal ») × strength (mandatory / preferred / avoid / forbidden). No built-in or suggested rule (« fish on Friday » is not universal). Owner's rule list (2026-10-17) added: « un seul des repas du jour » scope, « sauf … » exceptions, targets « family » (catalogue D-033) and « list » (generator lists, a food in several lists, saved on the device), « recipe name contains »; quotas « between X and Y », « different foods », « not twice in a row »; foods in the freezer or « Surgelés » ingredients never count as out of season; same starch at most N meals in a row; day nutrition limits (lunch + dinner, one set for the household) replace the kcal shares when set (a day with one generated meal checks maxima only; strict excludes recipes without nutrition data); dessert rules per day and meal (fixed dessert recipes or a random one among a target, season applied, not counted in nutrition, added to kept meals that have none). Automatic side dishes (« soupe + tartine ») dropped for now (owner, 2026-10-17). Red / white meat come from recipe categories only (ingredients only say « Viande »), hence « meat (any) ».
  - **Weekly quotas** with the same targets (« red meat ≤ 2 », « fish ≥ 2 »), strict or preferred, per block of 7 days from the period start (owner 2026-10-17; the period is 7 to 14 days, « the generator is not meant for 2 days »), planned meals included; only an incomplete last block (8-13-day period) prorates « at least » (round(N × days / 7)), « at most » unchanged; a mandatory habit wins over a strict « at most » (warning).
  - **Foods to use** (leftovers, freezer products), the mirror of « Aliments à éviter », each food « bonus » or « at least once », placed on a random slot (not first); a strict request that cannot be met is reported as a warning.
  - **Freezer**: one checkbox, meals spread at random (no modes).
  - **Advanced**: repeat delay, same category in a row, kcal mode / tolerance / shares (each off / preferred / strict, defaults = V1 behaviour), favourite (bonus on one random slot) and banned recipes.
  - **Saved on the device** (local storage), not through the API: the owner wants the settings kept between openings; the period length is saved, not its dates (the start stays the selected day).
  - **Window**: full screen, settings and preview side by side, no scroll on desktop (`docs/ui-design.md`).
  - **Later** (roadmap ideas): leftovers « dinner served again at the next lunch », several setting sets (« Semaine normale », « Vacances »).
- **Alternatives considered**: settings per account through the API (shared by the household on every device; owner chose the device); freezer modes ignore / prefer / use up (owner: a single checkbox).

## D-037 — Choices inside bases and accompaniment groups

- **Date**: 2026-10-21
- **Status**: step 1 accepted (owner), API D-057 on dev (2026-10-21, not in prod yet), front done (v6.123.0, v6.124.0); step 2 accepted (owner, 2026-10-21, revised model below), API D-058 on dev with real payloads (not in prod yet), front done (v6.125.0 → v6.128.0)
- **Context**: a soup is eaten with an accompaniment (a slice of bread with butter, cheese or pâté…), reusable across many recipes like a base, and chosen per profile like a food family. A food family cannot cover it: the toppings come from different food categories and a food belongs to one family only (a family « Accompagnement tartine » would be a misuse). D-033 V1 also refuses an ingredient « au choix » inside a base, so a « Tartine fromage » base cannot let each profile pick its cheese.
- **Decision**:
  - **Step 1 — ingredient « au choix » inside a base** (lifts the D-033 V1 limit): a recipe of kind `base` may carry group ingredients. Every existing mechanism applies through the base: profile default per family, choice and quantity per planned meal × profile, shopping split, journal macros. A planned meal choice may target an ingredient of any base reached by the planned recipe (through `baseId`, recursively); when the same base is reached several times, the choice applies to every occurrence. Example: soup → base « Tartine fromage » (bread + cheese au choix, family Fromage): the profile default « Fromage → Comté » applies with nothing more to enter.
  - **Step 2 — accompaniments, per account** (owner, 2026-10-21; replaces the first proposal of a catalogue group referenced by recipes): « avec une soupe, chez nous on prend une tartine pâté ou des croûtons » is a household habit, and other households must be able to define their own, so an accompaniment is **user data of the account** (like the custom aisles, D-054), never part of the shared catalogue; **recipes do not change**.
    - **Accompaniment**: a name chosen by the household (« Soupe »), the **recipes it applies to, picked one by one** (no recipe category « Soupe » exists; « recipe name contains » targets deferred by the owner), and its **options**. An option is either a **catalogue recipe** (a base such as « Tartine fromage », or a simple recipe; with a number of portions per person, default 1) or a **food** with a quantity per person (« Croûtons » 20 g; found with the existing food search, the food list is already in memory). An accompaniment default: one option or « Sans accompagnement ».
    - **Per profile**: a default option per accompaniment, or « Sans accompagnement » (owner: a profile may take none); no profile default = the accompaniment default.
    - **Per planned meal**: when a dish targeted by an accompaniment is planned, each profile gets its default; it can be changed for that meal (another option or none). Step 1 applies inside a recipe option: a profile taking « Tartine fromage » keeps its cheese choice (profile family default or meal choice on the base ingredient).
    - **Shopping and journal**: each profile counts its own option (its share of the planned parts, like D-033); a profile « sans » counts nothing. The menu generator may use accompaniments later (the « soupe + tartine » idea set aside in D-036).
    - Unchanged: food families stay global (they describe foods, recipes reference them; per-profile tastes already live in defaults and meal choices); catalogue recipes stay admin-only (a household composes its accompaniments from existing recipes and foods, it cannot create its own « Tartine rillettes »).
- **Alternatives considered**: a food family per accompaniment (mixes categories, a food has one family); a candidate list per recipe (to re-enter in every soup, rejected in D-033 for the same reason); a catalogue group of bases referenced by recipes (first step 2 proposal: shared by every account, households could not define their own); per-account food families (recipes are shared and reference a family by id); the accompaniment added at planning time as a second dish of the slot (household-wide, not per profile, and the recipe does not know it goes with bread, which the menu generator needs).

## D-038 — Industrial version of a base

- **Date**: 2026-11-09
- **Status**: accepted (owner, 2026-11-09, issue #37); delivery A done: API D-060 and front v6.133.0 → v6.137.0, pushed on `master` and tested by the owner (2026-11-09); delivery B not started
- **Context**: a recipe uses a base as an ingredient (`Ingredient.baseId`, quantity = portions of the base): « Gnocchis maison », « Sauce tomate maison ». On some days the household buys the ready-made product instead. The « au choix » ingredient (D-033, D-037 step 1) swaps a food for another food of one family; it cannot replace a whole base by a store-bought food.
- **Decision** (owner's answers, 2026-11-09):
  - **Defined on the base, once** (catalogue, admin only, Recipe Builder base form): `industrialEquivalent: { foodId, quantity, unit } | null` on recipes of kind `base`, the quantity being for **one portion of the base**. It then applies in every recipe using the base (rejected: per recipe ingredient, to re-enter everywhere).
  - **Choice per planned meal, for the whole household** (not per profile: it is cooked or bought once): for a planned item and a base reached by its recipe (through `baseId`, recursively, same reachability and orphan rules as D-057), `{ baseId, version: "home" | "industrial" }`; a base reached several times is one choice. Absent = the default. A base reached only through an outer base chosen « industrial » has no effect (the outer replaces it).
  - **Delivery A**: catalogue field + choice per meal + effects; the default is « home ». **Delivery B**: per-account default per base (« chez nous les gnocchis sont toujours du commerce »), resolution meal choice → account default → home.
  - **Effects**: shopping: for an industrial base the base's ingredients are replaced by the food, quantity = equivalent quantity × base portions of the meal (same scaling as the base), listed in the food's own aisle; journal and planning macros: the food's macros for that quantity; group ingredients inside the replaced base (D-037 step 1) disappear for that meal. The recipe detail page is unchanged. The menu generator ignores it (home version).
- **Amendment (owner, 2026-11-09, after the first front delivery)**: the store-bought version is **not a whole recipe**, only **a name and a quantity** (« Béchamel Knorr », 0.5 sachet per portion). Because a shopping line is only checkable and synchronised between devices when it is a catalogue food (item checks are keyed by `foodId`, `shoppingCheckState`), the model stays « a catalogue food + a quantity per portion », but the Recipe Builder lets the admin **create the food from a name on the spot** (« Créer "Béchamel Knorr" » in the food search opens the dashboard's food form, name prefilled, macros prefilled with 0, aisle and unit chosen there; the created food is selected). **No API change.** When the product has **no nutritional values** (all macros 0), the macros, planning kcal and journal **keep the home version's values** (an approximation; the shopping list still shows the store-bought product). A product that needs other ingredients (powder + milk) is out of scope: list them as separate ingredients of the recipe, or ask for an alternative-base model.
- **Alternatives considered**: equivalence on each recipe ingredient (more flexible, re-entered in every recipe); choice per profile (nobody cooks twice); extending the food family mechanism (it swaps foods, not a recipe for a food); a separate store-bought recipe per base (duplicates the catalogue and loses the link with the base); a free-text product with no catalogue food (its checked state could not be stored nor synchronised, no aisle, no macros).
- **Consequences**: new API decision (catalogue field, planning item choices returned in every response, then account defaults); front: Recipe Builder field, `FoodChoiceModal` section, `shoppingAggregation`, `macroLogic` and the journal. Never merged before the API is confirmed in prod.

## D-039 — A particular shopping place on the list

- **Date**: 2026-11-09
- **Status**: accepted (owner, 2026-11-09, issue #39); API D-061 delivered (commit `ee3e84e`, migration `20261109180000_add_shopping_place`, 544 tests); front done (v6.138.0 account setting + flag on lines and extras, v6.139.0 filter, clipboard, recipe shortcut, extra form); pushed on `master` and tested by the owner (2026-11-09)
- **Context**: some items (or whole recipes) of the weekly list are bought at a particular place (the owner's household: « Merris »), the rest elsewhere. The household wants to see and copy the list of what to take there.
- **Decision** (owner's answers, 2026-11-09):
  - **One particular place, named by the account**, not hard-coded: an optional account setting « lieu d'achat particulier » (`AuthUser.shoppingPlaceName`, same mechanism as `freezerName`, via `PUT /me`). Without a name the feature is invisible. Several stores per account are out of scope for now (rejected: heavier, to revisit if a household needs it); hard-coding « Merris » rejected (other households).
  - **Per period, per list item**: a flag « at the place » on the period's item checks (keyed by food, like check / stock / freezer bags) and on the manual extras. It follows the period's lifecycle: changing the shopping days deletes it with the rest. No permanent per-food default for now (possible later delivery B, as for D-038).
  - **Whole recipe = a shortcut**, not stored: « Tout à prendre à <lieu> » on a recipe card flags every ingredient of that recipe (one batch write); the flag itself stays per item.
  - **Display**: a badge with the place name on the line; a filter « Tout / <lieu> / Ailleurs » above the list; the clipboard text follows the filter.
  - **Household items** (« Articles du quotidien ») are not concerned for now.
- **Alternatives considered**: a flag per recipe × day × slot like source checks (an ingredient aggregated from several recipes would be half at the place: ambiguous); a permanent per-food default only (loses the « this week » case); several named stores with a custom resource like the aisles (D-054).
- **Consequences**: API: `shoppingPlaceName` on the user and in every `AuthUser` response, `atPlace` on item checks and extras, a batch upsert for the item-check flag (as D-047 for source checks); front: account setting, flag on lines and extras form, recipe card shortcut, filter, clipboard. Never merged before the API is confirmed in prod.

## D-040 — Reference portion per person on a recipe

- **Date**: 2026-11-09
- **Status**: accepted (owner, 2026-11-09, issue #40); API D-062 delivered on dev (migration `20261109200000_add_recipe_portions_per_person`, real payloads received); front done (v6.140.0 catalogue + Recipe Builder field, v6.141.0 effects on the planning day kcal, journal, shopping and planning links); pushed on `master` and tested by the owner (2026-11-09)
- **Context**: for breakfast and snack recipes the household reasons in units per person (« 4 pancakes », « 2 sablés »). The day kcal in the planning and the journal count **1 recipe portion** per planned item, and the shopping list scales by `persons ÷ defaultPortions`. When a recipe is written with one portion per unit (20 pancakes = 20 portions), « 4 pancakes per person » is simply **4 portions per person**.
- **Decision** (owner's answers, 2026-11-09):
  - **Defined on the recipe, in the catalogue**: `portionsPerPerson`, a number > 0, default 1, edited by the admin in the Recipe Builder for every dish (intended for breakfast and snack, not restricted by meal type). The same reference for everyone (not per account nor per profile; the journal portion stepper still lets each person adjust their own).
  - **A bare number**, shown as « N portions » (no unit label such as « pancakes »).
  - **Applies everywhere the recipe is a planned item**: day kcal of the planning (kcal of one portion × `portionsPerPerson`), journal (the default portion count, 1 today, becomes the reference; an explicit journal override replaces it, it does not multiply it), shopping quantities (`persons × portionsPerPerson ÷ defaultPortions`), and the portions passed to the recipe detail page from the planning (`persons × portionsPerPerson`).
  - Unchanged: the number of persons of a meal, the menu generator, lunch and dinner (reference 1 unless the admin sets one), gram overrides of ingredient-kind recipes.
- **Alternatives considered**: a reference per account or per profile (« adult 4, child 2 »: heavier, the journal override covers the individual adjustment); a unit label next to the number (second API field, not needed to compute); restricting the field to breakfast / snack recipes (arbitrary, a lunch recipe may also be counted per person).
- **Consequences**: API: one numeric column on recipes (default 1, additive migration) exposed wherever `defaultPortions` is; front: Recipe Builder field, `macroLogic` default multiplier, journal default, `slotScaleFactor`, planning links. Details settled when implementing (v6.141.0): the journal override is an **integer** on the API (`portionsOverride` int > 0), so a decimal reference (1.5) is displayed as the default and the stepper moves to the next integers (1.5 → 2 or 1; a reference below 1 cannot be lowered); desserts count the reference too (`reference ÷ defaultPortions` instead of `1 ÷ defaultPortions`); accompaniments stay per person (not multiplied by the reference). Never pushed before the API is in prod.

## D-041 — Cooked weight of a finished dish, to express a portion in grams

- **Date**: 2026-11-14
- **Status**: accepted (owner, 2026-11-14, issue #51); API D-063 delivered on dev only (not in prod); front done locally in three steps (v6.142.0 catalogue + Recipe Builder field, v6.143.0 journal grams, v6.144.0 recipe detail). Never pushed before the API is confirmed in prod.
- **Context**: for a dish like bread the weight of the cooked result is not the sum of the raw ingredients (water evaporates). A recipe only knows portions; the gram quantity (`gramsOverride`, `baseGrams`) exists only for ingredient-kind recipes. One cannot say « 1 portion = 50 g of bread » nor log « I ate 80 g of bread ».
- **Decision**:
  - **Defined on the recipe, in the catalogue**: `cookedWeightGrams`, a number > 0 or null (default null = current behaviour), edited by the admin in the Recipe Builder. **Scope amended by the owner (2026-11-14): the field exists for the categories « bases », « cereal-products » and « pastries » (`supportsCookedWeight`, `recipePredicates.ts`), whatever the recipe kind; it is useless on the other dishes and hidden there** (the Recipe Builder sends `null` outside these categories). The API restriction « kind dish only » of D-063 is to be relaxed accordingly.
  - **Macros unchanged**: they stay computed from the ingredients (evaporated water has no energy). Only the grams ↔ portions conversion changes: factor = grams eaten ÷ `cookedWeightGrams` (the macros of the whole recipe are scaled by that factor), instead of going through the raw ingredients.
  - **Scope of the first delivery**: Recipe Builder field (with the read-only weight per portion, `cookedWeightGrams ÷ defaultPortions`), journal grams entry for such a recipe (besides the portion stepper), recipe detail « 1 portion ≈ N g » and kcal per 100 g cooked. The planning stays in portions, so the shopping list is unchanged. Ingredients stay in raw weight.
  - Not linked to `portionsPerPerson` (D-040).
- **Alternatives considered**: a weight per portion instead of a total (the total is what the owner weighs out of the oven, the per-portion figure is derived); grams in the planning and shopping (bigger change, no need yet); also for bases (dough, sauce: later if needed).
- **Consequences**: API: one nullable numeric column on recipes (additive migration) exposed wherever `defaultPortions` is, and confirmation that a journal `gramsOverride` is accepted on a recipe that is not of kind ingredient (to verify, not assumed). Front: catalogue mapping, Recipe Builder field, `computeDishMacros` grams branch for dishes with a cooked weight, journal entry, recipe detail. Never merged before the API is confirmed in prod.

## D-042 — Quantity of a base in a recipe: portions or grams of cooked weight

- **Date**: 2026-11-14
- **Status**: accepted (owner, 2026-11-14, issue #52, depends on D-041); API not started; front not started
- **Context**: a base such as bread now carries a cooked weight (D-041). In a recipe that uses it, the ingredient quantity is a number of base portions (`Ingredient.baseId`, unit `portion`). The owner wants to choose, per ingredient, between portions and grams of cooked weight (« 150 g of bread »). Nothing else changes: bases and dishes keep their portions and per-portion macros.
- **Decision**:
  - **Per ingredient choice**: an ingredient with a `baseId` has the unit `portion` (current meaning, default) or `g` (grams of cooked base). The stored unit says how to read the quantity, so no data migration: existing recipes stay in portions.
  - **Choice offered only when the base has a cooked weight**; the Recipe Builder shows the unit selector on a base ingredient only then.
  - **One conversion**: base portions = grams ÷ (`cookedWeightGrams` ÷ base `defaultPortions`) (`portionsFromCookedGrams`), applied wherever the code reads the quantity of a base ingredient as portions: macros (`macroLogic`, `builderMacrosLogic`), shopping (`shoppingAggregation`, accompaniment recipes), linked bases (`basePortionsNeeded`), recipe cards text (« 150 g » instead of « 1.92 portion »).
  - **Removing the cooked weight of a base used in grams is refused**: the Recipe Builder blocks the save with a clear message, the API refuses too while an ingredient uses the base in grams. **Changing** the weight keeps the grams of the ingredients (only their portion conversion, hence the macros, changes).
- **Alternatives considered**: removing portions and showing macros per 100 g for weighed recipes (large rewrite, rejected by the owner); storing grams converted to portions (rounding errors, wrong after a weight change).
- **Consequences**: API: accept the unit `g` on an ingredient with a `baseId` (to verify, not assumed), relax D-063 « kind dish only » for the cooked weight (the front gates it by category, D-041 amended), refuse removing a cooked weight used in grams. Front: see issue #52. Never merged before the API is in prod.

## D-043 — Food prices: a store, a price per kg, an indicative estimate

- **Date**: 2026-11-14
- **Status**: accepted (owner, 2026-11-13 and 2026-11-14, issues #41, #44 to #49); API D-064 **live in prod** (routes mounted, checked 2026-11-14); front step 1 (data layer) done, shopping list UI next (mock-up validated, artifact « Courses — maquette » v10 to v12).
- **Context**: the owner wants to know roughly what a planned menu costs. No public store API (Leclerc checked 2026-11-13), so prices are entered by hand by admins.
- **Decision**:
  - Prices are **global to the application**, tied to a **price store** (name, city) created by admins; each account picks its store (`AuthUser.priceStoreId`, `PUT /me`). **Effective store** = the account's store, else the only store when exactly one exists, else none (no estimate) — so existing accounts need no migration (`effectivePriceStoreId`, `core/logic/price/priceLogic.ts`).
  - **One reference price per food: the price per kg** (per litre for liquids, 1 ml = 1 g as for macros). Other units go through the food's unit weight (`toGrams`); a food without a usable conversion or without a price is **missing** and is left out of the total.
  - **The estimate is indicative only**: quantities planned × latest known price of the effective store. It is not an exact amount, and what was actually paid is **not shown** (owner, 2026-11-14: no « déjà payé », no « payé X € »). A missing price only changes the colour of the amount (orange), nothing else.
  - **History kept**: every entry is a new row (`POST /food-prices`), never overwritten; a wrong entry is deleted (`DELETE /food-prices/:id`) and the previous one becomes the latest. The bootstrap only carries the latest price per (food, store) with its `id`.
  - An in-store entry may carry `paidTotal` and `purchasedGrams` (both or neither, API `CHECK`) for a future stock feature (#42); they are stored, not displayed.
  - Entry points (admin, hidden in demo): the shopping list detail sheet (« Mettre à jour le prix ») and, when the device setting « Saisir le prix en cochant » is on (off by default), ticking a line in store mode. Fields in this order: weight, price paid, price per kg; two give the third.
- **Alternatives considered**: per-account prices (no: the owner wants one shared base); scraping store sites or leaflets (refused); Open Prices (Open Food Facts) as an automatic source later, after a coverage test; showing the amount paid (refused: the period is not linked to the price rows, the figure would be wrong after a reload).
- **Consequences**: front: `core/domain/price.ts`, `priceService`, `usePriceStore` (filled from `/bootstrap` `priceStores` and `foodPrices`), pure logic `core/logic/price/`. Contract: `docs/api.md` § Prices.

## D-044 — Cooking sheets per (food, method): cooking times and raw → cooked ratio

- **Date**: 2026-11-17
- **Status**: accepted (owner, 2026-11-17, issues #57 and #58); API D-065 **live in prod** (confirmed by the API session, 2026-11-17); front done and pushed (v6.155.1 to v6.158.0: data layer, admin entry, recipe detail sheet, Recipe Builder hint).
- **Context**: the owner wants cooking times per method on foods (#57) and a raw / cooked weight correspondence on some foods (#58: starches, legumes, vegetables). A food is often cooked several ways, and its weight change depends on the way (potato: steamed ≈ same weight, oven ≈ lighter).
- **Decision**:
  - **One structure for both issues**: a cooking sheet per (food, method), identified by that couple (no id). Closed list of methods, in this order: oven, steam, air_fryer, boiled, pan, microwave, pressure_cooker, raw (UI labels: Four, Vapeur, Airfryer, À l'eau, Poêle, Micro-ondes, Cocotte-minute, Cru).
  - A sheet holds an optional **duration range** in whole minutes (min required when a duration is given, max ≥ min), an optional **temperature** (°C, oven and air fryer only), an optional **raw → cooked ratio** (cooked grams = raw grams × ratio, > 0, ≤ 10, 3 decimals) and an optional **note** (≤ 120 characters). Every method but raw needs a duration or a ratio. **raw** is a pure « se mange cru » marker: note only.
  - Admins edit all the sheets of a food at once (full replacement, `PUT /foods/:id/cookings`); everyone reads them from `/bootstrap` `foodCookings`.
  - Display (owner): admin entry in Dashboard › Données › Aliments, a « Cuisson » sheet on the recipe detail (ingredients with sheets, cooked weight for the chosen portions), and a cooked-weight hint in the Recipe Builder. Not in the journal for now (no cooked-grams entry).
  - The ratio never changes macros nor prices: both stay computed on raw weights.
- **Alternatives considered**: one ratio per food (refused: wrong for foods cooked several ways); a single duration value (refused: package ranges are more faithful); free-text methods (refused: duplicates); temperature on every method (refused with the API session, can be relaxed later without a destructive migration).
- **Consequences**: front: `core/domain/cooking.ts`, `cookingService`, `useFoodCookingStore` (filled from `/bootstrap` `foodCookings`, empty when the API does not send it), pure logic `core/logic/cooking/` (`cookingLogic.ts`: display and cooked grams; `cookingFormLogic.ts`: drafts and validation mirroring the API messages). Contract: `docs/api.md` § Cooking sheets.

## D-045 — One form of absence per value; TypeScript strictness options

- **Date**: 2026-11-24
- **Status**: accepted (owner), issue #64 (front and API alike)
- **Context**: the code mixed `undefined` and `null` on the same value and used them as business states (« `undefined` = no choice, `null` = none », seen while doing #61). Owner: « je ne veux en aucun cas ce genre d'erreur non propre », « les projets le plus propre possible ».
- **Decision**:
  - Rule (AGENTS.md golden rule 20, `docs/conventions.md` § Absence and states): one form of absence per value (never `X | null | undefined`, never `?: X | null`); a state with more than two cases is a discriminated union (`kind`); `null` only at the API boundary (rewritten below); `undefined` only where JS produces it, handled on the spot. Rule 1 enforced by ESLint `no-restricted-syntax`, extended folder by folder while the code is cleaned; rules 1 and 2 first, the `| null` outside the API boundary in a later step.
  - Partial-update bodies (owner, 2026-11-24, option A): the three states « absent = unchanged, `null` = cleared, value = replaced » are the HTTP contract, so `?: X | null` is allowed only in interfaces named `Api…Body` in `core/services/` (ESLint selector excludes them); a `{ kind: "keep" | "clear" | "set" }` type on every update call was rejected as heavier for no bug avoided.
  - TypeScript `noUncheckedIndexedAccess`: **adopted** and enabled in `tsconfig.app.json` and `tsconfig.node.json` (107 errors on 2026-11-24, fixed in the same commit, v6.166.6). Record lookups by code (`recipes[code]`, `foods[id]`) are typed as possibly missing, which turns rule 4 into a compiler check and catches real silent bugs (deleted food, unknown code).
  - TypeScript `exactOptionalPropertyTypes`: **rejected** (owner, 2026-11-24, on the agent's advice). Measured: 83 errors, about half on data objects built with `key: undefined` (style only: every API payload goes through `JSON.stringify`, which drops them, and the domain reads `x?.y` / `x ?? default`), the other half on React props forwarded from parent to child (`onCopy={onCopy}`), the normal React idiom. Fixing them would mean `?: T | undefined` (the very double absence the option forbids), conditional spreads, or required `T | undefined` props everywhere: permanent friction on every new component for no bug avoided. Data objects built with `undefined` keys are cleaned by hand during the folder cleanups instead.
  - Rule 3 rewritten (owner, 2026-11-24, option A on the agent's advice): « `null` only at the API boundary » became « `null` means only « no value » ». Measured: 563 `| null` outside `core/services/`; read in `core/domain` and a sample of `core/logic`, almost all are plain two-state absences (`instructions`, `unitWeight`, bounds, uncomputable results, settings falling back to a default). Removing them would mean `undefined` (the absence the owner rejects) or a `{ kind: "none" } | { kind: "some" }` wrapper on every field: noise, no bug avoided. The real defects are absences that encode one case among several or fields that only exist for one `kind`; rule 2 now covers them explicitly. Audit list (types to turn into unions) in issue #64 and `log/devlog.md`.
- **Alternatives considered**: a custom `Option<T>` type (not idiomatic in TypeScript; React, Dexie and date-fns return `undefined` anyway); enabling `exactOptionalPropertyTypes` with `?: T | undefined` props (reintroduces the double absence).
- **Consequences**: `eslint.config.js` `ignores` list shrank with each cleanup step and disappeared in v6.166.10 (rule 1 enforced on all of `src/`); `docs/development.md` § Golden-rule checks has the greps; the API session applies the same rule in its repo.

## D-046 — A frozen base batch is planned through a dish, as a third base version that moves the stock

- **Date**: 2026-11-25
- **Status**: accepted (owner, 2026-11-25, issue #66); API D-073 (frozen base version, stock) and D-074 (atomic move) **live in prod** (API commit `fdb7e35`, 2026-11-25); front v6.167.0 to v6.167.7.
- **Context**: base batches (sauces, doughs…) could be added to the menu like a dish batch, but a base is never eaten alone. The owner wants a base batch to be planned only inside a dish that uses it, with the portions and the amount of base taken chosen at planning time.
- **Decision**:
  - « Ajouter au menu » on a base batch lists only the dishes reaching the base (nested bases included); none → a message and no action.
  - The link is stored by the API as a **third base version** on the planned item, `{ baseId, version: "frozen", freezerItemId, quantity }`, next to « home » / « industrial » (D-038), so copy rules, pruning, the slot diff and « Choix du repas » reuse the existing mechanism.
  - Effects: the frozen base is not bought (shopping, « bases à préparer », cost estimate); macros keep the home version.
  - **Stock moves with the link**: the API takes the quantity from the batch when the link is written and gives it back when it disappears, in the same transaction; except for a past meal (owner option A: the base was eaten); a batch emptied by links stays at 0 (« Épuisé · prévu au menu »); deleting a linked batch sends the meals back to home; changing the unit of a linked batch is refused.
  - A copy drops the frozen link (it would take the quantity twice); a drag and drop goes through an atomic API move that keeps items and links (`POST /planning-slots/move`, D-074), in which the slot persons stay with the day (owner: « le nombre de personnes reste sur le jour, pas sur le repas ») and the item overrides follow the item.
- **Alternatives considered**: a dedicated `frozenBases` field on the planned item (refused: duplicates the base version mechanism); decrementing manually like dish batches (refused by the owner: the link must move the stock); giving back on a past meal (refused: counted as eaten); blocking the move of a past meal holding a frozen base (refused: frustrating), or dropping the link on move (loses the stock).
- **Consequences**: front `BaseVersionChoice` union, `linkedQuantity` on batches (Dexie v17), `applyFreezerBatches` after planning writes, `frozenBaseLogic.ts`, `applyFrozenBases` in shopping, `moveMeal`. Contracts: `docs/api.md` § Planning (move) and § Freezer (frozen base).
- **Follow-up (owner, 2026-11-26)**: a moved dessert keeps its own persons (item settings follow the item, slot persons stay on the day); the field of the base batch « Ajouter au menu » stays « Personnes » (same value as the planning « Personnes »); deleting a batch still planned asks for confirmation (front v6.169.7).

## D-047 — A food-linked ingredient takes its category from the food; diet detection uses a food origin

- **Date**: 2026-11-25
- **Status**: accepted (owner, 2026-11-25, issue #69); API D-076 (food origin) and D-077 (category derived on read, phase 1 `64513a8`, phase 2 `b7c5653`: stored values removed) **live in prod** (2026-11-25); front v6.168.0 to v6.168.4.
- **Context**: every recipe ingredient stored its own category (the shopping aisle), copied from the food when picked in the Recipe Builder and editable there, never following the food afterwards. Prod audit: 1,276 of 6,439 food-linked ingredients held a stale category (the food had been moved to a newer one: Bio, Surgelés, Internet, Produits frais, Conserves), none of them a deliberate choice. The same aisle was used by the menu generator to detect meat / fish / deli and by the season logic (« Surgelés » exempts from the season).
- **Decision**:
  - A food-linked ingredient has **no category of its own**: the API returns the food's (option B, derived on read, same response field); the Recipe Builder shows it read-only and does not send it. Changing a food's category in the Dashboard therefore changes every recipe, the shopping aisles and the season exemption at once (the food save already resyncs the catalogue).
  - **Free-text** ingredients keep their own category, chosen in the Recipe Builder (owner, option A: they need an aisle in the shopping list); base-linked ingredients keep « Recette ».
  - Meat / fish / deli for the menu generator come from a new **food origin** (`meat | fish | deli | none`), independent of the aisle (canned tuna is « Conserves » and « Poisson »; textured soy and pita, filed under « Viande », are « none »); the recipe category rules stay.
- **Alternatives considered**: API option A (store the food's category on write and cascade a category change, refused: a copy plus a cascade is what produced the 1,276 stale rows); keeping the aisle for the diet and adding name rules (« thon », « saumon »…, refused: fragile).
- **Consequences**: at the API deploy 1,276 ingredients change aisle (762 condiment → bio, 93 → frozen, so exempt from the season, 53 → internet…), the 5 « Petit-lait » lines go to the « Hors achat » aisle. Front: `Food.origin` (`core/domain/foodOrigin.ts`), food form « Origine », `recipeDietProfile(recipe, catalogue)`, `hasOwnCategory` in the Recipe Builder. API phase 2 done (stored values removed), contract unchanged.

## D-048 — An ingredient removed during preparation keeps a positive quantity and real macros, flagged on the recipe line

- **Date**: 2026-11-26
- **Status**: accepted (owner, 2026-11-26, issue #67); API D-078 and the front **live in prod** (owner, 2026-11-26; API commit hash `TODO(owner)`); front v6.169.0 to v6.169.6; tested and closed by the owner (2026-11-26).
- **Context**: a user's homemade Greek yogurt is 1,000 g of milk + 125 g of yogurt, drained: about 500 g of whey is thrown away, carrying nutrients (lactose mostly). The cooked weight (D-041) models a loss of water only, so the recipe macros overestimated the carbohydrates. The user proposed a negative quantity or a food with negative macros.
- **Decision**:
  - A recipe line linked to a food can be flagged **`removed`** (boolean on the `food` variant of the ingredient link): positive quantity (> 0, required), the food's real macros, never on a base, a free-text line or a line « au choix ».
  - Its macros are **subtracted** from the recipe (each nutrient floored at 0) and its grams from the recipe weight (1,125 − 500 = 625 g), so no cooked weight is needed for this case and the cooked weight stays limited to its three categories.
  - It is **not bought and not priced**: skipped by the shopping aggregation (list, « Par repas », place filter, planning cost), the recipe price and cooking sheets, the season and the generator preferred foods. It still counts for the generator diet and excluded foods, the Dashboard « used foods » stat and the search by food (the food is part of the recipe).
  - Display: last on the recipe cards as « Retiré : … », « retiré » tag on the macro page; in the journal it is not listed among the adjustable ingredients but stays in the stored override set, so its scaled quantity keeps being subtracted.
- **Alternatives considered**: a negative quantity (refused: it would leak into shopping, totals and prices, and a sign meaning « removed » is a hidden state, golden rule 20); a food with negative macros (refused: pollutes the catalogue, the Dashboard and food choices); opening the cooked weight to every category (not needed once the removed grams are subtracted).
- **Consequences**: `removed` in `IngredientLink` (Dexie v18), `isRemovedIngredient` (`core/domain/ingredientPredicates.ts`), Recipe Builder draft store v6 and `IngredientRemovedToggle`; the front always sends `removed` (an absent field resets it on a `PUT`). Limit: the whey composition varies with draining, the result stays an estimate. Contract: `docs/api.md` § Recipes.
