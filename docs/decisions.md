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
