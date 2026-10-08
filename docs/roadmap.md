# Roadmap

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⏸ waiting for a decision.
The detailed backlog and future features live in `dev/issues.json` and `dev/refactoring.md` (local, not versioned — D-023).

## Current focus

1. 🟡 Code review refactoring: `core/services/` and all of `features/` done (Shopping, Freezer, Journal, Planning, Dashboard, Recipe Builder, Recipes, News, Sync); next is `shared/` (open points in `dev/refactoring.md`).
2. ⬜ Fix the ISO week-year bug (see Known bugs).
3. 🟡 Tablet portrait pass on the remaining screens.

## Honest status (2026-10-07)

- Production at v6.78.0 on GitHub Pages, backed by the API since 2026-09-09. `master` holds v6.79.6 (session of 2026-10-07: services, shopping, freezer, journal reviews; deployed with each push on `master`).
- Working in prod (confirmed by the owner): bootstrap boot, media batch resolution, journal per-ingredient overrides, profiles (v6.73.0), planning desserts + batch writes, shopping extras, account screen, admin dashboard.
- Delivered, owner validation pending: demo mode (v6.78.0, the API must be in prod before the front); front fix for unexpected logouts (needs confirmation in prod); everything from v6.78.2 to v6.79.5 (validated by tsc + lint only — test list in `log/devlog.md`, entry « Session end »).
- `npx tsc -b` and `npm run lint` pass. No automated tests exist.
- UI changes are validated by type check + lint only unless the owner tested them in a browser.

## Phases

Milestones reconstructed from history; definitions of done marked "proposed" were written during the migration.

| Phase | Status | Definition of done |
|---|---|---|
| P1 — Local PWA (static JSON catalogue, IndexedDB, QR sync) | ✅ (before 2026-07) | superseded by P2 |
| P2 — API integration (catalogue, user data, auth, import) | ✅ 2026-09-09 | `master` serves the API bundle; cross inspection front + API green |
| P3 — Post-launch features (pending feedback, desserts, journal overrides, profiles, filters, demo) | ✅ 2026-10-05 | each feature documented in `docs/spec-*.md` and in prod |
| P4 — Code review refactoring | 🟡 | proposed: every folder of `src/` reviewed with the owner; open points of `dev/refactoring.md` closed or explicitly deferred; tsc + lint green |
| P5 — Tablet portrait pass | 🟡 | proposed: every screen validated by the owner at 820×1180 portrait |

### P4 — Code review refactoring

- ✅ `docs`, `public/`, `scripts/`, repo root, `core/domain`, `core/catalogue` (ex `typed-db`), catalogue change signal + snapshots + cross-device refresh, `core/logic`, shared utilities, macro labels centralised.
- ✅ `core/services/` (2026-10-07; atomic freezer item + shopping period API calls).
- ✅ `features/` (2026-10-08): shopping (incl. household tab, batch source checks), freezer, journal, planning, dashboard, recipeBuilder, recipes, news, sync.
- ✅ `shared/` (2026-10-08): utils (D-032 split), hooks, stores, components (SVG card escaping fix).
- ✅ Layering (2026-10-08, D-032): generic utilities in `core/utils/`, business ones in `core/logic/`, caches in `core/catalogue/recipeMetrics.ts`; `core/` no longer imports `shared/`.
- ✅ Theming (2026-10-08): every pre-existing `dark:*-slate-*` pair replaced by the named theme colours (D-031); 0 occurrence left in `src/`.

### P5 — Tablet portrait

- ✅ Layout, Journal, Planning.
- ⬜ Courses, Recettes, Congélateur, Recipe Builder, Dashboard.

## Known bugs

- ⬜ **ISO week-year**: `PlanningModule.tsx` and `JournalModule.tsx` use `year = monday.getFullYear()` instead of the ISO week-year, so some weeks collide (e.g. 2024-W01 and the week of 2024-12-30 both map to (2024, 1)). Fixing it requires handling data already stored.
- ⏸ **Unexpected logouts in prod**: front fix shipped (token kept on transient refresh failures, retries); a 401 « Session expirée » with a valid-looking refresh token remained unexplained on 2026-09-30. Diagnosis procedure in `docs/development.md` § Debugging. A local trace of refresh failures was proposed, not accepted.

## Open items (owner actions)

- Legal pages (`LegalModal`) contain « À compléter par l'éditeur » placeholders.
- Run the API backfill for food renames on existing recipes (dry run, then apply); open question: labels intentionally different from the food name are overwritten by the cascade.
- `git rm --cached .claude/settings.local.json` (tracked although ignored).
- Font licences in `ATTRIBUTION.md`.
- Technical debt and review findings: `dev/refactoring.md`.

## Blocked

- ⏸ Google sign-in (#10): waiting for the API endpoint and the owner's Google Cloud setup (`docs/api.md` § Planned).
- ⏸ Outdoor activity photo (mandatory, client + server, dashboard activity modal — owner's decision 2026-10-08): front done in v6.82.0, **push only after the owner confirms the API is live** (breaking change on `POST /outdoor-activities`, `docs/api.md` § Planned).

## Ideas / later

Future features (including profile food preferences, #20-#24) are tracked in `dev/issues.json`. Technical ideas noted along the way:

- ETag / 304 revalidation of the catalogue.
- API: generate food ids / outdoor codes server-side; allow forcing `announcedAt` (re-announce toggle); media `Cache-Control: immutable` + thumbhash.
- Real-time sync (SSE / WebSocket) instead of polling.
- Light category rename (D-014 alternative).
- Remove the data import (owner, 2026-10-08: obsolete since the API is the source of truth): front `features/sync` (`ImportModal`, `ScopeSelector`), `importService`, `core/logic/sync/importPayloadLogic.ts` + `importSummaryLogic.ts`, the entry in `SettingsPopover`; API side `POST /import` (prompt to relay to the API session). Not scheduled; would also settle the open question of activities created by the import without a photo.
