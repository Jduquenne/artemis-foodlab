# Spec — Shopping and household

The Shopping view (`/shopping`) has three modes (`viewMode: 'meals' | 'ingredients' | 'household'`); `/household` redirects to the household tab.

## Shopping list model

- The list is **never stored**: it is recomputed on the client from the shopping days + the cached planning (`getShoppingListForDays`, `core/logic/shopping/` — aggregation, checks, recipe cards, grouping, clipboard, price).
- Grouping key `${name}-${unit}`, translated to `foodId` only when writing. The same food can appear under several keys (two units, or both in a recipe and in its base): an API item check or source check (keyed by `foodId`, no unit) applies to **every** key of that food, and source-check writes are deduplicated by API key (`collectSourceCheckRequests`).
- Check state: `useShoppingPeriodChecks(periodId, ingredients, householdItems)` loads item checks, source checks and extras per period (data from a previous period is never shown), derives `checked` / `stocks` / `freezerSelection` / `sourceChecked` with the pure `buildShoppingCheckState` (`core/logic/shopping/shoppingCheckState.ts`) and exposes the mutations; `ShoppingModule` only renders.
- Stored in the API under a `ShoppingPeriod` (`useMenuStore.shoppingDays` + `currentPeriodId`): shopping days, item checks (check + stock + freezer bags in one resource), source checks (per recipe × day × slot), extras. Contracts: `docs/api.md` § Shopping and household.
- Changing the shopping days deletes and recreates the period (checks, stocks and extras disappear with it) — kept on purpose.
- Freezer bag units must not include `Unit.NONE` (the API requires a unit).
- Pending feedback on every check (see `docs/conventions.md` § Loading feedback).

## Manual items (« extras »)

Need: add a manual line (e.g. a specific cheese wanted on top of a recipe) that follows from one phone to another — hence stored in the API, on the shopping period.

- Entry point: « Article » button in the toolbar of the Shopping view (ingredients list), only when a period exists → `features/shopping/components/AddExtraModal.tsx`.
- Fields: name (required) + quantity + unit (optional, `Unit`) + aisle category (`IngredientCategory`, « Autre » if empty) + optional link to a catalogue food (`foodId`, auto-fills category/unit) + optional link to a recipe planned this period (sent as uuid via `getIdByCode`). Edit mode when `extra != null`.
- Display: extras become ingredient-like lines (`extrasToIngredients`, key `extra::<id>`, category via slug → enum, no sources), merged into grouping, filtering, unchecked count and clipboard, **not** into recipe cards nor `keyToFoodId`. Rendered with an « ajouté » badge, no stock nor sources, edit and delete buttons; at the end of their aisle (`createdAt` order). Delete = trash click, no confirmation.
- Checking an extra uses its own `isChecked` (`PUT` extra), not an item check.
- Not shown in the "meals" view (v1). Only ingredient categories (no household category).
- A link (`foodId` / `categoryId` / `recipeId`) can come back `null` (`SetNull` on delete); an extra without category goes to « Autre ».

## Household items

- Checked = **"to buy"** (`household-shopping-flags`), `householdService` (`getRecords` / `toggleItem` / `clearAll`). Shown in the household tab of Shopping (`features/shopping/components/household/HouseholdPanel.tsx`, category order `HOUSEHOLD_CATEGORY_ORDER` in `core/domain/household.ts`) and as « Articles du quotidien » in the ingredients list.
- Household categories from the API are not wired in the front.
