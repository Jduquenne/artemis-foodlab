# Spec — Planning (Menu)

Weekly grid of meal slots: breakfast, lunch, snack, dinner. Lunch and dinner accept desserts (`hasDessert: true` in `MEAL_SLOTS`). Recipes and outdoor activities can be planned. Drag & drop (dnd-kit), copy, persons/grams per meal. Model: `docs/architecture.md` § Domain model; API: `docs/api.md` § Planning.

## Desserts are independent from the main dish

`MealSlot.dessertIds` has **no dependency** on `recipeIds`: a lunch/dinner slot can have desserts without a main dish (`recipeIds: []`). Any UI or logic touching slots must respect this invariant — never gate the display or addition of a dessert on the presence of a recipe. (Pitfall already met: `showDessertColumn` in `SingleMealSlot.tsx` was gated on `hasPhoto`; fixed.)

- `PlanningModule.handleAddDessert` and the dessert branch of `confirmCopy` build a slot on the fly (`recipeIds: []`) when none exists. `computeSlotCopyProps` allows an empty slot as a dessert copy target.
- The API model supported this already (`plannable_items`); it was a front-only rendering limit.
- Clicking a `DessertCell` opens the recipe detail, like the main dish in `SingleMealSlot`.

## Adding or replacing a dish

Pure functions in `core/logic/planning/planningSlotEditLogic.ts`, used by the recipe picker and the « ajouter au planning » mode (`addRecipe` URL parameter):

- `buildEmptySlot` builds a slot that does not exist yet.
- Single slot (lunch, dinner): `replaceMainRecipe` swaps the dish and keeps the desserts, their persons/grams and the slot persons; only the settings of the replaced dish are dropped.
- Multi slot (breakfast, snack): `addRecipeToMultiSlot` appends the recipe and keeps everything else; no-op when the slot is full or already holds it.
- « Ajouter au planning » with a dessert on a lunch/dinner slot always adds it as a dessert, even when the slot has no dish.
- Copy: targets are `copyTargetKey(day, slot)` keys; `buildCopiedSlot` (`planningCopyLogic.ts`) adds the copied recipe or dessert to each target, carrying the source persons; no-op when the target is full or already holds it.

## Drag & drop with desserts

Moving a meal that has desserts → the user chooses whether they follow (`MoveDessertsPrompt`: « Déplacer aussi / Laisser sur place / Annuler », shown only if the moved meal has desserts). Pure computation `computeDragMoveSlots` (`core/logic/planning/planningDragLogic.ts`), three cases:

