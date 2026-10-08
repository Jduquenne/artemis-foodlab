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

## 2026-10-08 — `features/` review: recipes, step 2 (v6.82.2)

- Done: filter type counting moved out of `RecipeFilterModal` to `countFilterTypes` + `candidateRecipeId` (`core/logic/recipe/recipeFilterTypeLogic.ts`, also used by `filterRecipesByFilter`). Linked base thumbnails of `RecipeDetail` (desktop + mobile copies) → `LinkedBaseLink`, link built with `buildRecipeDetailUrl`. `MacroColumn` + `MacroRow` (identical but size) → `MacroCircles` (`compact`). « Pas d'ingrédients » fallback of `FlipCard` defined once. `recipeId!` assertions replaced by `recipe.code`; `recipe.recipeId || recipe.id` → `recipe.recipeId`; category title via `categoryLabel`. Identical rendering.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 3 (theme); `DecimalInput` shows « 1.5 » with a dot after blur (to look at in the `shared/` review).

## 2026-10-08 — `features/` review: recipes, step 1 (v6.82.1)

- Done: read-only review of `features/recipes` (16 files), findings in `dev/refactoring.md`. Step 1: an unknown recipe id (stale link, deleted recipe) shows a simple « Recette introuvable » page with a « Retour au catalogue » button (`RecipeNotFound`) instead of an empty screen, in the recipe detail and the nutrition calculator. Calculator quantities and unit weights on `DecimalInput` (rule 10, « 1,5 » now possible). The filter modal no longer closes on a backdrop click. Owner's decision: the different card of an ingredient-type recipe in search vs category view is left as is (not a bug).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 2 (type counting to `core/logic`, duplicates, `recipeId!`), step 3 (theme).

## 2026-10-08 — Mandatory outdoor activity photo, front side (v6.82.0)

- Done: the dashboard activity modal gets a photo field (`PhotoField`, moved from the Recipe Builder to `shared/components/ui/`), mandatory (`validateOutdoorPhoto`: chosen file or existing photo). Creation sends the activity and its photo in one `multipart` call (`createOutdoorActivity(body, photo)`), edit does the JSON `PUT` then `POST /outdoor-activities/:uuid/photo` when a new photo is chosen (`uploadOutdoorActivityPhoto`); the confirmation recap shows the photo (creation) or the photo change (edit). Contract from the API session's real payloads, recorded in `docs/api.md` § Planned.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser nor against the API (endpoint not deployed).
- Problems: **breaking change** — once the API is deployed, the current prod front cannot create an activity until this commit is pushed. Push this commit only after the owner confirms the API is live on Render.
- Still open: API deployment + owner confirmation; API session still has to answer how many activities lack `meal_photo_path` and what `POST /import` does with activities; next review folder `features/recipes`.

## 2026-10-08 — Outdoor activity photo: decision and API plan (v6.81.3)

- Done: owner's decision: no « activité » mode in the Recipe Builder (creating an activity is very rare); the dashboard activity modal gets a mandatory photo. The API session answered: `POST /recipes/:uuid/photo` rejects activity uuids, so it plans `POST /outdoor-activities/:uuid/photo` (same multipart contract, check before upload, full activity in response); display, bootstrap and media resolve already handle activity photos. Recorded in `docs/api.md` § Planned and `docs/roadmap.md` § Blocked. Then the owner required the photo **server-side too** (every activity is said to have one): revised contract requested from the API session (atomic multipart creation, photo never removable, import, data check: the API session had said existing activities have no `meal_photo_path`). No front code yet.
- Still open: API deployment + real payloads, then the front (photo field in `OutdoorFormModal`, upload after create/update, « Activités sans photo » health point); next review folder `features/recipes`.

## 2026-10-08 — Recipe Builder migrated to the named theme colours (v6.81.2)

- Done: the 38 `dark:*-slate-*` classes of `features/recipeBuilder` replaced by the named colours (D-031), all exact pairs, identical rendering (`bg-surface`, `bg-muted`, `bg-subtle` and their `hover:`). This closes the code review of the Recipe Builder.
- Numbers: `npx tsc -b` + `npm run lint` pass; theme check 64 occurrences in 30 files left; not checked in a browser.
- Still open: « activité » mode of the Recipe Builder (outdoor activities with a photo), brainstorm with the owner before any code; category change of an existing recipe to design; then `features/recipes`, `news` + `sync`, `shared/`.

## 2026-10-08 — `features/` review: recipeBuilder, step 3 (v6.81.1)

