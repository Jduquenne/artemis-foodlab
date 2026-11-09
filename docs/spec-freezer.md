# Spec — Freezer

Freezer categories containing items: foods (with bags) and batch-cooking dishes (portions). Categories are sorted alphabetically (manual reordering removed). The freezer name is `freezerName` on the user (`PUT /me`).

## Category colour

- `FreezerCategory.color: string | null` (API contract: `docs/api.md` § Freezer). `null` = automatic colour (hash fallback).
- `freezerService.createCategory(name, color?)` (sends `{ name }` alone without colour) + `updateCategoryColor(id, color)` (`null` explicit to go back to automatic).
- Palette `FREEZER_ACCENTS` in `features/freezer/freezerAccents.ts`: 10 keys (`rose, orange, amber, lime, emerald, teal, sky, blue, violet, fuchsia`) → `{ bar, badge, swatch }` as **literal Tailwind classes** (required for Tailwind v4 to generate them). `getFreezerCategoryAccent(category)`: `category.color` if it is a known key, otherwise hash of `category.id` mod 10.
- `FreezerColorPicker` (`components/category/`): row of swatches + « A » (auto = `null`); used in `AddCategoryForm` and in the ⋯ menu of `FreezerCategoryCard` (« Couleur », `Palette` icon).

## Category grid — `FreezerCategoryCard`

- Small rounded bar at the top (`h-1 w-10`, `accent.bar`) — not a full-width band (it clipped the ⋯ menu; the card is no longer `overflow-hidden`). Card `z-30` while its menu is open.
- Coloured snowflake badge + name + subline `N articles · N portions` (portions = sum over batch items), via `summarizeFreezerCategory(category)` → `{ total, foodCount, batchCount, portions }`.
- Typed chips: batch items in orange with `·N`, foods neutral, `+N` overflow. Hover `-translate-y-0.5 hover:shadow-md`. Empty state « Touche pour ajouter des articles ».

## Inside a category — `FreezerCategoryDetail`

- Header snowflake in the category colour; empty state with `Snowflake` icon.
- `FreezerItemRow` (food): subtitle `getFoodBagsSummary(item)` (« 3 sacs · 1,2 kg » if all units match, else « 3 sacs »), bags listed as a tree (`border-l-2`).
- `BagRow`: bold quantity + preparation tag + **relative age**. `BatchFreezerItemRow`: same border/badge, relative age, `− N +` stepper.
- `freezerItemAge(iso, now?)` → `{ label, stale }`: « aujourd'hui / hier / il y a N j / N sem. / N mois / N ans »; `stale = days >= 90` → age shown in amber with `AlertTriangle`.
- Bag units: `SELECTABLE_UNITS` (no `Unit.NONE`; a bag without unit could never be saved). Decimal input via `parseDecimal`.
- Pending feedback on delete, portions, bags, rename, colour.
- **Add a batch to the menu** (issue #32, v6.129.0): the « ⋯ » menu of a non-empty `BatchFreezerItemRow` has « Ajouter au menu » → `AddBatchToMenuModal` (`modal/`, `sm:max-w-3xl`): a simplified **week calendar** to see where the batch fits (owner, 2026-11-09: a date + meal form was not enough). Week navigation ‹ › + « Cette semaine » (`mondayOf`, `shiftWeek`, `isoWeekOf`); `BatchMenuWeekGrid` = 7 days × lunch / dinner (`BATCH_MENU_SLOTS`), days as columns from `sm:` and as rows on mobile (same DOM: a header group then one `contents` group per day, `grid-flow-col` on `sm:`); each `BatchMenuCell` shows the planned dish (3 lines) or « Libre », « Déjà ce plat » when the batch recipe is already there, dimmed for past days, orange ring when selected; today's header highlighted. The week comes from `usePlannedWeek(year, week)` (`shared/hooks/`: `syncWeekFromApi` then live read of the cache). Nothing selected at first; the save button names the chosen slot. An amber notice « Ce repas remplacera « X » » appears when the chosen slot holds another dish (`plannedDishAt`). Save = `placeMainDish` (`planningService`: `syncWeekFromApi`, `replaceMainRecipe`, `saveSlot`, desserts kept), `withPending` key `freezer-batch-to-menu:<itemId>`, success notification. Owner's decisions (2026-11-09): the freezer portions are **not** decremented (the planning can change; the « − » stays manual, as for the generator), an occupied slot is replaced after the notice, breakfast / snack excluded. Allowed in demo (planning is user data).
- Deleting a **non-empty** category asks for confirmation (`ConfirmActionModal`, red « Supprimer », content count from `formatFreezerCategoryCount`); an empty category, an item, a batch or a bag is deleted in one click (owner's choice, 2026-10-07).