1. Destination does not exist → the recipe (+ desserts if `moveDesserts`) is dropped there; origin deleted or emptied.
2. **Destination exists without a recipe** (dessert-only or empty) → the recipe lands there; **desserts already at the destination never move**; those of the moved meal are added if `moveDesserts` (deduplicated merge). If the merge would exceed `MAX_DESSERTS_PER_SLOT` (3), « Déplacer aussi » opens `DessertChoiceModal` (`incomingDessertChoice` returns the merged list): the user checks 1 to 3 desserts to keep at the destination, the unchecked ones are deleted (owner's decision, 2026-10-08), passed to `computeDragMoveSlots` as `keptDessertIds`.
3. Destination has a **real recipe** → full swap (recipe + desserts on both sides if `moveDesserts`).

A dessert-only destination must never give its own dessert to the origin slot (pitfall already met: `if (toMeal)` without checking `toMeal.recipeIds.length > 0`; a dessert unrelated to the moved meal left with it on the way back).

## Writes

Each slot save diffs items (`diffSlotItems`) and sends **one** batch call `PUT /planning-slots/:id/items/batch`; the local cache is rebuilt from the full response. A move A→B is two batch calls (not atomic). Decision: D-009.

## Meal actions menu

Every planned item keeps its **information badges** visible (persons / grams, freezer) and groups its **actions** in one « ⋯ » button (`ItemActionsMenu`, built on `FloatingMenu`; revealed on hover on desktop, always shown on touch; spinner while a removal is pending). The menu wrapper stops click and pointer propagation, so opening it never starts a drag nor opens the recipe. Owner's decision 2026-10-15 (room for the food choice of D-033).

- Lunch / dinner dish (`SlotActions`, bottom right): « Changer le repas », « Ingrédients au choix » (when relevant), « Personnes », « Supprimer ». The drag handle stays top left; the persons badge stays a shortcut.
- Breakfast / snack with one recipe (`MultiSlotActions`, bottom right): « Quantité » (meta editor, or slot persons), « Copier », « Ajouter un repas », « Retirer ».
- Breakfast / snack grid cell (`RecipeCell`, top right, compact, revealed on cell hover): « Quantité », « Copier », « Retirer ».
- Dessert (`DessertCell`, top right, compact): « Personnes », « Copier », « Retirer ».
- Hidden in add mode, copy mode and while editing persons (same conditions as the former buttons).

## Ingredients « au choix » (food choices per profile)

D-033. A recipe whose ingredients carry a `foodGroupId` (Recipe Builder « au choix ») lets each profile choose its food for **that planned meal**.

- Model: `MealSlot.foodChoices: Record<recipeCode, FoodChoice[]>` (`{ recipeIngredientId, profileId, foodId, quantity }`), read from each planning item. `quantity` = quantity **per portion** for that profile, in the ingredient's unit, `null` = recipe quantity per portion (`recipeQuantityPerPortion`); it only exists on a meal choice (`ResolvedFood.quantityPerPortion`). Resolution for a profile (`resolveIngredientFood`, `core/logic/foodGroup/foodChoiceLogic.ts`): meal choice → profile default (`Profile.foodGroupDefaults`) → recipe default (`Ingredient.foodId`).
- UI: `FoodChoiceModal` (one select per ingredient au choix × profile; the empty option shows the fallback food and where it comes from: « préférence du profil » / « défaut de la recette »; next to it a `DecimalInput` « unit / pers. », enabled only once a food is chosen, placeholder = recipe quantity per portion, 0 or empty = `null`; changing the food keeps the quantity). Opened from « Ingrédients au choix » in the « ⋯ » menu of any planned item having such ingredients (dish, breakfast/snack recipe or cell, dessert), and from the `FoodChoiceBadge` (bottom left of a dish: amber « à préciser » while at least one profile falls back to the recipe default, orange icon only when every profile has a meal choice or a profile default). Save = one `withPending` key `planning-food-choice:<slotId>:<code>`, closes on success.
- Writes: the existing slot diff carries choices (`diffSlotItems`): `add[].foodChoices` for a new item (only when non-empty), `update[].foodChoices` (full replacement) only when the item's choices changed — absent means untouched (`docs/api.md`). The local cache is rebuilt from the batch response as before.
- Follow the meal: copy (`CopyState.sourceFoodChoices`, `buildCopiedSlot`) and drag & drop (`placeMeal` picks the choices of the moved codes, `pickFoodChoices`) carry them; replacing the dish (`replaceMainRecipe`) drops the old dish's choices and keeps the desserts'. Note: persons / grams overrides still do **not** follow a drag (unchanged behaviour), choices do (owner's decision).

## Recipe / dessert pickers

`RecipePicker` / `DessertPicker` (modals adding a dish/dessert to a slot):

- One click on a row saves directly (no confirmation step); the clicked row shows a spinner and the others are disabled until the save ends; the picker closes only on success.
- Results capped at `MAX_PICKER_RESULTS = 30` (`useSearchMeals` / `useSearchDesserts`, `searchOutdoorRecipes` with the same `limit`). `useSearchRecipes` (Recipes module) and `useSearchIngredients` remain unlimited on purpose.
- The search input stays instant; a `useDeferredValue(query)` feeds the search hooks so React prioritises typing.
- Known limit: filtering/sorting still scans the whole catalogue on each keystroke (no debounce) — acceptable for a few hundred entries; add a debounce if it becomes a hotspot.
- Reason: uncapped results (one `<button>` + `<AsyncImage>` each) crashed tablets/phones.

## Opening a recipe from the planning

Always `navigate(buildRecipeDetailUrl(recipeId, portions))`: single slot = `savedMeal.persons`; multi = `recipePersons?.[rid] ?? persons`; dessert = effective `persons` of `DessertColumn` (`recipePersons?.[rid] ?? slotPersons ?? 1`). See `docs/spec-recipes.md` § Portions.

## Weeks

The URL holds the selected day (`day`, « Lundi »…) and a date of the displayed week (`d`, local `yyyy-MM-dd` via `toIsoDate`); without `day`, today is computed at render time (`dayNameOf(new Date())`).

A week is stored as (ISO week-year, ISO week): `getWeekYear(monday)` + `getWeekNumber(monday)` (`core/utils/weekUtils.ts`), never `monday.getFullYear()` (the calendar year of the Monday is wrong when it falls on Dec 29-31; fixed 2026-10-08).
