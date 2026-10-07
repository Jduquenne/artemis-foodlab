# Spec — Journal

Daily macro tracking per profile, based on the meals planned in the Menu. Profiles: `docs/spec-accounts.md` § Profiles.

## Day view

- Macros of the day for the **active profile**, against its targets (`MacroSummary`, with `ProfileSwitcher` in its header).
- Per planned meal, portion (stepper) or grams override for the whole meal (`RecipePortionRow`). The stepper uses `withPending`; the grams field deliberately does not (free text). The grams input is keyed with `activeProfileId` (it was not reset when switching profile).
- Mobile (`< sm:`): meals in a horizontal scroll-snap carousel with a dot indicator (`JournalModule.tsx`); the expanded ingredient list scrolls internally (`MealSlotCard.tsx`, `overflow-y-auto`). Two distinct axes, no gesture conflict. Tablet: see `docs/ui-design.md`.

## Week average and targets

- `WeekAverageModal` (button « Moyenne », left of « Objectifs »): per-day average of macros over the chosen days (default Monday → Friday) of the displayed week. Pure computation `core/logic/journal/weekAverageLogic.ts`. Checked days **without any planned meal are excluded** from the denominator; the modal shows how many days were counted.
- Targets: **calories are not editable**; they are computed with Atwater (`atwaterKcal`, `core/logic/nutrition/atwaterLogic.ts`: `4P + 9L + 4G + 2·fibres`) from the 4 macros and saved on validation. A kcal target saved before this change may be inconsistent until the next validation. Macro targets are integers. Targets are edited through the profile (`updateProfile`).

## Per-ingredient, per-day quantities

Beyond the whole-meal portion/grams override, a meal can be expanded (chevron on `RecipePortionRow`, only for a dish/base that has ingredients) to adjust the quantity of each ingredient **for that day only**, never modifying the recipe. 0 = ingredient not used that day. Goal: more precise daily macros. Decisions: `docs/decisions.md` D-011.

- **Unified model**: `useJournalStore.setPortionOverride` / `setGramOverride` compute a ratio (`portions / defaultPortions` or `grams / baseGrams`) and apply it to all ingredients via `scaleIngredientsByRatio` (`core/logic/journal/journalOverrideLogic.ts`) to fill `ingredientOverrides`, in addition to writing `portionsOverride` / `gramsOverride`. Fine editing of one ingredient (`setIngredientOverride`, UI `IngredientOverrideRow`) then corrects one entry on top — one single "changed today" mechanism, not two.
- Persistence: `POST /journal-overrides` replaces the 3 fields on each call (`docs/api.md` § Journal); the store's internal `persistOverride` always reads the current state of the 3 fields before sending — never post an isolated partial patch.
- **Pitfall (already met and fixed)**: the "default" quantity shown for an ingredient (and used as fallback for an ingredient not explicitly changed) must always be scaled by the **current** portion ratio (`defaultIngredientOverridesForPortions`), never the raw recipe quantity for its `defaultPortions` — otherwise editing one ingredient makes the others fall back to the whole-recipe scale (e.g. recipe for 4, journal at 1 portion → total exploded).
- **Nested bases**: one level only — a `baseId` ingredient stays a single adjustable line, never recurse into its composition.
- **Unitless ingredients** (`Unit.NONE`, typically spices added "by eye") are excluded from the expandable list and from any scaling (`isOverridableIngredient`); they never contribute to macros anyway (`calculateRecipeMacros` ignores them).
- Computation: `calculateOverriddenRecipeMacros` (`shared/utils/macroUtils.ts`) patches `recipe.ingredients` with the overrides then forces `defaultPortions: 1` to get an absolute total (not a per-portion average). `computeSlotMacros` / `computeDayMacros` use this path when `ingredientOverrides` exists for an item, otherwise fall back to the historical computation (single factor × precomputed macros) — backward compatible with overrides saved before.
- Cascade: if the meal is removed from the planning, all its overrides are deleted (clean slate). Overrides are always persisted in the database, never only locally.
