# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
node generate-manifest.cjs # Update assets-manifest.json (Run after adding images)
```

There are no tests in this project.

The app deploys to GitHub Pages at `/artemis-foodlab/` (configured in `vite.config.ts`).

## Product context

**Artemis Foodlab** is a fully offline meal planning PWA. No external APIs — all data lives in the browser (IndexedDB via Dexie + localStorage). This is a production app intended for continuous use and evolution — not a POC. Architecture decisions must always favour scalability, maintainability, and clarity. If something looks like a bad practice, flag it.

## UI constraints

- **Fully responsive**: the app is used on PC, tablet, and smartphone. Every view must adapt correctly at all breakpoints. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) as the primary tool.
- **No-scroll layout**: the content inside the main `<Layout>` children must fit the viewport without scrolling. Keep content compact. Dense views use `h-[calc(100vh-Xpx)]`, `min-h-0`, `overflow-hidden` and similar constraints to avoid overflow.
- **Styling**: Tailwind utility classes are the default. Custom CSS (in `src/styles/` or inline `style={}`) is allowed and encouraged when Tailwind cannot express the desired result cleanly.
- **Language**: UI is in French.
- **No comments** in generated code.

## Architecture

### Layer structure

```
src/
├── core/           # Business logic, domain models, DB, utilities
├── features/       # Feature modules (recipes, planning, shopping)
└── shared/         # Shared components, hooks, store, utils
```

### Data flow

1. `core/domain/types.ts` — domain types (`Recipe`, `Ingredient`, `Unit` enum, `IngredientCategory` enum, etc.)
2. `core/domain/categories.ts` — static category config (used for routing and display)
3. `core/services/db.ts` — Dexie schema with two stores: `recipes` (RecipeEntry) and `planning` (MealSlot).
4. `core/services/seeder.ts` — seeds IndexedDB from JSON recipe files on first load
5. `shared/store/useMenuStore.ts` — Zustand store tracking `currentWeek`/`currentYear`/`currentWeekId` (persisted in localStorage), plus `initWeek()` which detects week transitions

### Routing (App.tsx)

```
/recipes                        → RecipeModule (category grid)
/recipes/category/:categoryId   → CategoryDetail
/recipes/detail/:recipeId       → RecipeDetail
/planning                       → PlanningModule (drag-and-drop weekly grid)
/shopping                       → ShoppingModule (aggregated shopping list)
```

Root `/` redirects to `/recipes`. Uses `HashRouter` for GitHub Pages compatibility.

### Key implementation notes

- **Week utilities**: `core/utils/dateUtils.ts` — ISO week ID generation (`getWeekId`, `getDaysOfWeek`) used by the store. `shared/utils/weekUtils.ts` — week navigation helpers for the planning UI (`getWeekNumber`, `getMonday`, `getWeekRange`).
- **Drag & Drop**: `@dnd-kit/core` used in `PlanningModule`. Each `MealSlot` is both a droppable target and a draggable source via a grip handle. Swap/move logic lives in `PlanningModule.handleDragEnd`.
- **Shopping logic**: `core/utils/shoppingLogic.ts` aggregates ingredients across planned meals, respecting units.
- **Asset manifest**: `generate-manifest.cjs` generates `core/domain/assets-manifest.json` listing recipe images under `public/`. Run if adding new images.

### IndexedDB migrations (critical)

Any change to the Dexie schema (adding/removing stores, indexes, or fields used in queries) **requires a new schema version**. Never modify an existing `.version(n)` block — always add a new `.version(n+1)` with an `.upgrade()` migration to preserve existing user data. The current schema is at **version 4** (`core/services/db.ts`).
