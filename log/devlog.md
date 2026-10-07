# Devlog

Session journal, most recent first. Any future session should be able to resume from here.

Entry format:

```
## YYYY-MM-DD — Title
- Done: …
- Numbers: versions, commits, measurements (optional)
- Problems: …
- Still open: …
```

Entries before 2026-10-07 were migrated from the former agent memory and `CLAUDE.md`.

---

## 2026-10-07 — `features/` review: freezer, step 2 (v6.78.14)

- Done: `AddBagForm` and `EditBagForm` share the new `BagFields` component (quantity, unit, preparation, confirm / cancel); the category card summary line → `formatFreezerCategoryCount` (`freezerStockLogic`); the duplicate food name check, written twice with slightly different rules (one trimmed, one not) → `isFreezerFoodNameTaken` (`freezerItemsLogic`), used by `AddFreezerItemModal` and `FoodSearchInput`; `BagRow` no longer splits and rebuilds the edit payload (done in step 1).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 3 (confirmation before deleting a non-empty category), step 4 (theme colours, « Aliment » tab orange).

## 2026-10-07 — `features/` review: freezer, step 1 (v6.78.13)

- Done: read-only review of `features/freezer` (17 files), findings arbitrated by the owner (`dev/refactoring.md`). Step 1: « Ajouter à la catégorie » stayed stuck on « Enregistrement… » forever if the API call failed — now `withPending` and the modal stays open on error; six forms with hand-made `saving` states (freezer rename, category rename ×2, category creation, add bag, edit bag) go through `withPending` and keep the form open on error; the three inline renames share the new hook `useInlineRename`; every freezer `withPending` call now catches its rejection (no unhandled promise; the global toast still shows).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 2 (shared `BagFields` for add/edit bag forms, category summary line and duplicate-name check to `core/logic/freezer`), step 3 (confirmation before deleting a non-empty category), step 4 (theme colours; « Aliment » tab orange when selected, owner's choice).

## 2026-10-07 — Named theme colours, Shopping migrated (v6.78.12)

- Done: the theming rule « never `dark:bg-slate-*` » turned out impossible as written (`white` is not overridden in dark mode, so ~300 `bg-white dark:bg-slate-100`-style pairs are needed); the owner chose named colours (D-031): `surface`, `surface-raised`, `muted`, `subtle`, `subtle-tint`, `strong` in `src/index.css`, table in `docs/ui-design.md`. Shopping + household files migrated (40 classes, identical rendering), except three one-offs mapped to the nearest colour: the close buttons of `SourcesModal` / `PricePerKgModal` (`hover:bg-strong`, one step darker on hover in light mode) and the Shopping tab bar (`bg-muted`, slightly more opaque in dark mode). Golden-rule grep fixed to also catch `dark:hover:` (real count 258 in 96 files after this step). This closes the Shopping + household review.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (light and dark mode to compare).
- Still open: next `features/` folder of the P4 review; migrate the other features to the named colours as they are reviewed.

## 2026-10-07 — Batch source checks (v6.78.11)

- Done: the batch endpoint `PUT /shopping-periods/:periodId/source-checks` is live in prod (confirmed by the owner). Checking a source, a base group or a whole recipe card in the « Repas » view now sends one call (deduplicated requests, all or nothing) instead of one request per source in series; the state is rebuilt by id from the response. `withPending` accepts an array of keys so every affected row shows its spinner. `upsertSourceCheck`, `SourceCheckTarget` and the now unused `sourceCheckIdByKey` removed. Contract moved from § Planned to § Shopping in `docs/api.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser nor against the API.
- Still open: owner test in prod (check / uncheck a recipe card and a base group, reload); step 4 of the shopping review (theme classes).

## 2026-10-07 — `features/` review: shopping + household, step 3 (v6.78.10)

- Done: `features/household/` (3 files) moved to `features/shopping/components/household/` (it only serves the Shopping « Articles » tab since the merge); household category order → `HOUSEHOLD_CATEGORY_ORDER` in `core/domain/household.ts`; `IngredientCheckRow` uses `remainingToBuy` / `checkedSourcesQuantity` instead of its own copy; `RecipeShoppingCard` loses an unused `recipeId` prop and a type re-export nobody imported; `SourceGroupRow` formats its three quantities with one local `formatSourceQty` (2 decimals kept). `AGENTS.md` project map updated.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: switch to the batch source-check endpoint (live in prod, confirmed by the owner); step 4 (theme classes of the shopping files).

## 2026-10-07 — `features/` review: shopping + household, step 2 (v6.78.9)

- Done: the check state of `ShoppingModule` (7 `useMemo` maps, 3 copy-pasted patch functions, loading effect, all mutations) moved to the pure `buildShoppingCheckState` / `collectSourceCheckRequests` (`core/logic/shopping/shoppingCheckState.ts`) and the hook `useShoppingPeriodChecks`; `ShoppingModule` 641 → 416 lines. Fixed on the way: the loading effect reset state synchronously (rule 7) — data is now stored per period and read only for the current one; a food present under two keys (two units, or recipe + base) showed its source check on one line only and could hit a 409 when checking the other — checks now apply to every key of the food and batch writes are deduplicated by API key. Batch source-check API contract received (not deployed), recorded in `docs/api.md` § Planned.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 3 and 4 of the shopping review; front switch to the batch endpoint once the owner confirms it is live in prod.

## 2026-10-07 — `features/` review: shopping + household, step 1 (v6.78.8)

- Done: read-only review of `features/shopping` + `features/household` (18 files), findings arbitrated by the owner (`dev/refactoring.md`). Step 1 fixes: stock input in the ingredient row uses `DecimalInput` (commas accepted, no silent 0) instead of `type="number"` + `parseFloat`; price-per-kg calculator parses with `parseDecimal` and guards its `localStorage` write; household « Tout réinitialiser » goes through `withPending('household-reset')` (no double click, spinner always stops, button disabled while pending); shopping checks loading, stock commit and clipboard copy no longer leave unhandled rejections.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 2 (shopping check state → `core/logic/shopping/shoppingCheckState.ts` + `useShoppingPeriodChecks`, includes the synchronous reset in the loading effect), step 3 (`remainingToBuy` in `IngredientCheckRow`, household category order to the domain, small cleanups, `features/household` moved under `features/shopping`), step 4 (theme classes of these files); API prompt for batch source checks relayed by the owner.

## 2026-10-07 — Atomic freezer item and shopping period writes (v6.78.7)

- Done: both endpoints confirmed live in prod by the owner. `addItemToCategory` (food) sends its bags in the `POST /freezer-items` call and builds the cache from the response (`mapApiItem`, now exported); the step-3 `try/finally` is gone. `replacePeriod(days)` is a single `PUT /shopping-periods/current` instead of DELETE + POST + one POST per day. Contracts moved from § Planned to § Freezer and § Shopping in `docs/api.md`. This closes the `core/services/` review.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser nor against the API.
- Still open: owner test in prod (add a food with a bag to the freezer; change the shopping days, then empty them); P4 continues with `features/`.

## 2026-10-07 — Atomic freezer / shopping period contracts recorded (v6.78.6)

- Done: the API session answered the relay prompt with two atomic endpoints (`POST /freezer-items` with `bags`, `PUT /shopping-periods/current`), implemented and tested locally, not deployed. Contracts recorded in `docs/api.md` § Planned; checked against `addItemToCategory` and `replacePeriod` (no blocker: the add-freezer modal sends one bag with quantity > 0; the store keeps its own days and only uses the period id).
- Still open: front step (`fix:`) once the owner confirms both endpoints are live in prod; then the `core/services/` review is closed and P4 continues with `features/`.

## 2026-10-07 — `core/services/` review, step 3 (v6.78.5)

- Done: local cache kept consistent with the API on partial failures. `addItemToCategory` (food): if a bag creation fails, the item and the bags already created are still written to the cache before the error propagates (a retry no longer creates a hidden duplicate). `householdService.clearAll`: `Promise.allSettled`, only the flags actually deleted leave the cache, then the first error is rethrown. `useMenuStore.setShoppingDays`: the new period id is stored before clearing the household flags, so a failure there no longer leaves the store pointing to the deleted period. `useFreezerStock` reads through `getCategories()` (alphabetical order, owner's choice) instead of Dexie directly.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: API prompts (atomic freezer item + bags, shopping period days in one call) relayed by the owner; `HouseholdPanel.handleReset` has no `withPending` and leaves the spinner on if `clearAll` throws (for the `features/` review).

## 2026-10-07 — `core/services/` review, step 2 (v6.78.4)

- Done: freezer bag dates (`freezerService.today`, `AddFreezerItemModal`) used `toISOString().slice(0, 10)`, i.e. the UTC date: a bag frozen between midnight and 1-2 am (France) was dated the day before. Now `format(new Date(), "yyyy-MM-dd")` (local date, date-fns).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: same UTC pattern in `PlanningModule` (URL `d` parameter), for the `features/` review; step 3 of the services review.

## 2026-10-07 — `core/services/` review, step 1 (v6.78.3)

- Done: read-only review of the 23 files of `core/services/`, findings arbitrated by the owner (decision log in `dev/refactoring.md`). Step 1: the five Dexie catalogue cache files (`foodService`, `outdoorService`, `householdItemsService`, `recipeCategoriesService`, `recipesService`) merged into `catalogueCacheService.ts`; profile mapper moved to `core/logic/profile/profileApiMapper.ts`; unused `getAllSlots` and `fetchProfiles` removed; `updateBagInFoodItem` builds its update object once.
- Numbers: 23 → 19 files in `core/services/`. `npx tsc -b` + `npm run lint` pass; no behaviour change intended, not checked in a browser.
- Still open: step 2 (freezer bag date in local time instead of UTC), step 3 (cache kept consistent on partial failures in freezer item creation and household « clear all »; `useFreezerStock` through `getCategories`, alphabetical order), API prompts for atomic freezer item + bags and shopping period days (written at step 3).

## 2026-10-07 — Migration notes arbitrated (v6.78.2)

- Done: the owner arbitrated the six `Note (migration)` boxes: data-flow step 1 confirmed; predicates live in `core/domain/`; `useLiveQuery` on cached user data is intended; `core/logic` → `shared/utils` imports kept as a P4 refactoring point; theming rule kept, the 217 pre-existing `dark:*-slate-*` classes to be fixed progressively; legal-notice URL in `legalContent.ts` listed as a permanent grep exception. Boxes removed from `docs/architecture.md`, `docs/conventions.md`, `docs/development.md`; two items added to `docs/roadmap.md` § P4.
- Still open: font licences (`ATTRIBUTION.md`); `git rm --cached .claude/settings.local.json`.

## 2026-10-07 — Agent context migration

- Done: restructured the agent context into `AGENTS.md` (router), `docs/` (architecture, development, conventions, ui-design, api, glossary, roadmap, decisions, 7 specs), `log/devlog.md`, `ATTRIBUTION.md`; `CLAUDE.md` now only imports `AGENTS.md`. Former `CLAUDE.md` archived in `docs/archive/`, traceability table in `docs/archive/migration-map-2026-10-07.md`. The WSL auto-memory (39 files) was moved out of the repo to the owner's private folder (it contained sensitive and personal details). `.claude/settings.json`: Git write commands and the private folder denied for agents. Sessions move from WSL to PowerShell.
- Numbers: 282 information blocks traced; version 6.78.0 → 6.78.1.
- Problems: contradictions found between the old docs and the code are flagged with `Note (migration)` boxes in `docs/architecture.md` and `docs/conventions.md`.
- Still open: owner arbitration of the `Note (migration)` boxes, including 217 pre-existing `dark:*-slate-*` classes in 97 files that contradict the theming rule; font licences (`ATTRIBUTION.md`); `git rm --cached .claude/settings.local.json`; the `Read` deny on the private folder does not stop shell commands (see `AGENTS.md`).

## 2026-10-05 — Demo mode (v6.78.0)

- Done: « Essayer la démo » (ephemeral guest account, ~2 h) instead of registration: `startDemo`, `useIsDemo`, `useDemoCountdown` + `demoLogic`, `DemoBanner`, adapted `AccountModal` / `SettingsPopover`, demo accounts hidden in `UsersPanel`. API contract received and front coded the same day; committed by the owner.
- Still open: API must be in prod before the front. ISO week-year bug reported by the API session, not fixed (roadmap).

## 2026-10-03 — Decimal input, media cache, recipe filters (v6.75.26 → 6.77.0)

- Done: `parseDecimal` + `DecimalInput` (commas accepted, fields can be cleared) — `fix` 6.75.26. Media cache: `onRehydrateStorage` referenced the store during `create()` (TDZ, swallowed) so expired signed URLs were never purged and the timer never re-armed; fixed with `merge`, timer after creation, `version: 1` purge, `refreshIfDue`, `useImageErrorCapture` for SVG cards — `fix` 6.75.27. Recipe filters by type with medians (6.76.0 fixed kcal 350/450, then 6.77.0 medians for 5 macros).
- Still open: risk of re-resolution loop if a returned signed URL also fails (pre-existing).

## 2026-09-27 → 2026-09-30 — Token lifetime and logouts; planning search

- Done: access-token TTL confirmed 30 days in prod (`exp − iat`); the owner had been testing against the local API whose own `.env` differed. Real cause of logouts: `performTokenRefresh` cleared the stored refresh token on any failure, including network errors / 502-503 while Render woke up → now only on 400/401/403, with retries (front commit `d4b7dd3`). API session added a 15 s replay grace and JSON logs (`refresh_rejected`, `sessions_wiped`). Images: expired signed URLs kept in `cipe_media_overrides` caused `"exp" claim timestamp check failed`; fixed in `useMediaStore` + `earliestExpiry`. Planning pickers capped at 30 results + `useDeferredValue` (v6.75.25), fixing tablet/phone crashes.
- Problems: a 401 « Session expirée » despite a refresh token being sent remained unexplained; the owner has no access to Render request logs.
- Still open: confirm in prod that logouts stopped; proposed local trace of refresh failures (not accepted).

## 2026-09-25 — Big code review / refactoring (v6.74.1 → 6.75.23)

- Done: old `docs/` removed (stale since the API); `public/` cleaned (unused assets, `BASE_URL`, manifest `id`, `theme-color` follows the theme, category images by slug ~6 MB → ~0.6 MB); `scripts/` removed; root cleaned (`.gitignore`, unused deps, CI lint step, README rewritten); `core/domain` split (`types.ts` → 7 files); `core/typed-db` → `core/catalogue`; catalogue change signal + snapshots + cross-device refresh (`useAppRefresh`); `core/logic` fully audited and split (shopping, recipeBuilder, freezer, planning, recipe, dashboard); shared utilities; macro labels centralised. Bugs fixed on the way: macro filters in category view always false; SVG cards stale until reload; food form id validation.
- Numbers: one commit per step.
- Still open: `core/services/`, then `features/`, then `shared/` (decision log in `dev/refactoring.md`).

## 2026-09-24 — Journal average, Atwater targets, tablet portrait, profiles, scroll restore (v6.71.0 → 6.74.0)

- Done: week average modal; computed kcal targets; `tablet:` variant defined (it had been used but never defined) and Journal + Planning adapted; **profiles delivered in prod v6.73.0** (API first, then front; bug fixed before release: uncontrolled grams input not reset on profile switch); scroll restoration in the catalogue; API cascade of food renames to recipe ingredients (tested OK).
- Still open: tablet pass on remaining screens; food-rename backfill to run by the owner; V2 "tastes per profile" = ideas only (#20-#24), not to be started without the owner's go.

## 2026-09-23 — Journal per-ingredient overrides in prod; bootstrap

- Done: issues #16-#19 (#16 stable `Ingredient.id` in the builder, #17 API upsert by id, #18 day-scoped ingredient overrides, #19 Journal UI), commits `462bb82`, `a4b8281`. Bug fixed during the work: default quantities not scaled by the current portion ratio. `GET /bootstrap` replaces ~9 boot requests (verified against the local API, then deployed; owner confirmed in prod). Media overrides persisted so `/media/resolve` no longer runs on every reload; `reportFailure` evicts before retry.
- Problems: a "white screen for 8 s" turned out to be DevTools throttling left on.

## 2026-09-21 — Recipe Builder and portions (v6.65.1 → 6.68.2)

- Done: « Télécharger la recette » now exports the SVG recipe card as PNG (replacing the raw-photo download); builder icon back in the rail (v6.66.0); instructions modal (v6.67.0) and multi-line paste (v6.68.1); default portions 2 (v6.68.2); recipe detail scaled by portions + stepper, opened from the planning with its persons (v6.68.0). Lint lesson: no `setState` in effects (reset during render).
- Still open: portion scaling validated by tsc + lint only.

## 2026-09-18 — Planning desserts and batch writes (v6.65.0)

- Done: dessert-only slots; drag & drop prompt for desserts; swap bug found by the owner on the way back and fixed; `DessertCell` click opens the recipe; `PUT /planning-slots/:id/items/batch` negotiated and verified locally against the real API (throwaway account, all cases), discovering that positions are not renormalised. Pending feedback rolled out app-wide (v6.62.0 → 6.65.0); freezer bags could never be saved without a unit — `Unit.NONE` removed from bag forms.

## 2026-09-10 — Refresh token outside the cookie; media batch resolution (v6.62.0)

- Done: refresh token returned in the body and stored in `localStorage` (Safari ITP / hardened Chrome refused the cross-site cookie); single refresh mutex. Front for `POST /media/resolve` (`useMediaStore`, `useMediaSrc`, `AsyncImage asset=…`), inert until the API sent `key`.
- Still open (then): media code had been written on `master`; to rebase on `Dev` before committing.

## 2026-09-09 — Production launch on the API (v6.49.0 → 6.61.0)

- Done: `Dev → master` merged (merge commit `3744723`, v6.61.0); cross inspection front + API green (CORS, rate limits, migrations applied, refresh cookie tested on Chrome/Safari). Same period: dashboard data tab (recipes table, food creation `f2282b7` v6.49.0; outdoor CRUD + desserts filter `d367b9b` v6.50.0; category dot `54480e1`), users merged into the data tab with a universal confirm-with-recap step (v6.51.0), shopping extras (v6.53.0), account screen (v6.54.0), Recipe Builder refactor (v6.56.0), legal pages (v6.58.0), freezer UI redesign (v6.59.0 → 6.60.0), dashboard planning usage. Editable categories attempt reverted (D-014). Two discrepancies raised by the API session checked: no bug.
- Numbers: tag `prod-pre-api` = `c7290d3`.

## 2026-09-08 — Front/API integration commits (v6.41.1 → 6.48.1)

- Done: CRLF noise fixed (`66bade1`); #1 outdoor activities persisted in the planning (`0e46cd1`); #2 Recipe Builder writes to the API, builder admin-only (`6094273`); #7 API error notifications (`05d5612`); #3 Sheets Gateway purge (`bda0a66`); #4 QR sync / export / backup reminder removed, import via `POST /import` (`785d74f`, `e523550`, `d763c75`); #5 journal/shopping localStorage keys removed (`7ee1112`); #9 `.env.production` committed so CI builds have `VITE_API_URL` (`03a3194`); #8 targeted recipe refresh (`d134ec5`); bundled webp photos purged (`e72b6f1`); #11 News based on `announcedAt` (`c84da3f`); #12 `AsyncImage` (`89cede0`); #14 dashboard overview + users + foods (`cbbc7a8`, `29ad536`); category slugs fix, hard-coded ingredient category table (`66c4058`).
- Problems: `announcedAt` deployed before its migration → `GET /recipes` 500 in prod, fixed by running the migration. Bugs fixed during integration: `journal-settings` race; StrictMode double silent refresh triggered "session compromise" (multi-tab not covered).

## 2026-07-21 — API project decided and specified

- Done: Google Sheets Gateway (Cloudflare Worker) abandoned and deleted; decision to build `meals-planning-api` (Express, PostgreSQL + Prisma) in a separate repo; hosting Supabase + Render without credit card; full specification written (data model, auth, roles, shopping state, offline scope reduced to a read cache) and a start prompt for the API session.

## Before 2026-07-21 (migrated)

- 2026-06-03: placement refactor (`core/utils` removed, hooks/utils in `shared/` without exception); feature-by-feature audit of `features/` completed (v6.39.8).
- 2026-02-20: first commits of the project (git history). Until the API, the app was fully local: static JSON catalogue, IndexedDB, QR sync / JSON export between devices.
