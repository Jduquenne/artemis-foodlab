# AGENTS.md

## Preamble

**Artemis Foodlab** is a meal-planning PWA (weekly menu, nutrition journal per profile, recipes, shopping list, freezer, household items) used in production by a few households. Stack: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Dexie (IndexedDB), React Router (HashRouter), dnd-kit, date-fns, Lucide. Served by GitHub Pages; backed by `meals-planning-api` (separate sibling repo, Express + PostgreSQL + Prisma on Render + Supabase), which is the source of truth.

Non-negotiable constraints: production app, not a POC — scalability and architectural clarity first; login required (no offline mode); UI in French; responsive; no-scroll layout on desktop.

Languages: talk to the owner in **French**; everything written in the repo (docs, code, identifiers, commit messages) is in **English**, except UI text (French) and `README.md` (French, for humans).

Read this file first, then the relevant files in `docs/`.

## Session protocol

1. At the start of a session, read this file, **Current focus** in `docs/roadmap.md` and the latest entries of `log/devlog.md`. When working on the backlog, also read `dev/issues.json` (not loaded automatically).
2. Propose a plan. For any non-trivial task, wait for the owner's validation. For a large job, present the plan split into commits and the decisions that belong to the owner (names, locations).
3. Implement **one step at a time**: one step = one commit. After each step, run the checklist below, give the commit message, then **wait for the owner to commit and say "next"** before continuing. If a change overlaps an uncommitted step, ask the owner to commit first.
4. Verify (checklist), write the devlog entry, propose the commit message.
5. When the owner says **"pause test"**, the session ends: update `docs/` (paths, names, new conventions), `log/devlog.md` (where to resume), `dev/refactoring.md` if a review is in progress; list the user paths to test first and the last commit messages. Do not offer to continue.

## Absolute rules

