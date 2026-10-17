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
  - **V1 limits**: no group ingredient inside a base recipe; allowed in demo (user data, cascades with the profile and the planning item).
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
  - **Scope V1** (owner): free period (start → end, max 14 days, may cross ISO weeks); lunch and dinner only (no desserts, no breakfast: the household adds them by hand); filled slots are kept, only empty ones are filled; hard filters: diet all / pescatarian / vegetarian (derived from ingredient categories meat, deli, fish and recipe categories, bases included), excluded foods (a group ingredient is excluded only when every food of its family is), season strict / preferred / off; scoring: no duplicate, no same category on consecutive meals, history (recently eaten recipes penalised), kcal of the meal near the active profile's target share (lunch 35 %, dinner 30 %, ±15 %); freezer batch portions placed first.
  - **UX**: settings window → preview (reason per meal, lock, regenerate a slot or the rest, kcal per day vs target) → write → offer to set the shopping days when the period has ≤ 10 days.
  - **Access**: built on `master` behind an admin guard (`useIsAdmin`), opened to everyone once validated by the owner.
  - **Not in V1**: food tags (pork, gluten…; owner: not useful for now), per-profile kcal (needs « who eats which meal », #23), presets, preparation time, cost.
- **Alternatives considered**: a `Dev` branch for the whole feature (merges and version conflicts); a server-side generator (catalogue already in memory on the client, no benefit); the displayed week only (owner wants a free period).