- Done: numeric fields on `DecimalInput` (ingredient quantities in the desktop row and the mobile drawer, recipe N°, book page; rule 10). Save modal no longer closes on a backdrop click; recipe deletion confirmed with `ConfirmActionModal` (recap name + id). `vh` → `dvh` (drawer, ingredient list). Existing dish photo shown through `asset` (batch media resolution) instead of its raw URL. « Charger une recette » shows the French kind label. Duplicates: photo file check → `validatePhotoFile` (`core/logic/media/mediaLogic.ts`), food pick → `applyFoodPick` (`recipeBuilderMapper.ts`), Aliment / Base switch → `IngredientTypeToggle`, search dropdown → `SuggestionList`; useless `as string` casts removed.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 4 (theme), step 5 (« activité » builder brainstorm); category change of an existing recipe to design.

## 2026-10-08 — Recipe variants and mandatory dish photo (v6.81.0)

- Done: « Variante » button in the builder header when an existing recipe is loaded: `VariantModal` asks for a new name (different from the source) and a dish photo, then the draft becomes a new recipe (`toVariantDraft`: no `sourceCode`, next free N° of the category, category editable, ingredients without API ids). The dish photo is now mandatory for every recipe type (`validateBuilderPhoto`, checked live in the save panel and again in `useRecipeBuilderSave`); the photo panel title says « obligatoire ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Problems: existing recipes without a photo (ingredient-type ones in particular, Dashboard « Recettes sans photo ») can no longer be updated until a photo is added.
- Still open: step 3 (rules + duplicates), step 4 (theme), step 5 (« activité » builder brainstorm); category change of an existing recipe to design.

## 2026-10-08 — `features/` review: recipeBuilder, step 1 (v6.80.4)

- Done: read-only review of `features/recipeBuilder` (14 files), findings and owner decisions in `dev/refactoring.md`. Step 1 fixes: the builder now remembers the loaded recipe (`sourceCode`); its category and N° are locked (name editable) and Save always updates it, so changing the N° of a loaded recipe can no longer overwrite another recipe or silently create a copy; a new draft whose code is taken is blocked (`validateBuilderIdentity`); draft store v4 with migration. « Nouvelle recette » always asks for confirmation (`ConfirmActionModal`). Mobile ingredient drawer no longer closes on backdrop click (it bypassed the disabled « Terminé »), its close button follows the same rule. « Télécharger la recette » shows an error message on failure.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 2 (`feature:` « Variante » button + mandatory dish photo for every type), step 3 (rules + duplicates), step 4 (theme), step 5 (« activité » builder brainstorm); category change of an existing recipe to design.

## 2026-10-08 — Dashboard migrated to the named theme colours (v6.80.3)

- Done: the 12 `dark:*-slate-*` classes left in `features/dashboard` (25 before step 2) replaced by the named colours (D-031), all exact pairs, identical rendering: `bg-surface`, `bg-muted`, `hover:bg-subtle`. This closes the dashboard review.
- Numbers: `npx tsc -b` + `npm run lint` pass; theme check 102 occurrences in 43 files left; not checked in a browser.
- Still open: next `features/` folder (recipeBuilder: photo becomes mandatory); outdoor « activité » builder brainstorm; ISO week-year bug.

## 2026-10-08 — `features/` review: dashboard, step 2 (v6.80.2)

- Done: shared dashboard building blocks in `features/dashboard/components/common/` (`PillTabs`, `DataPanelShell`, `DataList`, `RowActions`, `FormModalShell`, `FormField`, `formStyles.ts`), used by the 4 data panels, the 3 rows and the 3 forms (components 1 760 → ~1 615 lines). `categoryLabel` (`core/logic/recipe/categoryLogic.ts`) replaces 6 copies of the category name lookup (incl. `outdoorFormLogic`, `recipeBuilderValidation`). Duplicate `core/domain/user` imports merged. « À découvrir » link built with `buildRecipeDetailUrl`. The activity id now shows its error while typing, like the food id. Visible changes: account form inputs aligned on the other forms (slightly smaller, modal `max-w-md` instead of `max-w-sm`); every data panel header wraps on narrow widths like the recipes one; the users empty state lost its icon.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 3 (theme, 25 classes before this step).

## 2026-10-08 — `features/` review: dashboard, step 1 (v6.80.1)

