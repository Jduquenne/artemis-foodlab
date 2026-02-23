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

## Architecture

**Artemis Foodlab** is a fully offline meal planning PWA. No external APIs — all data lives in the browser (IndexedDB via Dexie + localStorage).

### Layer structure

```
src/
├── core/           # Business logic, domain models, DB, utilities
├── features/       # Feature modules (recipes, planning, shopping)
└── shared/         # Shared components, hooks, store, utils
```

### Data flow

1. `core/domain/types.ts` — all domain types (`Recipe`, `Ingredient`, `WeeklyMenu`, `Unit` enum, `IngredientCategory` enum, etc.)
2. `core/domain/categories.ts` — static category config (used for routing and display)
3. `core/services/db.ts` — Dexie schema with two stores: `recipes` (RecipeEntry) and `planning` (MealSlot). Has V3→V4 migration for ISO week format.
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

Root `/` redirects to `/recipes`.

### Key implementation notes

- **Week IDs**: ISO week format (e.g. `"2024-W03"`). `core/utils/dateUtils.ts` handles week ID generation; `shared/utils/dateUtils.ts` handles display formatting — these are separate files with different responsibilities.
- **Drag & Drop**: `@dnd-kit` (core + sortable) used in `PlanningModule`. `DraggableRecipe` is the drag source; `MealSlot` is the drop target.
- **Shopping logic**: `core/utils/shoppingLogic.ts` aggregates ingredients across planned meals, respecting units.
- **Asset manifest**: `generate-manifest.cjs` generates `core/domain/assets-manifest.json` listing recipe images under `public/`. Run if adding new images.
- **Language**: UI is in French.
- **No comment**: I don't want comment in generate code.
