# Spec — Shopping and household

The Shopping view (`/shopping`) has three modes (`viewMode: 'meals' | 'ingredients' | 'household'`); `/household` redirects to the household tab.

## Shopping list model

- The list is **never stored**: it is recomputed on the client from the shopping days + the cached planning (`getShoppingListForDays`, `core/logic/shopping/` — aggregation, checks, recipe cards, grouping, clipboard, price).
- **Aisles and their order** (owner, 2026-10-15/16; API D-053, D-054): the list is grouped by **aisles** (`ShoppingAisle`: a shared ingredient category, or a custom per-account category « rayon », `useCustomShoppingCategoryStore` filled from `/bootstrap`). Order = `AuthUser.shoppingCategoryOrder` (shared slugs and custom ids) resolved by `resolveShoppingAisles` (`core/logic/shopping/shoppingCategoryOrderLogic.ts`): unknown or duplicate ids ignored, shared categories missing from the saved list inserted right after their nearest preceding category of `DEFAULT_SHOPPING_CATEGORY_ORDER`, custom ones missing appended at the end in creation order (`null` = default: shared default order then custom ones). An extra with `customShoppingCategoryId` goes to its custom aisle (`ConsolidatedIngredient.customCategoryId`), never to a shared one; groups are keyed by aisle id (`IngredientGroup.key`). « Autres » and « Articles du quotidien » stay apart, at the end (owner). Edited in `CategoryOrderModal` (`features/shopping/components/order/`, opened by the `ListOrdered` button of the toolbar, ingredients view only): `@dnd-kit/sortable` list (`SortableCategoryRow`, drag by the grip handle, `touch-none`; pointer, touch with a 150 ms delay, keyboard) plus ↑ ↓ buttons (`moveShoppingAisle`), custom aisles (« perso » badge) are managed in the same window, each action saved immediately through the API (`useCustomShoppingCategoryStore`: `createCategory` / `renameCategory` / `deleteCategory`, API first): `AddAisleForm` (label ≤ 50, Enter or ＋, disabled at `MAX_CUSTOM_SHOPPING_CATEGORIES` = 30, the new aisle is appended to the draft order), rename by tapping the label (`useInlineRename`, key `shopping-aisle-rename:<id>`), delete through `ConfirmActionModal` (key `shopping-aisle-delete:<id>`; its extras go to « Autres » and the API drops it from the stored order); the draft order is kept as ids and rendered from the current aisles, so a rename shows at once. « Ordre par défaut », « Enregistrer » = `PUT /me` via `withPending` key `shopping-category-order` (`null` when equal to the default, `shoppingAisleOrderPayload`), then `setUser` with the response; closes on success only. Allowed in demo. On 2-3 columns (tablet, desktop) groups are spread to balance column heights, so the path order reads top to bottom only in the single-column phone layout.
- Grouping key `${name}-${unit}`, translated to `foodId` only when writing. The same food can appear under several keys (two units, or both in a recipe and in its base): an API item check or source check (keyed by `foodId`, no unit) applies to **every** key of that food, and source-check writes are deduplicated by API key (`collectSourceCheckRequests`), then sent in **one** `PUT …/source-checks` call (a recipe card or base group, all or nothing).
- Check state: `useShoppingPeriodChecks(periodId, ingredients, householdItems)` loads item checks, source checks and extras per period (data from a previous period is never shown), derives `checked` / `stocks` / `freezerSelection` / `sourceChecked` with the pure `buildShoppingCheckState` (`core/logic/shopping/shoppingCheckState.ts`) and exposes the mutations; `ShoppingModule` only renders.
- Stored in the API under a `ShoppingPeriod` (`useMenuStore.shoppingDays` + `currentPeriodId`): shopping days, item checks (check + stock + freezer bags in one resource), source checks (per recipe × day × slot), extras. Contracts: `docs/api.md` § Shopping and household.
- Changing the shopping days deletes and recreates the period (checks, stocks and extras disappear with it) — kept on purpose.
- Freezer bag units must not include `Unit.NONE` (the API requires a unit).
- Pending feedback on every check (see `docs/conventions.md` § Loading feedback).

## Ingredients « au choix » (D-033)

`aggregateSlots` splits an ingredient carrying a `foodGroupId` with `splitGroupIngredient` (`core/logic/foodGroup/foodChoiceLogic.ts`): the planned parts are shared equally between the account's profiles (`ShoppingCatalogue.profiles`, no notion of who eats yet, #23); each profile's share uses its resolved food (meal choice → profile default → recipe default) and its quantity per portion (meal choice `quantity`, else the recipe's). Shares of the same food are merged. Example: recipe 30 g / portion, 4 parts, Léa mozzarella 60 g, Tom comté → mozzarella 120 g, comté 60 g.

- A share of another food becomes an ingredient named after that food (`ShoppingCatalogue.foods`) with its `foodId`, so it groups with the same food from other recipes and is checked like any food; the recipe default keeps the ingredient's own name.
- A share resolved by the recipe default sets `ConsolidatedIngredient.toSpecify`: « à préciser » badge in the ingredients list (`IngredientCheckRow`) and « (à préciser) » in the clipboard text.
- Sources of a split share carry `profileNames` (shown in the sources sheet instead of « ×persons · base »).

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
