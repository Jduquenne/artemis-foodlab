# Spec — Planning (Menu)

Weekly grid of meal slots: breakfast, lunch, snack, dinner. Lunch and dinner accept desserts (`hasDessert: true` in `MEAL_SLOTS`). Recipes and outdoor activities can be planned. Drag & drop (dnd-kit), copy, persons/grams per meal. Model: `docs/architecture.md` § Domain model; API: `docs/api.md` § Planning.

## Desserts are independent from the main dish

`MealSlot.dessertIds` has **no dependency** on `recipeIds`: a lunch/dinner slot can have desserts without a main dish (`recipeIds: []`). Any UI or logic touching slots must respect this invariant — never gate the display or addition of a dessert on the presence of a recipe. (Pitfall already met: `showDessertColumn` in `MealSlot.tsx` was gated on `hasPhoto`; fixed.)

- `PlanningModule.handleAddDessert` and the dessert branch of `confirmCopy` build a slot on the fly (`recipeIds: []`) when none exists. `computeSlotCopyProps` allows an empty slot as a dessert copy target.
- The API model supported this already (`plannable_items`); it was a front-only rendering limit.
- Clicking a `DessertCell` opens the recipe detail, like the main dish in `MealSlot`.

## Adding or replacing a dish

Pure functions in `core/logic/planning/planningSlotEditLogic.ts`, used by the recipe picker and the « ajouter au planning » mode (`addRecipe` URL parameter):

- `buildEmptySlot` builds a slot that does not exist yet.
- Single slot (lunch, dinner): `replaceMainRecipe` swaps the dish and keeps the desserts, their persons/grams and the slot persons; only the settings of the replaced dish are dropped.
- Multi slot (breakfast, snack): `addRecipeToMultiSlot` appends the recipe and keeps everything else; no-op when the slot is full or already holds it.
- « Ajouter au planning » with a dessert on a lunch/dinner slot always adds it as a dessert, even when the slot has no dish.

## Drag & drop with desserts

Moving a meal that has desserts → the user chooses whether they follow (`MoveDessertsPrompt`: « Déplacer aussi / Laisser sur place / Annuler », shown only if the moved meal has desserts). Pure computation `computeDragMoveSlots` (`core/logic/planning/planningDragLogic.ts`), three cases:

1. Destination does not exist → the recipe (+ desserts if `moveDesserts`) is dropped there; origin deleted or emptied.
2. **Destination exists without a recipe** (dessert-only or empty) → the recipe lands there; **desserts already at the destination never move**; those of the moved meal are added if `moveDesserts` (deduplicated merge, capped at 3).
3. Destination has a **real recipe** → full swap (recipe + desserts on both sides if `moveDesserts`).

A dessert-only destination must never give its own dessert to the origin slot (pitfall already met: `if (toMeal)` without checking `toMeal.recipeIds.length > 0`; a dessert unrelated to the moved meal left with it on the way back).

## Writes

Each slot save diffs items (`diffSlotItems`) and sends **one** batch call `PUT /planning-slots/:id/items/batch`; the local cache is rebuilt from the full response. A move A→B is two batch calls (not atomic). Decision: D-009.

## Recipe / dessert pickers

`RecipePicker` / `DessertPicker` (modals adding a dish/dessert to a slot):

- Results capped at `MAX_PICKER_RESULTS = 30` (`useSearchMeals` / `useSearchDesserts`, `searchOutdoorRecipes` with the same `limit`). `useSearchRecipes` (Recipes module) and `useSearchIngredients` remain unlimited on purpose.
- The search input stays instant; a `useDeferredValue(query)` feeds the search hooks so React prioritises typing.
- Known limit: filtering/sorting still scans the whole catalogue on each keystroke (no debounce) — acceptable for a few hundred entries; add a debounce if it becomes a hotspot.
- Reason: uncapped results (one `<button>` + `<AsyncImage>` each) crashed tablets/phones.

## Opening a recipe from the planning

Always `navigate(buildRecipeDetailUrl(recipeId, portions))`: single slot = `savedMeal.persons`; multi = `recipePersons?.[rid] ?? persons`; dessert = effective `persons` of `DessertColumn` (`recipePersons?.[rid] ?? slotPersons ?? 1`). See `docs/spec-recipes.md` § Portions.

## Weeks

Planning and Journal compute `year = monday.getFullYear()` instead of the ISO week-year — known bug, see `docs/roadmap.md` § Known bugs.