- **Git is owner-only.** Read commands (`status`, `diff`, `log`, `show`) are allowed; never run commands that modify the repo. When the owner asks for "a commit", reply with **the commit message only** (format in `docs/conventions.md` § Commits), after bumping the version.
- **Never run `npm run build`.** Verify with `npx tsc -b` + `npm run lint`.
- **Never edit `.env` or any `.env*` file**, even "just to test" or fix a formatting detail. To test against a local API, use `curl`. If an env change is needed, ask the owner.
- **Never read, copy or quote `../_private/`** (owner's private folder, outside every repo). Access is denied in `.claude/settings.json`; do not work around it with shell commands.
- **Project knowledge lives in the repo** (`docs/`, `log/devlog.md`), never in Claude Code's auto-memory.
- Architecture decisions are proposed, validated by the owner, then recorded in `docs/decisions.md`. No phase change in `docs/roadmap.md` without the owner's agreement.
- Never invent a dependency version, an API contract or a fact: verify in the code, the real data or the docs, and mark gaps `TODO(owner)`.
- Stay in scope; no unrequested features or rewrites.
- Be honest about status: when the UI could not be checked in a browser, say "validated by tsc + lint only, to test with `npm run dev`". Say plainly when the owner's suggestion or yours is the better one.
- **API collaboration**: a separate Claude Code session owns `meals-planning-api`. Never guess a complex endpoint contract; write a self-contained prompt for the owner to relay, **always introduced explicitly** as "Prompt to paste into the API session:", and wait for real payloads. Details: `docs/api.md` § Working with the API session.
- Never merge (or propose to ship) a change that depends on an API endpoint not yet confirmed deployed in prod.
- `dev/` (owner's project management) is never versioned; read or update it only when relevant or asked, and never copy its content into versioned docs (links only).

## Orientation

| Read | Why |
|---|---|
| `docs/architecture.md` | Layers, placement rules, data flow, catalogue/snapshots, identifiers, IndexedDB, routing, stores, media |
| `docs/conventions.md` | TypeScript/React rules, error handling, loading feedback, reuse, commits, versioning |
| `docs/ui-design.md` | Layout, theming (dark mode), tablet portrait variant, component patterns |
| `docs/development.md` | Install, env vars, commands, deployment, debugging, known issues |
| `docs/api.md` | API contracts the front relies on + how to work with the API session |
| `docs/spec-journal.md` | Journal: overrides per ingredient/day, week average, targets |
| `docs/spec-planning.md` | Planning: desserts invariant, drag & drop, batch writes, pickers |
| `docs/spec-recipes.md` | Catalogue, filters, recipe detail & portions, news, Recipe Builder |
| `docs/spec-shopping.md` | Shopping list model, extras, household items |
| `docs/spec-freezer.md` | Freezer categories, colours, bags, ages |
| `docs/spec-accounts.md` | Session/refresh, account screen, profiles, demo mode, Google sign-in (planned) |
| `docs/spec-admin.md` | Admin dashboard: overview, planning usage, data tables, users |
| `docs/glossary.md` | Domain terms (portions, profiles vs account, codes, "checked = to buy"…) |
| `docs/decisions.md` | Why things are the way they are (ADRs) |
| `docs/roadmap.md` | Current focus, honest status, known bugs, owner actions, ideas |

## Project map

```text
src/
  App.tsx              lazy routes (HashRouter, base /artemis-foodlab/)
  index.css            Tailwind, theme variables, custom variants (dark, tablet)
  core/
    domain/            types, config constants, domain predicates, labels
    utils/             generic pure helpers (numbers, collections, sort, text, codes, dates, weeks)
    logic/<feature>/   pure business logic (auth, dashboard, freezer, journal, media, news,
                       nutrition, planning, profile, recipe, recipeBuilder, shopping, sync, unit)
    catalogue/         in-memory mutable catalogue + change events + code↔uuid map
    services/          apiClient, one service per API resource, Dexie database, catalogue sync
  features/            dashboard, freezer, journal, news, planning, recipeBuilder,
                       recipes, shopping (incl. household tab), sync (import)
  shared/
    components/        layout/ (Layout, sidebar, settings, demo banner), ui/ (reusable)
    hooks/             all hooks (snapshots, pending, auth init, refresh, search…)
    store/             Zustand stores
    utils/             browser/React-bound utilities, cards/ (SVG card rendering & export)
    contexts/          ThemeContext
public/                assets (logo, ui: category images, fonts, icons), manifest, version.json
docs/                  project documentation (archive/ = pre-migration context)
log/devlog.md          session journal
dev/                   owner's local project management (gitignored)
.github/workflows/     deploy.yml (lint + build + GitHub Pages on push to master)
```

## Golden rules

Detail and rationale in `docs/conventions.md`, `docs/architecture.md` and `docs/ui-design.md`. Greppable ones are checked by the commands in `docs/development.md` § Golden-rule checks.

1. No `any`, no `as unknown as`, no `eslint-disable`, no suppressed `exhaustive-deps`.
2. Zero comments in code (except `src/vite-env.d.ts`).
3. Business logic = named pure functions in `core/logic/<feature>/`; `core/logic` never imports `core/services`; logic > ~5 lines leaves the component.
4. Hooks in `shared/hooks/`; generic pure utils in `core/utils/`, browser/React utils in `shared/utils/` (`core/` never imports `shared/`); one component per file; props named `<ComponentName>Props`; routes via `React.lazy`.
5. Never read `core/catalogue/` from a component or `useMemo` — use the snapshot hooks; logic receives the catalogue as a parameter.
6. Never modify an existing Dexie `.version(n)`; schema change = new version.
7. No synchronous `setState` in `useEffect` (reset during render instead).
8. Writes: API first, cache after success; no optimistic update.
9. Click-triggered mutation → `withPending` (one key per business action); never on a free-text `onChange`.
10. Numeric inputs → `DecimalInput` / `parseDecimal`, never `type="number"` + `Number()`.
11. `slate-*` / `white` via CSS variables: never `dark:text-slate-*` / `dark:bg-slate-*`; overlays `bg-black/X`.
12. No runtime-built Tailwind classes (literals or inline hex); animate with `transform`, never `width`/`height`.
13. Never hard-code `/artemis-foodlab/`; use `shared/utils/assetUrl.ts`.
14. Desserts never depend on the main dish (`recipeIds`).
15. Any action forbidden in demo on the API side is hidden via `useIsDemo`.
16. New screen layouts handle `tablet:` (portrait tablet) and use `dvh`, not `vh`.
17. Before removing/renaming an export, grep all of `src/` for consumers.
18. Reuse the shared utilities listed in `docs/conventions.md`; create a helper only for a pattern repeated ~5+ times.
19. When an action changes persistent state, test the round trip, not only the single move.

## Picking work

1. `docs/roadmap.md` § Current focus.
2. "Still open" items of the latest `log/devlog.md` entries.
3. `dev/issues.json` (open issues) and `dev/refactoring.md` (review findings), with the owner's go.

Issue commands (on `dev/issues.json`, schema in its `_schema`): « nouvelle issue » → add an entry (`status: open`, `createdAt` = today, next numeric id); « analyse nos issues » → summary by status + prioritisation advice; « clore issue <id> » → `status: closed` + `closedAt`, and complete the `description` with what was done.

## Before you finish a task

1. `npx tsc -b` — must pass.
2. `npm run lint` — must pass.
3. Golden-rule greps (`docs/development.md` § Golden-rule checks) — no new occurrence introduced by the task (known pre-existing hits are listed there).
4. Bump `version` in `package.json` **and** `public/version.json` (patch: fix/refactor/chore/docs; minor: feature).
5. Update the docs touched by the change (`docs/…`) and add an entry to `log/devlog.md`.
6. Update `docs/roadmap.md` if the status of an item changed.
7. Report honestly what was verified (and what was not, e.g. no browser check), then give the commit message only.

## Where things are tracked

- `docs/roadmap.md` — focus, status, known bugs, owner actions, ideas.
- `docs/decisions.md` — architecture decisions (D-xxx).
- `log/devlog.md` — session history and "still open".
- `dev/issues.json`, `dev/refactoring.md` — owner's backlog and review log (local, not versioned).
- `docs/archive/` — pre-migration `CLAUDE.md` and the migration traceability table (read-only history).