- Done: read-only review of `features/dashboard` (23 files), findings in `dev/refactoring.md`. Step 1: food and outdoor writes no longer report a failure when the write succeeded but the follow-up catalogue sync failed (the modal stayed open and a new « Ajouter » duplicated or got a 409); the sync failure is ignored, the next refresh catches up (owner: option A). `useUsers`: no synchronous state reset inside the effect (rule 7), the list stays displayed while it reloads after an account creation (it flashed « Chargement… »), « Chargement… » still shows on the first load and on « Réessayer ». `UserFormDraft.role` is a plain `UserRole` (`""` never happened): two casts and a dead validation removed.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 2 (shared dashboard components, category name helper, imports, recipe link, live activity id error) and 3 (theme).

## 2026-10-08 — Dessert choice when a drag would exceed 3 desserts (v6.80.0)

- Done: dragging a meal with its desserts onto a dessert-only slot used to silently drop the desserts beyond 3. Now « Déplacer aussi » opens a window listing every dessert (destination + moved, deduplicated) when the total would exceed 3; the user checks 1 to 3 to keep, the others are deleted (owner's decision). Pure `incomingDessertChoice` + `keptDessertIds` parameter of `computeDragMoveSlots` (`planningDragLogic.ts`), new `DessertChoiceModal` (no close on backdrop, spinner during the move).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: `features/dashboard` review findings waiting for the owner (`dev/refactoring.md`); kept desserts lose their persons override on a drag (pre-existing for every drag: `placeMeal` resets `recipePersons`).

## 2026-10-08 — Planning migrated to the named theme colours (v6.79.12)

- Done: the 55 `dark:*-slate-*` classes of `features/planning` replaced by the named colours (D-031). 46 exact pairs, identical rendering. 9 one-offs, owner's choices: shopping selection bar hovers and desktop day header hover → `hover:bg-muted`; picker close buttons → `hover:bg-surface-raised/60`; empty dessert / breakfast cells → `bg-muted/50` (more visible in dark mode); edge zones while dragging: text `text-slate-400` only, progress track `bg-strong/60`. This closes the planning review.
- Numbers: `npx tsc -b` + `npm run lint` pass; theme check 127 occurrences in 56 files left; not checked in a browser (light and dark mode).
- Still open: next `features/` folder (dashboard); dessert choice window when a drag would exceed 3 desserts (owner: what happens to unchecked desserts?); ISO week-year bug.

## 2026-10-08 — `features/` review: planning, step 5 (v6.79.11)

- Done: photo + veil + name block (copied 5 times) → `MealPhoto` (`compact`, `showName`, `eager`); drag grip + dnd-kit prop types (2 copies) → `DragHandle`; component `MealSlot` (same name as the domain type, imported as `MealSlotComp`) renamed `SingleMealSlot`; non-null assertions removed (`recipe!`, `savedMeal!`, `displayPersons!`, `MEAL_SLOTS.find(…)!`…); recipe meta editor defaults computed once in `MultiMealSlot`; `vh` → `dvh` (module height, pickers); `MoveDessertsPrompt` no longer closes on backdrop click; « Reset » → « Réinitialiser » and the bar uses `MAX_SHOPPING_DAYS`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Problems: the rename was done with `git mv` (agent mistake: git commands that modify the repo are owner-only); the rename is already staged.
- Still open: step 6 (theme); meals without photo (owner: photo mandatory, handled in the `recipeBuilder` review and the outdoor « activité » builder brainstorm).

## 2026-10-08 — `features/` review: planning, step 4 (v6.79.10)

- Done: `PlanningModule` 697 → 539 lines, same behaviour. Copy mode → `usePlanningCopy` + pure `buildCopiedSlot` / `copyTargetKey` / `parseCopyTargetKey` (`planningCopyLogic.ts`, no more `as SlotType` cast on the target key); shopping days selection → `useShoppingDaysSelection` + `MAX_SHOPPING_DAYS` (`planningConfig.ts`); swipe between days → `useHorizontalSwipe` + pure `shiftDay` (`planningDayNavLogic.ts`); week change while holding a dragged meal against an edge → `useDragEdgeWeekNav`; mobile « Jours de courses » grid → `ShoppingDaysPicker`; desktop day headers → `DayColumnHeader`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 5 (duplicates, renaming, `dvh`, prompt backdrop, « Réinitialiser », `ShoppingSelectionBar` still has its own `10`), step 6 (theme).

## 2026-10-08 — `features/` review: planning, step 3 (v6.79.9)

- Done: planning dates in local time. The `d` URL parameter and the date shown in the header were written with `toISOString()` (UTC): between midnight and 2 am (summer time), the header date was one day behind and « semaine suivante » could stay on the same week. New `toIsoDate` (`shared/utils/dateUtils.ts`, `format(date, "yyyy-MM-dd")`). « Aujourd'hui » (no `day` in the URL) was computed once when the app loaded, so it stayed on the previous day after midnight; now `dayNameOf(new Date())` at render time.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 4 (`PlanningModule` split) to 6 (theme); `freezerService` / `AddFreezerItemModal` still call `format(…, "yyyy-MM-dd")` directly (could use `toIsoDate`, `shared/` review); ISO week-year bug unchanged.

## 2026-10-08 — `features/` review: planning, step 2 (v6.79.8)

- Done: every planning write now has a double-click guard, a loading signal and catches its rejection (the global red notification still shows the API message); modes and editors close only on success. « Ajouter au planning » and drag & drop show a spinner on the slots involved (`planning-add-to-slot:<slotId>`, `planning-move:<slotId>`); copy stays in copy mode on failure; persons, recipe grams and dessert persons editors stay open on failure (local `saving` states replaced by the existing pending keys); the shopping days selection waits for the API (spinner on « Confirmer ») instead of closing before the answer. `RecipePicker`: the never-shown confirmation screen removed (owner's choice), spinner on the clicked row like `DessertPicker`; subtitle « Lundi · Déjeuner » instead of « Lundi - lunch ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 3 (local dates) to 6 (theme) of the planning review; dessert choice window when a drag would exceed 3 desserts.

## 2026-10-08 — `features/` review: planning, step 1 (v6.79.7)

- Done: read-only review of `features/planning` (24 files), findings and owner decisions in `dev/refactoring.md`. Step 1 fixes data loss when placing a dish: « ajouter au planning » on a lunch/dinner slot erased its desserts, slot persons and dessert persons (and on breakfast/snack the persons of the other recipes); replacing the dish from the picker reset the dessert persons; a dessert added in that mode to a slot without a dish became the main dish (now always a dessert); the picker on a full multi slot replaced all recipes. Rules moved to `core/logic/planning/planningSlotEditLogic.ts` (`buildEmptySlot`, `replaceMainRecipe`, `addRecipeToMultiSlot`, `placeRecipeInSlot`).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: next steps of the planning review: writes (dead `RecipePicker` confirmation removed, `withPending` + error handling), local dates, `PlanningModule` split, duplicates, theme; dessert choice window when a drag would exceed 3 desserts (`feature:`).

## 2026-10-07 — Session end (« pause test », v6.79.6)

- Done this session (v6.78.1 → 6.79.5, one commit per step): migration notes arbitrated; `core/services/` reviewed (cache services merged, atomic API calls for freezer item + bags and shopping period days, local cache kept consistent on partial failures); `features/shopping` + household tab, `features/freezer`, `features/journal` reviewed; named theme colours (D-031); batch source checks endpoint used. Three API endpoints were added by the API session and confirmed live by the owner: `POST /freezer-items` with `bags`, `PUT /shopping-periods/current`, `PUT /shopping-periods/:periodId/source-checks`.
- Resume here: P4 review of `features/planning` (24 files, ~2 700 lines) — read-only first, findings to the owner, then one commit per step. Known points to include: ISO week-year (`PlanningModule.tsx:101`, also `JournalModule`), UTC date in the `d` URL parameter (`PlanningModule.tsx:77/106/195/203`), `dayNameOf` available in `weekUtils`, theme colours (D-031, script approach: map exact pairs, report one-offs).
- To test first (all validated by tsc + lint only), light **and** dark mode:
  1. Freezer: add a food with a bag (one atomic call), reload; add / edit / duplicate a bag; rename the freezer and a category (card + detail; Enter, Escape, empty, unchanged); create a category; delete an empty category (direct) and a non-empty one (confirmation); « Aliment » tab orange in the add modal.
  2. Shopping: change the shopping days, reload, then remove all days; check / uncheck ingredients, stock with a comma (« 1,5 »); « Utilisé dans » sources and freezer bags; « Repas » view: check a whole card and a base group, reload; extras (add / edit / check / delete); « Articles » tab and « Tout réinitialiser »; price per kg.
  3. Journal: grams of a single-ingredient meal saved on Enter / blur, reload; two ingredient edits in a row on the same recipe, reload; profile switch; « Objectifs » (empty field disables « Valider ») and « Moyenne » (no close on backdrop); day navigation across a week change; row kcal sum = card total.
  4. Dashboard: any write still shows its confirmation (`ConfirmActionModal` moved to `shared/components/ui/`).
- Still open: owner test results; next review folder (planning).

## 2026-10-07 — Journal migrated to the named theme colours (v6.79.5)

- Done: the 21 `dark:*-slate-*` classes of `features/journal` replaced by the named colours (D-031), identical rendering except one hover: inactive profile in `ProfileSwitcher` (`hover:bg-slate-50 dark:hover:bg-slate-200/60` → `hover:bg-subtle-tint`, 40 % instead of 60 % in dark mode). This closes the journal review.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (light and dark mode to compare).
- Still open: next `features/` folder of the P4 review.

## 2026-10-07 — `features/` review: journal, step 3 (v6.79.4)

- Done: `JournalModule` loads the week into state keyed by `year-week` with a single effect (load + refresh tick), instead of resetting to `null` in an effect cleanup and a second `useRef`-guarded refresh effect; a refresh no longer flashes the loader. Day name of a date → `dayNameOf` (`weekUtils`, from `DAYS` of `planningConfig`), replacing the local `DAYS` + `getDayKey`. `MealSlotCard` uses the central `shortLabel`s (« Prot. / Lip. / Gluc. / Fib. », owner OK). The per-item macro computation of `computeSlotMacros` is extracted as `computeItemMacros` (`macroUtils`) and reused by `RecipePortionRow` for its kcal, so a row and its card total can no longer diverge (placed in `macroUtils` rather than `core/logic/journal` to avoid a new `core` → `shared` import).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 4 (theme colours) of the journal review.

## 2026-10-07 — `features/` review: journal, step 2 (v6.79.3)

- Done: « Objectifs » and « Moyenne de la semaine » no longer close on a backdrop click (project convention, `docs/ui-design.md`). Targets: `type="number"` + `parseInt` → integer `DecimalInput`s (an emptied field disables « Valider » instead of being silently skipped), save through `withPending('profile-targets:<id>')`, modal stays open on error; the unused `min` / `max` / `step` ranges (never enforced by the browser on typing) removed.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 3 and 4 of the journal review.

## 2026-10-07 — `features/` review: journal, step 1 (v6.79.2)

- Done: read-only review of `features/journal` (9 files), findings arbitrated by the owner (`dev/refactoring.md`). Step 1 fixes a real bug: the grams field of a single-ingredient meal (`type="number"` + `parseFloat`) and the per-ingredient fields saved on every keystroke, so typing « 150 » sent 1, 15, 150 in parallel and an out-of-order response could leave 15. Both are now `DecimalInput`s that save once on blur / Enter with a local draft; `useJournalStore.persistOverride` queues saves per profile × planning item and builds each payload from the state left by the previous save (two quick edits on two ingredients of the same meal could also overwrite each other). Portion stepper and ingredient writes now catch their rejection.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: steps 2 (modals: no backdrop close, `DecimalInput` + `withPending` for targets), 3 (week loading per week, `dayNameOf`, central short macro labels, row kcal to logic), 4 (theme colours) of the journal review.

## 2026-10-07 — Freezer migrated to the named theme colours (v6.79.1)

- Done: the 43 `dark:*-slate-*` classes of `features/freezer` replaced by the named colours (D-031), identical rendering, including the bag tree border (`border-slate-100 dark:border-slate-200` → `border-muted`, same pair). One visible change, owner's choice: the « Aliment » tab of « Ajouter à la catégorie » is orange when selected, like « Batch cooking » (was dark slate in light mode and light beige in dark mode). This closes the freezer review.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (light and dark mode to compare).
- Still open: next `features/` folder of the P4 review; tablet portrait pass of the freezer (P5) not done.

## 2026-10-07 — Confirm before deleting a non-empty freezer category (v6.79.0)

- Done: deleting a freezer category that still holds items now opens a confirmation (« Supprimer « Viandes » ? », content count, red « Supprimer »); an empty category is still deleted in one click, items / batches / bags unchanged (owner's choice). `ConfirmActionModal` moved from `features/dashboard/components/data/` to `shared/components/ui/` (owner's choice), the 7 dashboard imports updated, no other change to it. The modal is rendered next to the card (fragment), not inside it, so its clicks do not open the category and the card's hover transform does not shift it.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 4 of the freezer review (theme colours, « Aliment » tab orange).

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
