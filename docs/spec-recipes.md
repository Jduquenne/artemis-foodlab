# Spec — Recipes, recipe detail, news and Recipe Builder

## Catalogue browsing and search

- Catalogue by category, global search, macro filters (below).
- Scroll restoration (`shared/utils/scrollMemory.ts` module-level Map + `shared/hooks/useScrollRestore(key)` + `resolveRestoredCount` in `core/logic/recipe/recipeListLogic.ts`): on `CategoryDetail` (key `category:<id>`, also restores the infinite-scroll `visibleCount`, `fade-in-up` animation skipped on return) and on `RecipeSearchResults` (key `search:<query>:<filters>`). Not on the category list (owner's choice). Session memory only.
- Known limit: the global search only lists recipes with a meal photo (`mealPhoto`).

## Filters

Model `RecipeFilter { type: RecipeFilterType | null; macros: Partial<Record<kcal|proteins|lipids|carbohydrates|fibers, "below"|"above">> }` (`core/domain/recipeFilter.ts`), persisted in `localStorage` (`cipe_recipe_filter`, via `useMenuStore.recipeFilter`).

- Types (`FILTER_TYPE_DEFINITIONS`): Plats (`DISH` except categories `cereal-products`, `pastries`, `bases`), Petit déjeuner (`DISH` of `cereal-products`), Goûter (`DISH` of `pastries`). Bases/Ingredients types were removed (to reconfirm with the owner if needed).
- Threshold = **median per type** (`macroReferenceLogic.ts`, computed once per catalogue change via `useTypeMedians`), compared with per-portion macros (`RECIPE_MACROS`). « Moins » = `<` median, « Plus » = `>`. No type chosen → no macro filter.
- UI: `RecipeFilterModal` (bottom sheet on mobile, centred modal from `sm:`), `FilterTypeSelector`, `MacroMedianRow`, `ActiveFilterChips`, `RecipeFilterButton`; live result count in the main button. Decision: D-020.

## Recipe detail and portions

`RecipeDetail` shows the SVG "recipe" card (`RecipeRecetteCard`, or `RecipeBookCard` if there is a book photo) with quantities scaled to a number of portions: `scaleRecipeToPortions(recipe, portions)` (`core/logic/recipe/recipeScalingLogic.ts`, linear `portions / defaultPortions`, rounded to 2 decimals, includes `baseId` ingredients — their quantity is a number of base portions, so proportional too). Need: cook a recipe written for ~2 for, say, 7 people without recomputing by hand.

- Portions come from `?portions=N` (`resolveInitialPortions`, falls back to the default if absent/invalid/≤ 0) or from the header `PortionsStepper` (min 1). State is **local**, not persisted, reset to the default when `recipeId` changes (previous/next chevrons build the URL without `portions`).
- Opening from the planning: see `docs/spec-planning.md`. Planning `persons` ≡ portions (`persons / defaultPortions`). Gram overrides (`recipeQuantities`) are not portions → ignored here.
- **Macros are per portion, hence invariant under scaling**: `macros` and `handleEditInBuilder` use the **unscaled** recipe; only the card receives `scaledRecipe`.
- Limits: `RecipeMacroPage` (calculator, separate route `/recipes/detail/:id/macros`, editable per-ingredient quantities, not persisted) is not portion-aware and does not receive `?portions`; coming back from it resets portions to the default. For a recipe with only an instructions photo (no SVG card) the stepper shows but has no visual effect. `RecipeDetail` renders `null` if there is neither meal photo nor instructions photo.

## News (« Nouveautés »)

Based on `announcedAt` (`docs/api.md` § Catalogue reads): `core/logic/news/newsLogic.ts` (`RECENT_RECIPE_DAYS = 30`, `getNewsGroups` → groups by local day, desc; recipes sorted by name; `latestNewsDate`). `useNewsStore` persists `lastSeenDate` only, `hasNew` is transient (`syncHasNew()` after hydration, bootstrap and builder save; `markAsSeen()`), and subscribes to catalogue changes. `NewsModal` navigates by `recipe.code`.

## Recipe Builder (admin only)

Access: `ChefHat` icon in `Layout.tsx` (admin), « Nouvelle recette » button of `RecipeModule`, pencil of `RecipeDetail`. Non-admins: route not mounted → redirected.

- **Header** = 3 buttons: Save (`SaveRecipePanel`), Load (`LoadRecipeModal`), New recipe.
- **Save**: confirmation recap (`summarizeBuilderState`), then `POST/PUT /recipes`, photo upload `POST /recipes/:id/photo`, then `syncRecipeFromApi(uuid)`; delete → 409 if referenced, then `removeRecipeFromCatalogue(code)`. `validateBuilderState` requires at least one ingredient and a book page if `isFromBook`; Save is disabled while errors remain.
- **Ingredient ids are stable**: `recipeToBuilderState` keeps `ing.id` in `DraftIngredient.apiId` (distinct from `DraftIngredient.id`, the local/React key); `builderStateToApiBody` sends it back when present (`docs/api.md` § Catalogue writes).
- **Auto number**: `suggestNextRecipeNumber(categoryId)` = max number of existing codes with that prefix + 1, applied on category change if the recipe does not exist yet, and on « Nouvelle recette ».
- Default portions of a new recipe: **2** (`initialRecipeBuilderState`). A persisted draft (`cipe_recipe_builder`) keeps its value until « Nouvelle recette ».
- **Photos** (`components/photo/PhotoPanel.tsx`): preview, choose/replace (`PhotoField`), book photo if `isFromBook`. The `File`s live in `RecipeBuilderModule` state, passed to `PhotoPanel` and `SaveRecipePanel`.
- **Download** « Télécharger la recette »: generates the SVG recipe card from the **current builder state** (`builderStateToRecetteCardData` / `builderStateToBookCardData` in `shared/utils/cards/cardAdapter.ts`, book variant if `isFromBook` with a book photo), then rasterises it to PNG ×3 (`shared/utils/cards/cardExport.ts`; images converted to `data:` URLs to avoid a tainted canvas). It is **not** the raw dish photo.
- **Instructions**: `RecipeMetaForm` only has a button (first-step preview + « N étapes »); editing happens in `InstructionsModal`: one line = one step, fully controlled by `state.instructions: string[]`, `Enter` = next step, `Shift+Enter` = line break, ↑/↓, ✕, « Ajouter une étape ». A multi-line paste is split into steps (`splitPastedInstructionLines` / `spliceInstructionPaste`, `instructionsLogic.ts`), cut at the cursor; numbers/bullets in the pasted text are not stripped (deliberate).
- **Macro preview** (`MacroPreview`): one compact tile per macro + kcal, toggle Portion / Total ×N, note « N sans données ».
- **Layout**: desktop `lg:` locked bento (left column Photo + metadata, right column thin macro bar + full-height ingredients). Mobile (< `lg`): single page scroll, sticky header, stacked cards; ingredient rows use `IngredientMobileCard` + `IngredientEditDrawer` (bottom sheet).
- A free-text preparation already in the database (outside `PREPARATION_OPTIONS`) shows empty in the `<select>` (known).
