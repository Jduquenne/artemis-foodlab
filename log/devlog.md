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

## 2026-10-21 — Recipe filter « De saison » (v6.121.0)
- Done: owner info: the menu generator and `bulk-items` (v1 + extension) are in prod and working, adjustments later (`docs/api.md`, roadmap updated). Owner request: a recipe search filter on the current month only (not the 4 seasons); first choice A (recipes without any seasonal food stay listed, generator rule) gave 729 recipes in the owner's test, far too many → choice B: at least one seasonal food, all in season (`isSeasonalRecipe`, `seasonalRecipeIds`); the generator keeps `isRecipeInSeason`; then restricted to lunch / dinner dishes (owner: no desserts), `seasonalMealIds`. B showed 0 recipes in the owner's test (with A: 729 = no recipe had a detected seasonal food). Cause (API session): the test ran against the dev database, where the 2026-10-16 season import never ran (0 seasons); prod was fine (71 foods with a season, all fruits and vegetables, 0 elsewhere; fv-040 Épinards and fv-070 Petits pois, now frozen, lost their season). Dev refreshed from prod (390 foods, same months). No front or API change. Proposal left to the owner: count only « Fruits et légumes » foods for the season in the front (D-034 says any category). `RecipeFilter.inSeason` (restored by `normalizeRecipeFilter`, old saved filters → false), active without a type, kept when the type is removed (`setFilterType`), `setFilterInSeason`, counted in `countFilterCriteria`. `seasonalMealIds` (`recipeSeasonLogic.ts`), `MONTH_LABELS` (`seasonLogic.ts`), hook `useInSeasonRecipes` (current month + ids, memoised on the snapshots); `filterRecipesByFilter` / `matchesRecipeFilter` take the in-season ids. UI: `SeasonFilterToggle` (« De saison en octobre » + count) on top of `RecipeFilterModal`, chip « De saison · octobre » in `ActiveFilterChips`; search and `CategoryDetail` both use it.
- Numbers: `npx tsc -b` + `npm run lint` pass, golden-rule greps clean. **Not checked in a browser, not on the real catalogue** (to test with `npm run dev`).
- Owner retest on the refreshed dev data: 189 recipes in season in October. Still open: rest of the owner checks (Recettes → Filtres → « De saison », alone then with a type; chip removal; reload keeps the filter; a category page); U2, U3, vegetarian detection gap.

## 2026-10-17 — Pause test: menu generator V2 + A / B / C + settings UI U1 (v6.120.1, docs only)
- Done: session paused by the owner to test in a browser. Owner question answered: the « Végétarien » diet = no meat and no fish (bases included), detected from the recipe category (`red-meat`, `white-meat`, `charcuterie`, `fish`) and from each ingredient's category in the recipe (« Viande », « Charcuterie », « Poisson »); eggs and dairy allowed. Known gap: meat / fish filed under « Conserves » or « Surgelés » (canned tuna, frozen shrimps) is not detected; proposed fix to decide: a data check by the API session first, then possibly also read the food's own category. Roadmap current focus brought up to date.
- To test first (admin account, `npm run dev`, dev API since `bulk-items` is dev only):
  1. Planning → « Générer »: full-screen window without scroll, light and dark mode, every settings tab, an editor open, a long list (U1 cards, switches, badges, empty states).
  2. Settings survive a reload (device storage); « Toutes saisons » = all months checked.
  3. Habits: fish on Friday (mandatory), « un seul des repas du jour », « sauf si la recette contient », family and list targets, « Pas de repas ».
  4. Quotas: « entre 1 et 2 » poulet, legumes ≥ 2 with « aliments différents », soup by name ≥ 3 with « pas 2 fois de suite », a 10-day period (prorated last block).
  5. Foods to use, favourite and banned recipes, freezer meals spread over the period, frozen foods allowed out of season.
  6. Advanced: same starch in a row, day nutrition limits (strict: recipes without data excluded, warning), « Jour » row in the grid.
  7. Desserts: a lunch rule (seasonal fruit + chocolate), a dinner rule; check « Chocolat 85 % », « Chocolat 74 % », « Skyr » are flagged dessert in the catalogue.
  8. Preview: lock / regenerate one meal, detail on click, kcal per day; write → Planning opens on the start week, already filled slots keep their dishes, desserts written; then the shopping list.
- Still open: U2 (vertical menu with counts: Essentiel, Habitudes, Quotas, Aliments, Desserts, Variété, Nutrition; mobile list then screen), U3 (editor steps 1 Quand · 2 Quoi · 3 Force, live summary sentence, sticky Enregistrer / Annuler); vegetarian detection gap (decision pending); `bulk-items` (v1 + extension) prod go-live to be confirmed by the API session **before any push of `master`**; shopping days offer (D-035 UX); ideas: leftovers, setting sets, side dishes.

## 2026-10-17 — Menu generator settings UI U1: shared components (v6.120.0)
- Done: owner feedback « tout est posé en vrac, sans style ni ergonomie »; owner choices: vertical menu (U2) and a dedicated editor panel (U3). U1: `SettingsCard`, `SegmentedControl`, `Switch`, `StrengthBadge`, `TargetKindIcon`, `RuleCard`, `RuleListPanel` (editor replaces the list), restyled `ChoicePills` (check icon) and `SettingsSection` (uppercase label). Applied to every panel: Période et repas (cards Période, Repas à générer, Régime, Saison, Plats du congélateur with a switch), Aliments et recettes (5 cards), Avancé split into `VarietySettingsPanel` + `NutritionSettingsPanel` (cards; `ADVANCED_MODE_OPTIONS` moved to `generatorSettingsLogic`), Habitudes / Quotas / Desserts on `RuleListPanel` + `RuleCard` (switch, strength badge, target icon, empty state with examples), food lists on `RuleCard` (delete disabled with « Utilisée par N règles »). Editors: single choices on `SegmentedControl`, quota options on switches, editor cards restyled. Fix: `foodListUsage` now also counts dessert rules (a list used by a dessert pick could be deleted).
- Numbers: `npx tsc -b` + `npm run lint` pass; engine untouched (A1 check rerun for `foodListUsage`). **Visual change, not checked in a browser** (to test with `npm run dev`: light / dark mode, every tab, an editor open, a long list).
- Still open: U2 (vertical menu with counts, Essentiel / Variété / Nutrition), U3 (editor steps + live summary sentence + sticky actions).

## 2026-10-17 — Menu generator C2: desserts (v6.119.0)
- Done: owner decisions: C1 (automatic side dishes) dropped for now (nothing was coded), C2 as proposed, desserts also added to kept meals that have none. Domain `DessertPick`, `DessertRule`, `settings.dessertRules` (restored with validation), `GeneratedMeal.dessertCodes`, `PlanningItemEntry.isDessert`, `BulkPlanningResult.writtenDesserts` / `skippedDesserts`. `dessertLogic.ts` (`emptyDessertRule`, `validateDessertRule`, `dessertRuleFor`, `dessertPickLabel`, `dessertCandidates`, `seasonalDessertPool`, `pickDessert`, `searchDessertRecipes`). Engine dessert pass after the dishes (fixed meals keep theirs, « Pas de repas » none, warning on impossible picks). `existingDessertsByKey` + context `existingDesserts`. Write: dessert entries with `isDessert`, service counts dishes and desserts separately, `menuWriteMessage` « N repas et M desserts ». UI: tab « Desserts », `DaysField` extracted from `HabitEditor`, `RecipeSearchInput` gains `search` / `placeholder`, desserts in the cell and the detail. D-035 (no desserts in V1) and D-036 updated, side dishes added to the roadmap ideas.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-c2-check.ts`, October, 2 weeks): lunch = seasonal fruit + Chocolat 85 %, dinner = Skyr + Chocolat 74 %; no dish is a dessert recipe; over 50 seeds the October fruits (apple, pear, kiwi) rotate, 0 strawberries, 0 same fruit two days in a row; a kept lunch without dessert gets the rule's desserts, one with a dessert is untouched; « Pas de repas » → none; regenerating one meal keeps the others' desserts; entries carry `isDessert`; messages; validation; impossible pick warning; restore. All earlier checks pass (scripts updated). **Not checked in a browser, not against the dev API with desserts**.
- To check in the catalogue (owner): « Chocolat 85 % », « Chocolat 74 % », « Skyr » exist as recipes flagged dessert; fruit desserts are in category « Fruits » (the dessert search only lists flagged desserts).
- Still open: owner browser test of the whole V2 + A / B / C; `bulk-items` (v1 + extension) prod go-live still to be confirmed before any push.

## 2026-10-17 — Menu generator B8: day nutrition limits (v6.118.0)
- Done: owner decisions: one set of limits for the household (not per profile), a day with a single generated meal checks the maxima only, strict excludes recipes without nutrition data. Domain `NutrientKey`, `NUTRIENT_KEYS`, `NutrientRange`, `DayNutritionLimits` in `AdvancedSettings.dayNutrition` (default strict, no limit). `dayNutritionLogic.ts`: `hasDayLimits`, `recipeNutrients`, `addNutrients`, `nutrientDeviation`, `nutrientsOutOfLimits`, `bestDayDeviation`, `formatNutrients`, `formatDayLimits`. Engine: known other meal of the day added, open one explored as « later options » (the lunch keeps a valid dinner possible), strict filter + warning for recipes without data, preferred penalty, « Journée : … » reason; the per-meal kcal score and strict filter step aside when limits are set. Preview `DayKcalSummary.nutrition` + `DayKcalBadge` (four totals, orange outside), grid row « Jour ». Settings restore + `validateNutrientRange`. UI `DayNutritionField` in « Avancé », « Calories par repas » greyed when limits are set.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-b8-check.ts`, 80 synthetic recipes with random macros, 4 without data, owner's limits, 50 seeds × 14 days): days within all limits 0 / 700 without limits, 264 / 700 preferred (112 with a first, weaker penalty: raised to × 60, cap 10, no-data −20), 700 / 700 strict with 0 empty slot and 0 recipe without data; warning « 4 recettes sans valeurs nutritionnelles … »; a planned Monday dinner → the lunch completes the day exactly; canteen lunch Mon → Thu → dinners within the maxima, below 850 kcal allowed; preview summary and reason; kcal shares silent; restore drops min > max and negatives. All earlier checks pass. Runtime ~20 ms per generation on 80 recipes. **Not checked in a browser, not on the real catalogue**.
- Still open: test on the real catalogue (the share of recipes with nutrition data matters in strict); C (sides, desserts) on the bulk-items extension. `bulk-items` prod go-live still to be confirmed.

## 2026-10-17 — Menu generator B7: same starch in a row (v6.117.0)
- Done: `AdvancedSettings.starchInRow` (default off) + `starchMax` (1..4, default 2, restored with clamp); `starchLogic.ts` (`starchFoodIds`: foods of category « Féculents », `starchRunViolations`: previous run + 1 + next known run > N); engine keeps the starches of every placed meal and looks ahead over the next known meals; strict filter « pas plus de N repas de suite avec le même féculent », preferred −3 (`starchAdjust` in the score context, reason `repeat`). UI: « Même féculent à la suite » in « Avancé ».
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-b7-check.ts`, pasta in 18 / 30 recipes, 100 seeds): runs of more than 2 pasta meals in 100 / 100 menus (off, longest 13), 43 / 100 (preferred, longest 8), 0 / 100 (strict, longest 2); strict N = 1 → longest 1; 2 pasta meals already planned on Monday → Tuesday lunch never pasta; 2 pasta meals planned on Wednesday → Tuesday dinner never pasta (look-ahead); restore clamps 9 → 4. Earlier checks pass. **Not checked in a browser**.
- Still open: « De préférence » is a moderate penalty (43 / 100 with a dominant starch); B8 (day nutrition limits), C (sides, desserts). `bulk-items` prod go-live still to be confirmed.

## 2026-10-17 — Menu generator B9: frozen foods never out of season (v6.116.0)
- Done: `SeasonCatalogue.seasonExemptFoodIds` (optional); `collectSeasonalFoods` sets aside seasonal foods that are in the freezer or used as a « Surgelés » ingredient (`seasonalFoodSplit`, a food also used fresh stays seasonal); `frozenOutOfSeasonFoods`; season score adds the reason « Hors saison, mais au congélateur ou surgelé : … ». Hook context gains `frozenFoodIds` (`getFoodIdsInFreezer`, bags > 0). Always on, no setting.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-b9-check.ts`, October, strict season, 30 seeds): courgette gratin 0 / 30 without courgette in the freezer, 30 / 30 with; frozen green beans 30 / 30, fresh 0 / 30; reason shown; earlier checks pass. **Not checked in a browser**.
- Still open: B7 (same starch in a row), B8 (day nutrition limits), C (sides, desserts). `bulk-items` prod go-live still to be confirmed.

## 2026-10-17 — API: bulk-items extension payloads received (v6.115.2, docs only)
- Done: real dev payloads (a) dish + side + 2 desserts, (b) filled slot: dishes skipped (`slot_has_dish`), dessert still written, (c) `dessert_limit` + the fail variant (409, nothing written), (d) exact duplicate 400 — summarised in `docs/api.md`, TODO removed. Not captured: the « more than 4 dishes in one slot » 400 (the front never sends more than 4).
- Still open: prod go-live of `bulk-items` (both versions) to be confirmed by the API session; C (sides, desserts) can now be built on dev. Next front step: B9.

## 2026-10-17 — API: bulk-items extension described (v6.115.1, docs only)
- Done: the API session extended `POST /planning-slots/bulk-items` on dev (several items per slot, `isDessert`, 200 entries, per-slot 4 dishes / 3 desserts in the body, `slot_has_dish` for all dish entries of a filled slot, `dessert_exists`, `dessert_limit`, `skipped` gains `itemId`, `isDessert`, `reason`; backward compatible). Recorded in `docs/api.md` from its description. The current front (dishes only, one per slot) is unaffected.
- Problems: the real payloads asked for (cases a-d) were not sent; nothing will be coded against the extension before they are (TODO(owner) in `docs/api.md`). Prod go-live of `bulk-items` (both versions) still to be confirmed.
- Still open: request the payloads; B9, B7, B8; then C (sides, desserts) on the extension.

## 2026-10-17 — Menu generator A2: quota ranges, different foods, not twice in a row, recipe name target (v6.115.0)
- Done: `WeeklyQuota` = `min` / `max` (nullable) + `distinctFoods` + `noConsecutive` (was `comparator` + `count`, converted on restore; `QuotaComparator` removed). `quotaLogic.ts` rewritten: `QuotaMode` (`quotaMode`, `withQuotaMode`, `QUOTA_MODE_LABELS`), `quotaMinFor` (prorated min), `quotaSummary`, `supportsDistinctFoods`, `quotaTargetFoods`, `countsForQuota`, `assignQuotaSlots` (min slots, no adjacent picks when « pas 2 fois de suite »), `quotaScore` (+ adjacency penalty). Engine: counts track the target foods already used per week; strict max caps; strict « pas 2 fois de suite » filter on the previous / next known meal; a min slot blocked by its neighbour is deferred within the week (first version lost it at week boundaries: soup ≥ 3 gave 2 in some weeks, with a warning). Target `name` (keywords, `foldText` added to `textUtils.ts`: accents, case, apostrophes) for habits and quotas. UI: `QuotaEditor` (Au moins / Au plus / Entre, one or two steppers, options), `QuotaRow` summary, `KeywordsField`.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-a2-check.ts`, 100 seeds, 2 weeks): chicken 0..4 per week without quota → 1..2 with « entre 1 et 2 »; legumes ≥ 2 with « aliments différents » → 200 / 200 weeks with 2 different legumes (43 weeks with a single one without the option); soup by name ≥ 3 with « pas 2 fois de suite » → 3..3 per week, 0 soups in a row (68 without the option); « veloute » matches « Velouté de Brocolis »; summaries, validation, mode switch, old quotas converted. All earlier checks pass (two old scripts still build quotas with the former `count`, their extra lines are test artefacts). **Not checked in a browser**.
- Still open: B9 (season ignores frozen / freezer foods), B7 (same starch in a row), B8 (day nutrition limits), C once the API answers. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator A1: one meal of the day, exceptions, families and lists (v6.114.0)
- Done: owner's real rule list compared with the V2 (16 rules: covered, partial, missing); decisions: outdoor meals planned by hand before generating (kept slots, nothing to build), day nutrition limits will replace the kcal shares when set, order A → B9 / B7 → B8 with the API prompt (several dishes per slot, desserts in `bulk-items`) sent now, both catalogue families and generator lists. A1: `HabitRule.scope` (`eachMeal` / `oneMeal`) + `exceptFoodIds`; `HabitTarget` gains `family` (`groupId`) and `list` (`listId`); `FoodList` in the settings (`foodLists`, restored with validation; old rules get `eachMeal` and no exception). `habitLogic.ts`: `matchesHabitRule`, `isOneMealHabit`, `habitExceptLabel`, `HABIT_SCOPE_LABELS`, family / list matching and labels, `emptyFoodList`, `validateFoodList`, `foodListUsage`; `slotHabits(…, extra)`; matcher gains `foodGroupOf`, `listFoods`; names gain `groupNames`, `lists` (engine input `groupNames`, hook `useHabitNames`). Engine: one-meal rules assigned per day to one random possible slot (skipped when a kept / locked meal already matches), warning when impossible. UI: `FoodChipsField` (shared chips + search), `HabitTargetField` (family, list), `HabitEditor` (« Sauf si la recette contient », « S'applique à »), `HabitRow` (exception, « un seul des repas »), « Listes d'aliments » (`FoodListsField`, `FoodListEditor`) in « Aliments et recettes »; quotas get family / list targets too.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-a1-check.ts`, 2 weeks): fish « un seul des repas » on Friday → 100 / 100 Fridays with fish, lunch or dinner at random, the habit reason on 60 / 60 assigned meals; default « chaque repas » → 2 per Friday; a kept salmon lunch → the dinner is free; « Viande sauf Jambon » forbidden at dinner → never lardons / beef, ham toast 35 times over 50 seeds; known limit confirmed: a ham + beef recipe passes; family « Poisson blanc » → only cod / pollock; list « Poisson du mardi » once on Tuesdays; quota on a list ≥ 3 per block met; list validation and usage; restore. All earlier checks pass (scripts updated). **Not checked in a browser**.
- Still open: A2 (quota range, distinct foods, « pas 2 fois de suite », recipe name contains), B9, B7, B8, then C once the API answers. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator: habit / quota on several foods (v6.113.0)
- Done: owner's first browser test of the V2: « a lot of good », first fix requested: a habit on foods takes a list, the meal contains one food of the list (any). `HabitTarget` food = `{ foodIds: string[] }` (« at least one of » the list; quotas share the target, so they get it too); label « Saumon ou Cabillaud »; validation « Choisis au moins un aliment. »; `restoreHabitTarget` converts a saved `foodId` and drops an empty list. `HabitTargetField`: chips joined by « ou », search adds more, hint « Le repas contient au moins un aliment de la liste, peu importe lequel. ».
- Interpretation to confirm by the owner: « at least one » of the list (a recipe with two of the foods also counts), not « exactly one ».
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-habits-check.ts`): Friday lunch « Saumon ou Cabillaud » mandatory → always one of the 3 matching recipes over 50 seeds, all 3 used; old single-food habit migrated to `foodIds`; earlier habit results unchanged. **Not checked in a browser**.
- Still open: the other points of the owner's test (to come). Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 7: advanced settings, favourite and banned recipes (v6.112.0)
- Done: `AdvancedSettings` (`repeatWeeks` + `repeatMode`, `categoryInRow`, `kcalMode` + `kcalTolerance` + `kcalShares`, each off / preferred / strict) with `DEFAULT_ADVANCED_SETTINGS` replacing `KCAL_SLOT_SHARE`, `KCAL_TOLERANCE`, `RECENT_HISTORY_WEEKS` (defaults = V1 behaviour); `favoriteRecipeCodes`, `bannedRecipeCodes`; reason kind `favorite`. Scoring reads the advanced settings (`slotKcalTarget(…, advanced)`, `kcalDeviation`, mode off = information only); engine strict filters (repeat, category in a row, kcal) on the scored pick with the first blocking setting named in the empty slot and a warning; banned recipes out of `slotCandidates`; favourites on random slots (`assignToRandomSlots`, generalised from `assignPreferredFoods`). UI: tab « Avancé » (`AdvancedSettingsPanel`, `NumberStepper` extracted from `QuotaEditor`, `stepQuotaCount` removed), tab « Aliments » renamed « Aliments et recettes » with « Recettes favorites » / « Recettes interdites » (`RecipeListField`), `Heart` icon. Restore with clamps (`ADVANCED_LIMITS`).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-advanced-check.ts`, 50 seeds, 2 weeks): recipes planned < 3 weeks ago used 489 (off) / 282 (preferred) / 0 (strict) with 36 recipes; same category in a row 202 / 1 / 0; meals outside ±15 % kcal 1023 / 635 / 0; shares 50 / 40 → lunch target 1000, day target 1800; banned never used; favourites with 150 recipes: 76 / 100 vs 54 without, 19 positions over 30 seeds (moderate bonus); favourite then banned → banned only; restore clamps (42 weeks → 8, 2 % → 5, 99 % → 60) and dedupes codes; same seed → same menu. Earlier checks pass (scripts updated for the new fields). **Not checked in a browser**.
- To test: « Avancé »: switch each setting to « Strict » and regenerate (no recipe from the last N weeks, no same category in a row, kcal row all green); shares change the kcal row target; « Recettes interdites » never appear; a favourite shows the heart; reopen → advanced settings kept; « Réinitialiser » restores the defaults.
- Still open: owner browser tests of the whole V2; then owner validation before opening to everyone, shopping days offer (D-035 UX). Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator: period of 7 to 14 days, quotas per 7-day block (v6.111.1)
- Done: owner decisions: the generator is not meant for 2 days or partial weeks → `MIN_GENERATION_DAYS` = 7 (`validatePeriod` « La période doit faire au moins 7 jours. », restore clamps 7..14, hint « de 7 à 14 jours »); a quota « week » = a block of 7 days from the period start (`periodBlocks`, `QUOTA_BLOCK_DAYS`; was the ISO week, which cut Fri → Thu in two prorated pieces). `QuotaWeek` → `QuotaBlock`, `weekKeyOf` removed (no consumer left). Only the last block of an 8-13-day period is incomplete and still prorates « au moins ». Warnings name the block (« Semaine 1 (23 oct. → 29 oct.) »). Quotas tab text updated. Docs: spec-planning, D-035 (period), D-036 (quotas).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-quotas-check.ts` updated to blocks): Fri → Thu = one block, fish ≥ 3 met on 50 seeds; 10 days → block 1 ≥ 3 and block 2 (3 days) ≥ 1 on 50 seeds; 6 days → error, 7 ok, 15 → error, 14 ok; a saved 3-day length restores as 7 days; other quota results unchanged; habits, foods to use, freezer and step 5a checks pass. `menu-weeks-check.ts` (preview weeks) used 1-day periods, now invalid, not rerun. **Not checked in a browser**.
- Still open: next step: advanced settings, favourite and banned recipes. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 6b: « Quotas » tab (v6.111.0)
- Done: tab « Quotas » between « Habitudes » and « Aliments »: `QuotasSettingsPanel`, `QuotaRow`, `QuotaEditor` (kind + value via `HabitTargetField`, « Au moins » / « Au plus », − N + stepper, force). `quotaLogic.ts`: `emptyQuota`, `stepQuotaCount`, `validateQuota`, `MAX_QUOTA_COUNT` moved here. Generic `upsertById` / `removeById` / `setEnabledById` in `collectionUtils.ts` replace the habit-only helpers (consumers updated); `validateHabitTarget` shared. Missing reason icons added: habit (`CalendarClock`) and quota (`Scale`) rendered nothing before (since step 5a), now also in the cell badges.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` checks: habit edit helpers through the generic ones, quota validation (« Au moins 0 » refused, « Au plus 0 » allowed, empty category refused), stepper clamped 0..14; quota engine check unchanged. **Not checked in a browser**.
- To test: add « Poisson · Au moins 2 · Strict » → Régénérer → 2 fish per week with « Quota : … »; « Viande rouge · Au plus 1 · Strict » → at most one per week; a contradiction with a habit → amber warning; disable / edit / delete; reopen → quotas kept; the tab row of 4 pills still fits the settings column (wraps on narrow widths).
- Still open: prorating « au moins » on partial weeks still to confirm by the owner; next step: advanced settings, favourite and banned recipes. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 6a: weekly quotas engine (v6.110.0)
- Done: domain `WeeklyQuota` (`QuotaTarget` = habit targets without « no meal », `QuotaComparator`, `QuotaStrictness`), reason kind `quota`. `quotaLogic.ts`: `weekKeyOf`, `quotaTarget` (partial week prorates « au moins », « au plus » unchanged), `quotaLabel`, `matchesQuota`, `assignQuotaSlots` (random slots per week, one per day first), `quotaScore`. Engine: counts per quota and ISO week (kept / fixed / freezer / chosen), « au moins » slots after the foods to use (strict restricts, preferred +3), strict « au plus » caps once count + later forced slots reach N, preferred −3 beyond; forced slots (only matching recipes, e.g. mandatory habit) are never capped; end-of-run warnings. Settings: `quotas` default `[]`, `restoreQuotas` (integer 0..14, invalid dropped). `MAX_QUOTA_COUNT` = 14.
- Agent's choice to confirm by the owner: prorating « au moins » on a partial week (3 / week over Fri-Sun → 1).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-quotas-check.ts`, 34 recipes, 2 weeks, 100 seeds): fish without quota 0..5 per week → « au moins 3 » strict 3..5, preferred 1..5; red meat « au plus 1 » strict 0..1, preferred 0..4; vegetarian « au moins 5 » strict 5..8; « au moins 1 » lands on 28 / 28 positions over 30 seeds; Fri → Thu targets 1 + 2 respected (50 seeds); 2 red already planned + « au plus 1 » → warning; fish Friday mandatory + fish « au plus 1 » → Fridays stay fish (a first version capped them and left them empty, fixed with the forced-slot look-ahead) + warnings; restore drops invalid quotas. Earlier checks pass. **No UI yet; not checked in a browser**.
- Still open: next step: « Quotas » tab. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 5b: « Habitudes » tab (v6.109.0)
- Done: tab « Habitudes » between « Période et repas » and « Aliments ». `HabitsSettingsPanel` (list, « Ajouter », one rule edited at a time, empty state), `HabitRow` (enable checkbox, target + force, days · meals, edit, delete), `HabitEditor` (days one by one or « Du … au … » range, meals, kind + value, force hidden for « Pas de repas », validation), `HabitTargetField` (protein pills, recipe category select, food search, recipe search), `RecipeSearchInput`. Logic in `habitLogic.ts`: `emptyHabit`, `defaultHabitTarget`, `toggleHabitDay`, `habitDayRange` (wraps over Sunday), `validateHabit`, `upsertHabit`, `removeHabit`, `setHabitEnabled`, `habitSlotsLabel`, `searchHabitRecipes`.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-habit-edit-check.ts`): Lundi → Jeudi = 4 days, Vendredi → Lundi = Fri, Sat, Sun, Mon, single day; toggles; validation messages (no day, no meal, no food); upsert replaces by id, disable, remove. **Not checked in a browser**.
- To test (`npm run dev`, admin): add « Poisson · Vendredi · Déj. + Dîner · Obligatoire » → Régénérer → Friday meals are fish with « Habitude : Poisson · vendredi (obligatoire) »; « Pas de repas » Lun → Jeu déjeuner → cells « Pas de repas », not written by « Ajouter au planning »; edit, disable, delete a rule; a contradiction → empty slot + amber warning; reopen the window → habits kept; the tab content scrolls alone when the list is long, the window does not.
- Still open: next step: weekly quotas. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 5a: habits engine (v6.108.0)
- Done: owner decisions: days picked one by one or as a range (no week / weekend notion), no built-in « fish on Friday » rule, the protein list with « Viande (toute) », two commits (engine, then tab). Domain `HabitRule` / `HabitTarget` / `HabitStrength` / `HabitProtein`, `GeneratedMeal.noMeal`, reason kind `habit`, `RecipeDietProfile` gains red meat / white meat / deli; `GENERATED_SLOT_LABELS` moved to the domain (no logic import cycle; 4 consumers updated). `habitLogic.ts`: `matchesHabitTarget`, `slotHabits`, `respectsStrictHabits`, `habitScore`, `habitLabel`, `formatHabitDays`. Engine: strict habits filter each slot pool (freezer, foods to use and regeneration follow), « no meal » slots skipped, empty slots name the rules + warning; `categoryNames` input (hook from `useCategoriesSnapshot`). Settings: `habits` default `[]`, `restoreHabits` (invalid rules dropped). Cell « Pas de repas ».
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-habits-check.ts`, 18 recipes, 2 weeks): fish mandatory on Friday respected on 50 seeds; + salmon forbidden → never salmon; fish + vegetarian mandatory → empty slots, 2 warnings; no meal Mon → Thu lunch → 8 slots skipped; red meat preferred on Sunday lunch 135 vs 27 without (100 seeds × 2 Sundays); meat avoided on Monday 6 vs 93 (carbonara / beef pasta count as meat); a freezer beef batch never lands on fish Friday (30 seeds); courgette « Au moins 1× » + fish Friday both met (30 seeds); regenerating a Friday meal stays fish; disabled rule ignored; invalid saved rule dropped. Freezer, foods to use and step 5a checks pass (scripts updated). **No UI to create habits yet; not checked in a browser**.
- Still open: next step: « Habitudes » tab. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 4: foods to use (v6.107.0)
- Done: `PreferredFood` (`foodId`, `mode` bonus / atLeastOnce) in the settings (saved, restored with validation). `preferredFoodLogic.ts`: `recipeFoodIds` (food, food group members, bases, cycle-safe), `createFoodIndex` (cache per run), `preferredFoodReason`, `assignPreferredFoods` (one random open slot per food, only where an eligible recipe uses it). Engine: foods already used by kept / fixed / freezer meals are skipped; at the assigned slot « Bonus » scores +2, « Au moins 1× » restricts the pool; coverage tracked meal by meal; `generateMenu` now returns `{ meals, warnings }` (unused strict foods). UI: `FoodSearchInput` extracted from `ExcludedFoodsField`, `PreferredFoodsField` (green rows, mode toggle), « Aliments à utiliser » above « Aliments à éviter » (a food is in one list only), warnings above the grid, `Recycle` reason icon, badge order freezer → preferred → … .
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-preferred-check.ts`, 30 recipes, strict season, October): courgette used in 136 / 200 seeds without setting, 200 / 200 with « Bonus » and with « Au moins 1× »; positions over 30 seeds spread on 13 slots (a first version that gave the bonus everywhere put them on slots 0-1 only, fixed); courgette + chicken at least once → both used, `Utilise : Courgette, Poulet` on the shared recipe; pineapple only in an out-of-season recipe → warning, recipe not used; excluded courgette never used. Freezer and step 5a checks pass (scripts updated for the new settings field and result). **Not checked in a browser**.
- To test: add courgette « Au moins 1× » → one meal uses it, reason « Utilise : Courgette », position changes with « Autre proposition »; a food in no compatible recipe → amber warning; adding a food to « à éviter » removes it from « à utiliser »; settings reopened → the list and modes are kept.
- Still open: next step: habits. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 3: settings saved on the device (v6.106.0)
- Done: `useMenuGeneratorSettingsStore` (Zustand `persist`, `cipe_menu_generator_settings`, version 1); `SavedGeneratorSettings` (settings without dates + `periodDays`); `toSavedSettings`, `restoreGeneratorSettings` (start = selected day, saved length clamped 1..14, field-by-field fallback to defaults). The modal saves on every change and restores on opening; « Réinitialiser » (defaults + clear) with « Réglages gardés sur cet appareil ». Docs: architecture (storage keys, stores), spec-planning, D-036.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-settings-restore-check.ts`): 10-day dinner-only vegetarian strict settings restored on another start day (23 oct. → 1 nov.); `null` → defaults; garbage (99 days, unknown slot / diet, number in the food ids, string boolean) → 14 days, defaults, the valid id kept; an old shape with only `diet` → defaults + that diet. **Not checked in a browser**.
- To test: change settings, close, reopen → same settings, period starting on the selected day with the same length; reload the page → still there; « Réinitialiser » → defaults, and after reopening too.
- Still open: next step: foods to use (bonus / at least once). Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2, step 2: full-screen window without scroll (v6.105.0)
- Done: `MenuGeneratorModal` rebuilt: near full screen (`92dvh`, max 1600 px, full screen on mobile), settings left (tabs « Période et repas » / « Aliments », `GeneralSettingsPanel`, `FoodsSettingsPanel`, `SettingsSection`; only the tab content may scroll), « Générer » / « Régénérer » under them, preview right filling the height (`GeneratorWeekGrid` rows stretch, `xl:` larger text), actions under the preview; stale notice when the settings changed since the run (`sameGeneratorSettings`); empty state before the first run; mobile « Réglages » / « Aperçu » pills; tablet portrait stacked. The « Réglages » back button and the hook's `reset` are gone (no consumer left).
- Numbers: `npx tsc -b` + `npm run lint` pass. **Not checked in a browser** (layout only: to test with `npm run dev`).
- To test: 1920×1080 and 1366×768: no scroll in the window with lunch + dinner, the grid fills the height; 2-week period: week pills; change a setting after a run → amber notice, « Régénérer » applies it; mobile width: pills switch views, « Générer » jumps to « Aperçu »; tablet portrait 820×1180: settings on top, grid below; dark mode.
- Still open: next step: settings saved on the device. Step 6 (`bulk-items`) still not pushable before the API confirms prod.

## 2026-10-17 — Menu generator settings V2 (D-036), step 1: freezer spread (v6.104.1)
- Done: owner feedback on the V1 → D-036 (habits, weekly quotas, foods to use bonus / at least once, advanced settings, settings saved on the device, full-screen window without scroll; leftovers and setting sets later). Step 1: freezer meals no longer come first: `reserveFreezerSlots` (seeded random open slot per available meal, slot filters respected, ≥ 3 meals between two uses, no same category adjacent or same day), reasons numbered chronologically; `takeFreezerMeal` removed; setting `freezerFirst` → `useFreezer` (« Utiliser les plats du congélateur »). `generateMenu` rewritten around a slot sequence (kept → fixed → freezer reservation → scored pick); scoring penalises the same category as the next known meal (`nextCategoryId`).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-freezer-spread-check.ts`): seeds 1 / 2 / 3 / 42 place the freezer meals at different positions (e.g. 0, 8, 11, 13 vs 4, 8, 9, 13); r10 7 portions / household of 2 → 3 meals, r12 → 1, r11 (1 portion) → 0; r10 gaps ≥ 3; 0 same category in a row; checkbox off → none. Step 5a check passes; the old step 2 script (`menu-engine-check.ts`) no longer runs (outdated engine input), not used. **Not checked in a browser**.
- Still open: the step 6 commit (`bulk-items`) must not be pushed before the API confirms prod; next step: full-screen window without scroll.

## 2026-10-17 — Menu generator, step 6: write to the planning (v6.104.0, not pushable yet)
- Done: owner decisions: one atomic API call rather than ~56 `saveSlot` calls (option B), no confirmation, then the Planning on the period start. API session built `POST /planning-slots/bulk-items` (real dev payloads received 2026-10-17, contract in `docs/api.md`, **not live in prod**). D-035 updated. Domain `PlanningItemEntry`, `BulkPlanningResult`; `planningApiMapper.buildBulkItemsPayload` (`onConflict: "skip"`), `planningService.bulkAddPlanningItems` (Dexie `bulkPut` of every returned slot, skipped ones included); `menuWriteLogic.ts` (`plannedEntries`, `menuWriteMessage`); `useMenuGenerator.write` (`withPending` `menu-generator-write`); modal: « Ajouter au planning (N) » primary, « Autre proposition » secondary (icon only on mobile); `PlanningModule.handleMenuAdded` (close, navigate to the start week / day, info notification).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-write-check.ts`): kept and empty meals left out, French day names and ISO weeks across W43 / W44, messages singular / plural. **Not run against the API, not checked in a browser.**
- To test once the API is live (dev API first with `npm run dev`, admin): 2-week proposal → « Ajouter au planning » → one request in devtools, modal closed, Planning on the start week, notification count right; a slot filled on another device between preview and write → « 1 créneau déjà rempli… » and that slot shows the other device's dish; a slot with only a dessert → the dish is added, the dessert kept; reload → everything is there (round trip).
- Still open: **do not push before the API session confirms `bulk-items` in prod**; D-035 UX « offer to set the shopping days when the period has ≤ 10 days » not done; owner validation before opening to everyone.

## 2026-10-17 — Menu generator, step 5c: kcal per day (v6.103.0)
- Done: owner's format validated (2026-10-17). `menuPreviewLogic.dayKcalSummary` (kcal per portion of the chosen meals, kept slots count their planned recipes, target = profile kcal × sum of `KCAL_SLOT_SHARE` of the chosen meals, `onTarget` within `KCAL_TOLERANCE`). `DayKcalBadge` (green / orange / grey, « — » without data); « kcal » row in `GeneratorWeekGrid`, line under the day in `GeneratorDayList`. Spec `docs/spec-planning.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-kcal-check.ts`): 700 + 600 vs 2000 → 1300 / 1300 on target; kept lunch (300 + 250) + dinner 700 → 1250 / 1300; lunch only 600 → target 700, on target (14 %); nothing known and no target → « — ». **Not checked in a browser**.
- To test: the kcal row matches the cells; regenerate / reshuffle updates it; a profile without a kcal target shows only the total in grey; only lunch chosen → target 35 %.
- Still open: next step: write the proposal to the planning (API batch write path, to look at in `docs/spec-planning.md` § batch writes).

## 2026-10-17 — Menu generator, step 5b: preview as a week grid (v6.102.0)
- Done: owner feedback: the scrolling list made weeks and days hard to identify. Owner choices: week grid like the Planning, reason icons with the detail on click. Reasons typed (`MealReason` `kind` + `label`) in `mealScoreLogic`, `freezerPlanLogic`, `menuEngineLogic` (labels unchanged). `menuPreviewLogic.ts`: `previewWeeks` (ISO weeks, 7 columns, `inPeriod`), `mealsByKey`, `reasonBadges` (max 2); `groupMealsByDay` removed (no consumer left). `dateUtils.formatWeekdayShort` (« Ven. 23 »). Components: `GeneratorWeekGrid` (sm and up), `GeneratorDayList` (mobile), `GeneratedMealCell`, `GeneratedMealDetail`, `MealReasonIcon`; `GeneratorPreview` holds the chosen week, the mobile day and the selected meal; modal `max-w-5xl` on the preview. Spec `docs/spec-planning.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check (`_claude/tmp/menu-weeks-check.ts`): 23 → 29 oct. = S43 (Fri-Sun) + S44 (Mon-Thu), 25 déc. 2026 → 3 janv. 2027 = S52 + S53, single day = 1 week; step 5a check still passes. **Not checked in a browser**.
- To test (`npm run dev`, admin): one-week period → no week pills, 7 columns, days outside the period greyed; 2-week period → pills switch the grid; no scroll on desktop with lunch + dinner; click a cell → orange ring + detail under the grid; lock / regenerate still work and keep the selection; mobile width → day pills; tablet portrait 820×1180; dark mode (locked cell, greyed days).
- Still open: step 5c kcal per day (row under the grid), then the write.

## 2026-10-17 — Menu generator, step 5a: lock and regenerate one meal (v6.101.0)
- Done: owner decisions: regenerating a meal leaves every other meal as it is; no manual recipe replacement in the generator (the household removes an unwanted meal in the planning). Engine: `locked` replaced by `fixed` (meals re-emitted with their own reasons, counted as used and against the freezer stock; « Gardée par toi » removed) and `rejected` (per key, also for the freezer pick). `menuPreviewLogic.ts`: `toggleMealLock`, `lockedMealsByKey`, `mealsAroundByKey`, `rejectedForMeal`. `useMenuGenerator`: context loaded once (`loadGeneratorContext`) and kept in the run; `reshuffle`, `regenerateMeal`, `toggleLock` are local (no request, no pending). `GeneratorPreview`: lock / unlock and « Proposer une autre recette » per meal. Spec `docs/spec-planning.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; throwaway `tsx` check (`_claude/tmp/menu-actions-check.ts`, 30 synthetic recipes): 2 locked meals kept with their reasons after a reshuffle, no duplicate; regenerating slot 3 changes only slot 3, to a recipe used nowhere else; a 1-recipe catalogue gives « Aucune autre recette ne respecte les filtres »; a freezer batch of 4 portions (household of 2) stays used twice after regenerating another slot. **Not checked in a browser** (to test with `npm run dev` as an admin).
- To test: lock 2 meals then « Autre proposition » → they stay, orange; regenerate one meal → only that one changes; the regenerate button is disabled on a locked meal; « Déjà prévu » has no buttons; « Réglages » then « Générer » → no lock left; no network request on « Autre proposition » (devtools).
- Still open: step 5b kcal per day; then the write. Recipe Builder data fixes by the owner and the apéritif decision (see 2026-10-16).

## 2026-10-17 — Food seasons: all year shown as 12 checked months (v6.100.3)
- Done: owner's request: « Toute l'année » is now shown with the 12 months checked (was: none checked). Storage unchanged (`[]` = all year, API D-055 contract). `seasonLogic.ts`: `ALL_MONTHS`, `checkedMonths` (`[]` → 12 months), `toggleMonth` works on the checked months and ignores unchecking the last one. `SeasonMonthsField` hint = the season only (« Toute l'année » or the ranges). Spec `docs/spec-admin.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (Dashboard › Aliments: an all-year food shows 12 green months; unchecking one gives 11 months; checking the 12th back gives « Toute l'année »; the last month cannot be unchecked; « Toute l'année » re-checks everything).
- Still open: same as 2026-10-16 (Recipe Builder data fixes by the owner, apéritif decision, menu generator step 5).

## 2026-10-16 — Meal types review applied in prod (v6.100.2)
- Done: owner's per-recipe review (`meal-types-review.html`, local) exported 168 changes; front check of the API dry-run (same counts, 57 desserts of which 55 lose lunch / dinner, intended); API `import:recipe-meal-types --apply` in prod, one transaction, 0 errors, 0 mismatch. Recount over 685 dishes: breakfast 172, lunch 509, dinner 507, snack 176, none empty. Rule written in `docs/spec-recipes.md` (meal types vs dessert). Docs only.
- Numbers: no code change; `npx tsc -b` + `npm run lint` pass.
- Still open: Recipe Builder fixes by the owner: untick « dessert » on savory dishes (base-046, pat-061, pat-077, pat-080, pat-081, pc-066, pc-067; pc-067 is lunch / dinner but ignored by the generator while flagged dessert), recategorize base-043, base-047, base-049 (and base-046); apéritif decision (category « Apéritifs » and / or planning slot, options A / B / C given to the owner); vm-011 category; unit weights fs-002, ha-008, pl-023. Menu generator resumes: step 5 preview actions.

## 2026-10-16 — Recipe Builder: no default meal types (v6.100.1)
- Done: a new draft starts with no meal type checked (was lunch + dinner); the existing validation already makes at least one mandatory for a non-base recipe. Context: the API data audit (2026-10-16, read-only) showed 668 of 685 dishes with lunch, pastries and cereal products included, inherited from the old default; the menu generator relies on meal types. Spec `docs/spec-recipes.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (« Nouvelle recette »: no chip selected, save without one → « Sélectionne au moins un type de repas. »).
- Still open: per-recipe meal types review: API export `recipes-meal-types.json` → pre-filled proposal + local HTML review page (front) → owner review → API `import:recipe-meal-types` dry-run → `--apply`. Data fixes from the audit pending the owner's answers: vm-011 « Protéines de soja texturées » filed as meat (target ingredient category to choose, API script for the food and the recipe ingredient rows), 4 `base-*` dishes in the « Bases » category (base-043, base-046, base-047, base-049), 3 foods used per piece / portion without unit weight (fs-002, ha-008, pl-023). Menu generator paused until meal types are clean.

## 2026-10-16 — Menu generator, step 4: settings window and preview (v6.100.0)
- Done: « Générer » button in the Planning header (admins only, `useIsAdmin`), `MenuGeneratorModal` with `GeneratorSettingsForm` (period, meals, diet, season, excluded foods, freezer first), `ChoicePills`, `ExcludedFoodsField`, read-only `GeneratorPreview` (per day, reasons, kept slots « Déjà prévu »), « Autre proposition » (new seed) and « Réglages ». Logic `generatorSettingsLogic.ts` (`defaultGeneratorSettings`, `validateGeneratorSettings`, toggles, `existingMealsByKey`) and `menuPreviewLogic.ts` (`groupMealsByDay`, `countGeneratedMeals`). Hook `useMenuGenerator` loads the period weeks, history, freezer and profile, then runs `generateMenu`. Spec `docs/spec-planning.md` § Menu generator.
- Numbers: `npx tsc -b` + `npm run lint` pass; **not checked in a browser** (to test with `npm run dev` as an admin).
- To test: the button only for an admin; default period = selected day + 6 days; errors (end before start, 15 days, no meal); diet / season / excluded food change the proposal; a filled lunch shows « Déjà prévu »; a freezer batch shows « Au congélateur … »; « Autre proposition » changes the menu; nothing is written to the planning.
- Still open: API data quality report; next step: preview actions.

## 2026-10-16 — Menu generator, step 3: freezer batch portions first (v6.99.5)
- Done: `freezerBatchStocks` (`core/logic/freezer/freezerStockLogic.ts`): batch items with portions > 0 grouped by recipe code, portions summed, oldest `addedDate` kept, sorted oldest first. `core/logic/menuGenerator/freezerPlanLogic.ts`: `createFreezerPlan` (meals available = ⌊portions / household size⌋, minus the times the recipe is already planned in the period), `takeFreezerMeal` (oldest batch first, only if the recipe passes the slot filters (meal type, diet, exclusions; season ignored, it is already cooked), not the same category as the previous meal nor already that day, at least 3 meals since its last use). Settings gain `freezerFirst`; `generateMenu` tries the freezer before the scored pick, reason « Au congélateur : N portions utilisées, M restantes ». The freezer stock itself is not changed by the generator (the household updates it when eating, as today).
- Numbers: `npx tsc -b` + `npm run lint` pass; `tsx` check: stocks r11 1 portion (07-01), r10 4 + 3 portions (08-01, 09-01), r12 2 portions (10-01), household of 2 → r11 skipped (1 portion < 2), r10 placed 3 times spaced out, r12 once; freezer off → no freezer meal; r10 already planned once → placed 2 more times only.
- Still open: API data quality report; next step: settings window (admin only).

## 2026-10-16 — Menu generator, step 2: seeded engine and scoring (v6.99.4)
- Done: `core/utils/randomUtils.ts` (`createSeededRandom` mulberry32, `pickRandom`, `newSeed`). Domain: `KCAL_SLOT_SHARE` (lunch 0.35, dinner 0.3), `KCAL_TOLERANCE` 0.15, `RECENT_HISTORY_WEEKS` 3, `GeneratedMeal` (`key` = `date:slot`, `kept` = slot already filled in the planning, `locked`, `reasons`). `mealScoreLogic.ts` `scoreCandidate`: season (preferred / strict: +1 « De saison », −2 « Hors saison : … »), history (never +0.5, ≤ 1 week −4, < 3 weeks −2, else +1), kcal per portion vs `slotKcalTarget` (within ±15 % +2, else down to −4), variety (same category as the previous meal −3, already that day −1). `menuEngineLogic.ts` `generateMenu`: chronological fill (day, then lunch, dinner), filled slots kept, locked picks kept, no duplicate with the period nor with already planned recipes (falls back to repeating, with a reason), random pick among candidates within 1 point of the best score, a reason list per meal; `weeksSinceEatenMap` from `recipe-usage`.
- Numbers: `npx tsc -b` + `npm run lint` pass; checked with a throwaway `tsx` script on 30 synthetic recipes over 7 days: same seed → same menu, another seed → another menu, no duplicate, the planned recipe not reused, the locked one kept, 0 consecutive meals of the same category, October menu without tomato recipes (seed 42), kcal near 700 / 600 for a 2000 kcal target, a 2-recipe catalogue repeats with « Répétée faute d'autre recette », strict season with no in-season recipe → « Aucune recette ne respecte les filtres ». Not tested on the real catalogue yet (needs the UI).
- Still open: API data quality report; next step: freezer batch portions first.

## 2026-10-16 — Menu generator, step 1: candidates and hard filters (v6.99.3)
- Done: owner decisions recorded (D-035: front-only engine, free period ≤ 14 days, lunch + dinner, keep filled slots, kcal of the active profile 35 % / 30 % ±15 %, admin only on `master` until validated, no food tags). `core/domain/menuGenerator.ts` (settings, `PeriodDay`, `MAX_GENERATION_DAYS`). `core/logic/menuGenerator/periodLogic.ts`: `validatePeriod`, `buildPeriodDays` (ISO week-year, French day name, month), `periodWeeks`. `candidateLogic.ts`: `isGeneratableDish` (dish, not dessert / outdoor, meal type), `recipeDietProfile` (meat / fish from ingredient and recipe categories, bases included, cycle-safe), `matchesDiet`, `usesExcludedFood` (group ingredient excluded only when its whole family is), `slotCandidates`, `seasonAllows` / `dayCandidates` (strict season only; « preferred » is for scoring).
- Numbers: `npx tsc -b` + `npm run lint` pass; checked with a throwaway `tsx` script (carbonara with a lardons base → meat; pescatarian keeps tuna, vegetarian keeps only the cheese pasta; excluding comté alone keeps the cheese pasta, excluding the whole family removes it; strict May drops the tomato dish; period 2026-12-25 → 2027-01-03 = 10 days over 2026-W52 / W53; period errors). No UI yet.
- Still open: API data quality report; next step: engine (seeded fill + scoring).

## 2026-10-16 — Food seasons, step 2: recipe season logic (v6.99.2)
- Done: `core/logic/season/recipeSeasonLogic.ts`: `recipeSeasonalFoods` (seasonal foods of a recipe, bases included, cycle-safe), `isFoodInSeason`, `outOfSeasonFoods`, `isRecipeInSeason`, `recipeSeasonMonths`; catalogue as a parameter (`SeasonCatalogue`). No UI consumer yet (menu generator later). Spec `docs/spec-recipes.md` § Recipe season, roadmap.
- Numbers: `npx tsc -b` + `npm run lint` pass; checked with a throwaway `tsx` script (ratatouille courgette + base sauce tomate/oignon with a base cycle → in season June-September, out in May because of « Tomates »; velouté potiron + oignon → January, September-December; a recipe with only all-year foods → 12 months).
- Still open: menu generator decisions pending (owner): V1 filters, data additions (e.g. food tags such as pork / gluten), data quality check by the API session.

## 2026-10-16 — API D-054 and D-055 live, food seasons imported (v6.99.1)
- Done: the API session confirmed D-054 (custom shopping categories) and D-055 (food seasons) in prod (migrations applied 2026-10-16 13:54 UTC, `CHECK`s present). Before that, the prod front (v6.95.0+) showed custom aisle management against an API without the route (404). Seasons: prod dry-run checked line by line against the validated file, then `--apply` with the owner's go: 70 foods written, 0 mismatch. `docs/api.md`: food seasons moved from « Planned » to « Catalogue writes »; D-034 and roadmap updated.
- Still open: owner checks in the app (Dashboard › Aliments « De saison » = 70 foods; « Ordre des rayons »: create a custom aisle); authenticated API checks not run (no prod demo account, owner's choice). Next front step: recipe season logic for the menu generator.

## 2026-10-16 — Food seasons, step 1: months in the Dashboard (v6.99.0)
- Done: `Food.months?` / `FoodInput.months?` (D-034, API D-055). `core/logic/season/seasonLogic.ts`: `normalizeMonths` (sorted, 12 → `[]` like the API), `toggleMonth`, `sameMonths`, `formatMonths` (ranges across the year end, « Toute l'année »), `hasSeason`. Food form « Saison » (`SeasonMonthsField`), recap line, `months` sent only when changed. Foods list: season next to the category, filter « Tous / De saison / F&L toute l'année » (`foodTableLogic.ts`). Season data: ADEME-based file validated by the owner (94 foods, 70 seasonal), dev dry-run OK (70 changes, 24 unchanged, 0 unknown). Docs: decisions D-034, api (Planned), spec-admin.
- Numbers: `npx tsc -b` + `npm run lint` pass; `formatMonths` checked with a throwaway `tsx` script (« sept. → févr. », « avr., juin → nov. », 12 months → « Toute l'année »); not checked in a browser. **Depends on API D-055 (not deployed)** to store a season; editing a food without touching the season is unchanged on the current prod API.
- Still open: owner pushes the API (D-054 + D-055, neither applied in prod on 2026-10-16 13:34 UTC; the prod front already exposes custom aisle management, which gets 404 until then) → prod dry-run of the seasons import → owner's go → `--apply`. Next front step: recipe season logic for the generator.

## 2026-10-16 — Per-profile default per food family (v6.98.0)
- Done: « Préférences par famille » section in « Profils du foyer » (`FoodGroupDefaultsSection`, `FoodGroupDefaultSelect`, `shared/components/ui/profiles/`): every family with foods × every profile, select « Défaut de la recette » or a food of the family, saved on change. `profileService` `setProfileFoodGroupDefaultApi` / `deleteProfileFoodGroupDefaultApi`, `useProfileStore.setFoodGroupDefault` (API first), logic `foodGroupsWithFoods`, `findFoodGroupDefault`, `withoutFoodGroupDefault`. The modal body now scrolls (`max-h-[90dvh]`). Docs: spec-accounts, spec-planning, roadmap.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. API endpoints already live (D-052, 2026-10-15).
- Still open: none; tested and in prod (owner, 2026-10-16), #25 closed. Waiting for user feedback on food groups and aisles.

## 2026-10-16 — Shopping aisles live in prod (v6.97.1)
- Done: the owner confirmed API D-053 + D-054 and the front (up to v6.97.0) in prod. `docs/api.md`: custom shopping categories moved from « Planned » to « Shopping and household » (live); roadmap focus item 2 closed.
- Still open: user feedback on aisles and on food groups; UI for the per-profile food-group default (`PUT /profiles/:id/food-group-defaults/:groupId`, #25).

## 2026-10-16 — Custom aisles, step 3: aisle in the extra form (v6.97.0)

- Done: `AddExtraModal` « Rayon » select lists the household's aisles in path order (shared + custom « · perso »); `extraAisleId` / `extraAisleFields` (`shoppingCategoryOrderLogic.ts`) map the choice to `categoryId` or `customShoppingCategoryId` (exclusive); picking a catalogue food still selects its shared category. `ExtraInput.customShoppingCategoryId`. Spec `docs/spec-shopping.md`, roadmap focus.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. Depends on API D-054 (not deployed) for custom aisles; shared-only use is unchanged against the current prod API.
- Resume here: API session confirmation of D-054 in prod → owner's tests (custom aisle on an extra, switch custom ↔ shared, delete the aisle) → push `master`.

## 2026-10-16 — Custom aisles, step 2: manage aisles in the window (v6.96.0)

- Done: `customShoppingCategoryService` (create / rename / delete) and store actions (API first, no optimistic update); « Ordre des rayons » window: `AddAisleForm` (cap 30, `MAX_CUSTOM_SHOPPING_CATEGORIES`), inline rename on tap, delete with `ConfirmActionModal` (extras to « Autres »), « perso » badge; the draft order is now a list of ids (`shoppingAisleOrderPayload` takes ids and drops unknown ones). Spec `docs/spec-shopping.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. **Depends on API D-054 (not deployed)** — do not push before the API session confirms prod.
- To test (local API with D-054): create (Enter and ＋), duplicate label in another case (409 toast), 30 limit, rename (Enter, blur, Escape), delete then check an extra of that aisle in « Autres », reorder with a custom aisle and save, reload.
- Still open: step 3 (aisle choice in the extra form).

## 2026-10-16 — Custom aisles, step 1: read and group (v6.95.0)

- Done: API D-053 live in prod (contract moved to `docs/api.md` § Shopping and household); D-054 (custom categories) recorded in § Planned (captured in dev, **not deployed**). Front: `CustomShoppingCategory`, `ShoppingAisle` (shared | custom), `useCustomShoppingCategoryStore` filled from `/bootstrap` (`customShoppingCategories ?? []`); `resolveShoppingAisles` / `defaultShoppingAisles` / `shoppingAisleOrderPayload` / `moveShoppingAisle` replace the category-only helpers; grouping by aisle (`IngredientGroup.key`, extras with `customShoppingCategoryId` under their aisle); « Ordre des rayons » window lists custom aisles too. Spec `docs/spec-shopping.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; resolution checked with a throwaway `tsx` script (default with customs at the end, saved order with a custom first and an unknown id, default payload `null`); not checked in a browser. Nothing changes against the current prod API (no custom category yet).
- Still open: step 2 (create / rename / delete aisles in the window), step 3 (aisle choice in the extra form).

## 2026-10-16 — Shopping category order, step 2: « Ordre des rayons » window (v6.94.0)

- Done: `CategoryOrderModal` + `SortableCategoryRow` (`@dnd-kit/sortable`, grip handle, ↑ ↓, position numbers), « Ordre par défaut », save through `PUT /me` (`null` when default), user updated from the response. Toolbar button (`ListOrdered`, ingredients view). Pure helpers `moveShoppingCategory`, `shoppingCategoryOrderPayload`. `@dnd-kit/utilities` is only transitive, so the row builds its `translate3d` itself. Spec `docs/spec-shopping.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. **Depends on API D-053 (not deployed)**: saving against the current prod API is expected to fail (unknown field or ignored) — do not push before the API session confirms prod.
- To test: reorder by drag (mouse, touch on phone), by ↑ ↓, reset, save, reload (order kept, list follows it on phone), a second device sees the same order; demo account.

## 2026-10-16 — Shopping category order, step 1: read and apply (v6.93.0)

- Done: API D-053 contract recorded in `docs/api.md` § Planned (captured in dev, **not deployed**); « Inconnu » confirmed deleted in prod. `AuthUser` / `UpdateMeInput.shoppingCategoryOrder`; `core/logic/shopping/shoppingCategoryOrderLogic.ts` (`DEFAULT_SHOPPING_CATEGORY_ORDER` moved from `shoppingGrouping.ts`, `resolveShoppingCategoryOrder`, `toShoppingCategoryOrderSlugs`, `isDefaultShoppingCategoryOrder`); `groupIngredients` / `filterGroupedIngredients` take the order; `ShoppingModule` resolves it from the user. Absent field (current prod API) = default order, so nothing changes until the API ships. Spec `docs/spec-shopping.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; resolution checked with a throwaway `tsx` script (default, partial with duplicate and unknown slug, empty list); not checked in a browser.
- Still open: step 2 (« Rayons » window: sortable list, ↑ ↓, reset, save via `PUT /me`).

## 2026-10-16 — Dependency: `@dnd-kit/sortable` (v6.92.3)

- Done: `@dnd-kit/sortable@10.0.0` added (owner's go; peer `@dnd-kit/core ^6.3.0`, we have 6.3.1, deduped) for the « Rayons » order window of the shopping list (not coded yet, waiting for API step (a) `shoppingCategoryOrder`). Owner's answers: « Articles du quotidien » and « Autres » stay apart, at the end, outside the order.
- Numbers: `npx tsc -b` + `npm run lint` pass. `npm audit` reports 15 pre-existing vulnerabilities (vite, esbuild, react-router, postcss, …), none from `@dnd-kit` — not addressed here.

## 2026-10-16 — Ingredient category « Inconnu » removed from the front (v6.92.2)

- Done: owner's decision, « Inconnu » is not a store aisle. API session read-only check: 0 food, 0 recipe ingredient, 0 shopping extra use `unknown`. Front: `IngredientCategory.UNKNOWN` and its slug removed; a new food starts with « À définir » (mandatory, `validateFoodForm`); no more `?? UNKNOWN` fallbacks; recipe cards append any category missing from their order instead of dropping it. Shopping order and recipe card order lose « Inconnu ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: delete the category API-side (`DELETE /ingredient-categories/unknown`, no front UI — D-014; API session or curl). Shopping category order feature: API step (a) waiting for the owner's go; front waiting for the owner's answers (`@dnd-kit/sortable@10.0.0`, « Articles du quotidien » / « Autres » kept last in V1).

## 2026-10-15 — Food groups in prod (v6.92.1)

- Done: owner deployed API D-052 (+ quantity addition) and pushed the front (steps 1-7). `docs/api.md`: contract moved from « Planned » to its own section; D-033 status and roadmap updated.
- Resume here: owner's feedback on the feature in use. Not started: UI for the profile default per family (`PUT /profiles/:id/food-group-defaults/:groupId`).

## 2026-10-15 — Food groups, step 7: journal per profile (v6.92.0)

- Done: `personalizeRecipe` (recipe with the active profile's resolved food and quantity per portion for each ingredient au choix); `computeItemMacros` / `computeSlotMacros` / `computeDayMacros` / `computeWeekAverage` take the profile (meal choices read from `slot.foodChoices`); Journal day, slot cards, week average and `RecipePortionRow` use it; `useJournalStore` actions now receive the (personalized) recipe instead of reading `recipesCatalogue`. Spec `docs/spec-journal.md`, `docs/architecture.md` (exception list).
- Numbers: `npx tsc -b` + `npm run lint` pass; macros checked with a throwaway `tsx` script (per portion: comté default 470 kcal, mozzarella 60 g 500 kcal, mozzarella without quantity 425 kcal); not checked in a browser. Depends on API D-052 (not deployed).
- Known limit: per-day ingredient overrides saved before a choice keep their grams (reset the ingredient to take the choice quantity).
- Resume here: API deployment confirmation → owner's end-to-end test (create « Fromages », members, recipe au choix, planning choices with quantities, shopping, journal per profile) → push `master`. Not started: UI for the profile default per family.

## 2026-10-15 — Food groups, step 6: shopping list (v6.91.0)

- Done: `splitGroupIngredient` shares the parts of an ingredient au choix equally between profiles, each with its resolved food and quantity per portion; `aggregateSlots` turns each share into a line of that food (merged with the same food elsewhere), « à préciser » when resolved by the recipe default (`ConsolidatedIngredient.toSpecify`: badge + clipboard), profile names on the sources. `ShoppingCatalogue` gains `foods` and `profiles`. Spec `docs/spec-shopping.md` § Ingredients « au choix ».
- Numbers: `npx tsc -b` + `npm run lint` pass; split checked with a throwaway `tsx` script on the D-033 example (mozzarella 120 g + comté 60 g; no choice → one « à préciser » line of 120 g; profile default → chèvre 60 g + default 60 g); not checked in a browser. Depends on API D-052 (not deployed).
- Still open: step 7 (journal macros per profile).

## 2026-10-15 — Food groups, step 5b: quantity per profile (v6.90.0)

- Done: owner's addition to D-033 (30 g of comté ≠ 30 g of mozzarella): optional quantity per portion on each meal choice (`FoodChoice.quantity`, API migration `20261015140000_add_food_choice_quantity`, contract in `docs/api.md`). `FoodChoiceModal` gets a « g / pers. » field per profile (enabled once a food is chosen, placeholder = recipe quantity per portion); `setMealFoodQuantity`, `recipeQuantityPerPortion`, `ResolvedFood.quantityPerPortion`; the quantity is part of the choice comparison, so changing it alone sends `update[].foodChoices`. API also answered: `PUT /recipes/:id` keeps an ingredient's group when the field is absent (old prod front safe).
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. Depends on API D-052 + quantity addition (not deployed).
- Still open: step 6 (shopping), step 7 (journal).

## 2026-10-15 — Food groups, step 5: per-profile choice on a planned meal (v6.89.0)

- Done: `FoodChoiceModal` (select per ingredient au choix × profile, fallback shown with its source), opened from « Ingrédients au choix » in the « ⋯ » menu (dish, breakfast/snack, grid cell, dessert) and from `FoodChoiceBadge` on a dish (« à préciser » / complete). Choices written through the existing slot diff and batch (`add[].foodChoices`, `update[].foodChoices` only when changed), carried on copy and drag & drop, dropped with a replaced dish. Pure helpers in `core/logic/foodGroup/foodChoiceLogic.ts`; hook `useGroupIngredients`. Spec `docs/spec-planning.md` § Ingredients « au choix ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. Depends on API D-052 (not deployed): `foodChoices` is only sent once a choice exists, so the current prod API is unaffected until someone chooses.
- To test (local API with D-052): choose per profile, save, reload (choices back from the API); badge states; copy a meal with choices; drag A→B and swap; replace the dish (choices gone, desserts' kept); dessert with an ingredient au choix.
- Still open: step 6 (shopping list: pro rata split by resolved food, « à préciser »).

## 2026-10-15 — Planning: meal actions menu (v6.88.0)

- Done: step 4 of D-033. Every planned item (dish, breakfast/snack recipe, grid cell, dessert) now groups its actions in one « ⋯ » menu (`ItemActionsMenu` on `FloatingMenu`) instead of 2 to 4 corner buttons; badges (persons / grams, freezer) stay visible; drag handle unchanged. No behaviour change, the bottom-left corner of the dish is now free for the food choice badge. Spec `docs/spec-planning.md` § Meal actions menu.
- Numbers: `npx tsc -b` + `npm run lint` pass; **not checked in a browser** — owner to test with `npm run dev` (desktop hover, touch, dark mode, tablet portrait; menu must not start a drag nor open the recipe; copy / add / shopping selection modes hide it).
- Still open: step 5 (per-profile food choice on a planned meal).

## 2026-10-15 — Food groups, step 3: Recipe Builder (v6.87.0)

- Done: ingredient « au choix » in the Recipe Builder (`IngredientChoiceToggle`, shown when the linked food belongs to a family; desktop row, mobile drawer, mobile card badge); `DraftIngredient.foodGroupId`, loaded by `recipeToBuilderState`, sent by `builderStateToApiBody` (`ApiIngredientInput.foodGroupId`); `applyFoodPick` takes the picked `Food` and keeps the family only within the same family; base recipes refused by `validateBuilderState`. « (au choix) » on recipe cards, « au choix » in the nutrition calculator. Spec `docs/spec-recipes.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. Depends on API D-052 (not deployed): `foodGroupId` is sent on every recipe save.
- Still open: step 4 (meal slot UI rework in the planning, mock-up first).

## 2026-10-15 — Food groups, step 2: Dashboard (v6.86.0)

- Done: « Familles » section in the Dashboard data panel (list with member count, create with a slug id suggested from the name, rename, delete with confirmation); « Famille » select on the food form (`FoodInput.groupId`, recap entry), family shown in the foods list. `syncCatalogueFromApi` now also fetches `/food-groups`. Spec `docs/spec-admin.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser. **Depends on API D-052 (not deployed)**: against the current prod API, the catalogue sync fails on `/food-groups` (404) — test only against an API that has D-052 (local API), never push before the API session confirms prod.
- Still open: step 3 (Recipe Builder: group ingredient with its default food, recipe detail display).

## 2026-10-15 — Food groups, step 1: read layer (v6.85.0)

- Done: API contract of food groups and per-profile choices (API D-052, captured in dev, **not deployed**) recorded in `docs/api.md` § Planned. Front read layer: `FoodGroup` / `FoodGroupDefault` / `FoodChoice` (`core/domain/foodGroup.ts`); `Food.groupId`, `Ingredient.foodGroupId`, `Profile.foodGroupDefaults`, `MealSlot.foodChoices` (per recipe code, like `recipePersons`) read by the API mappers, absent fields treated as empty; food groups catalogue (`core/catalogue/foodGroups.ts`, scope `foodGroups`, `useFoodGroupsSnapshot`) filled from `/bootstrap` only, cached in Dexie v14 (`foodGroups` table); `resolveIngredientFood` (`core/logic/foodGroup/foodChoiceLogic.ts`): meal choice → profile default → recipe default. No new route called, no UI change.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (nothing visible).
- Owner: commit without pushing `master` until the API session confirms D-052 is live in prod.
- Still open: step 2 (Dashboard: food groups CRUD + « Famille » on the food form), which will also fetch `/food-groups` in `syncCatalogueFromApi` (step 1 keeps the current groups there).

## 2026-10-15 — Food groups and per-profile choices: design (v6.84.5)

- Done: user feedback (« Pâtes au fromage » too generic) turned into D-033 with the owner: food groups, group ingredient with a recipe default, profile default per group, choice per profile on the planned meal, pro rata split in shopping, journal per profile. Tracked as `dev/issues.json` #25. API prompt written for the owner to relay.
- Resume here: real payloads from the API session, then front step 1 (read layer).
- Still open: interpretation of « le choix par défaut peut être défini par un user » as a per-profile default per group, to confirm by the owner.

## 2026-10-15 — Owner tests validated, priorities reset (v6.84.4)

- Done: owner reports all browser tests of the changes up to v6.84.3 as passed (2026-10-08 and 2026-10-10 lists). Roadmap updated with the owner's decisions: P5 tablet pass paused (no longer a priority); unexpected logouts considered fixed (no recurrence); Google sign-in (#10) set aside; menu generator stays for later. Also: `_private` deny rules moved from the versioned `.claude/settings.json` to the owner's user-level settings after the folder rename (`Développement` → `Developpement`).
- Resume here: the owner's new ideas preparing the profile tastes feature (#20-#24).
- Still open: API demo seeding week fix deployment (from 2026-10-08), not re-confirmed.

## 2026-10-10 — Session end (v6.84.3)

- Done this session (v6.83.0 → 6.84.2): Recipe Builder category « À définir » by default; category change of an existing recipe (5 clicks within 3 s on the locked field, confirmation window, API `PATCH /recipes/:id/category`, API D-051 live); `outdoor` excluded from the builder category select; weekly menu generator brainstorm + branch workflow proposal recorded in `docs/roadmap.md` § Ideas / later (not scheduled).
- Resume here: owner's test results (this session and the 2026-10-08 list, still pending); then P5 tablet pass (Courses first) or the menu generator once its open questions are answered.
- Before pushing `master`: `npm run build && grep -n "icon\|manifest" dist/index.html` (single `/artemis-foodlab/` prefix).
- To test first (all validated by tsc + lint only), light and dark mode:
  1. Builder « Nouvelle recette »: « À définir » shown, N° empty and disabled, Save blocked; choosing a category suggests the N° and shows the ID; no « Activités extérieures » in the list.
  2. Load an existing recipe: 4 clicks on the category do nothing, 5 quick clicks open « Changer la catégorie »; « Confirmer » disabled until a category is chosen; recap `avant → après`; after confirm the builder shows the new ID, still locked.
  3. After a change: recipe in its new category (Recettes), still in the planning and the journal, photo shown, freezer batch still named, recipes using it as a base still linked.
  4. Dashboard `ConfirmActionModal` (deletions, users) unchanged.
- Still open: Current focus of the roadmap still points to P5 (owner to decide); API demo seeding deployment confirmation (from 2026-10-08).

## 2026-10-10 — Weekly menu generator brainstorm recorded (v6.84.2)

- Done: brainstorm of a weekly menu generator (criteria, UX, engine, missing data, possible V1 → V4 split, open questions) and the proposed `Dev` / `master` branch workflow recorded in `docs/roadmap.md` § Ideas / later. Not scheduled (owner: « pour plus tard »); P5 tablet pass postponed too.
- Still open: owner's answers to the open questions before any scheduling.

## 2026-10-10 — Recipe Builder: `outdoor` excluded from the category select (v6.84.1)

- Done: the creation select of `RecipeMetaForm` no longer offers the `outdoor` category (reserved to outdoor activities, `isRecipeCategory`); a persisted draft still on `outdoor` shows « À définir » and `validateBuilderState` blocks Save with « La catégorie est obligatoire. ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.

## 2026-10-10 — Recipe Builder: category change of an existing recipe (v6.84.0)

- Done: the locked category field opens, after 5 clicks within 3 s, a confirmation window (new category, recap of category and code `avant → après`, consequences, demo warning, « Confirmer »). Dedicated API route `PATCH /recipes/:id/category` (API D-051, prod confirmed by the owner); after success: full catalogue resync, draft patched to the new code, freezer resync, `useRefreshStore` bump. `ConfirmActionModal` gains `children` and `confirmDisabled`; new predicate `isRecipeCategory`. Details `docs/spec-recipes.md`, contract `docs/api.md`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser, real payloads of the route not captured by the front session (contract taken from the API docs `spec-catalogue.md` / D-051).
- Still open: nothing.

## 2026-10-10 — Recipe Builder: category « À définir » by default (v6.83.0)

- Done: a new draft and « Nouvelle recette » start without category (`initialRecipeBuilderState` → `categoryId: ""`, no longer reads the catalogue); `RecipeMetaForm` shows a disabled « À définir » option, the N° field (empty) is disabled and the ID badge hidden until a category is chosen; choosing one suggests the next free N° as before. Save blocked by the existing « La catégorie est obligatoire. ».
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: category change of an existing recipe (step 2), waiting for the API route `PATCH /recipes/:id/category` (contract validated, see `docs/roadmap.md` § Ideas / later) and its prod deployment.

## 2026-10-08 — Session end (« pause test », v6.82.19)

- Done this session (v6.79.7 → 6.82.18, one commit per step): P4 code review finished and closed — `features/planning` (desserts kept on dish replacement, writes with pending + errors, local dates, module split, dessert choice window on drag), `dashboard` (shared building blocks), `recipeBuilder` (locked identity of a loaded recipe, « Variante », mandatory dish photo), `recipes` (not-found page), `news` + `sync`, `shared/` (D-032 utilities split: `core/utils/`, business helpers in `core/logic/`, `core/` no longer imports `shared/`; SVG card escaping fix; safe browser storage), named theme colours everywhere (0 `dark:*-slate-*` left). Also: mandatory outdoor activity photo (API live), ISO week-year fix (no data to migrate), favicon in local dev, « Collation » slot label.
- Resume here: owner's test results; then P5 tablet portrait pass (Courses, Recettes, Congélateur, Recipe Builder, Dashboard) or fixes from the tests. Deferred items in `docs/roadmap.md` § Ideas / later.
- Before pushing `master`: `npm run build && grep -n "icon\|manifest" dist/index.html` (single `/artemis-foodlab/` prefix).
- To test first (all validated by tsc + lint only), light **and** dark mode:
  1. Planning: replace a dish that has desserts (desserts and their persons kept); « ajouter au planning » from a recipe and from a dessert; drag & drop with desserts, including the dessert choice window (> 3 desserts, unchecked ones deleted); copy; shopping days selection; double-click on a picker row; week navigation around 2025-12-29 (« Sem. 1 »); « Collation » label.
  2. Recipe Builder: load a recipe (category + N° locked, name editable, update); new recipe with a taken N° (blocked); « Variante » (new name + photo); dish photo mandatory; « Nouvelle recette » confirmation; quantities with a comma; delete confirmation.
  3. Dashboard: create / edit an outdoor activity with its photo (multipart, API live); foods / users forms; users list no longer flashes.
  4. Recipes: unknown recipe URL → « Recette introuvable »; nutrition calculator with « 1,5 »; filters.
  5. Everywhere: theme colours (whole app migrated), theme kept after reload, sidebar and settings menu, notifications.
- Still open: owner's confirmation of the API demo seeding deployment.

## 2026-10-08 — P4 code review closed (v6.82.18)

- Done: phase P4 closed with the owner's agreement. Every folder of `src/` reviewed; open points of `dev/refactoring.md` closed or deferred: data import removal, category change of a recipe, ingredient card in search (deferred, `docs/roadmap.md` § Ideas / later); backdrop-close convention kept as is; decimals keep the dot display (owner). Roadmap focus moves to the P5 tablet portrait pass.
- Still open: owner's browser tests and build check before pushing; API demo seeding now keys weeks by the ISO week-year (done API-side, deployment to confirm by the owner).

## 2026-10-08 — ISO week-year bug fixed (v6.82.17)

- Done: Planning and Journal now key a week by the ISO week-year (`getWeekYear`, re-export of `getISOWeekYear` in `core/utils/weekUtils.ts`) instead of the calendar year of the Monday (wrong only when the Monday falls on Dec 29-31, e.g. 2024-12-30 → was (2024, 1), is (2025, 1)). Shopping days and drag & drop follow (they take year/week from the module). Prod inventory by the API session (read-only): no slot and no shopping day in week 1/52/53, planned range 2026-W09 → W42, so no data migration. Also from the API session: 0/9 outdoor activities without photo; `POST /import` never creates catalogue items (unknown codes skipped as anomalies).
- Numbers: `npx tsc -b` + `npm run lint` pass; `getISOWeekYear` checked on 2024-12-30, 2025-12-29, 2026-01-05, 2026-10-05; not checked in a browser.
- Still open: API demo seeding fix (same bug, `planningWeekOf`) to relay; comma display question (owner); P4 closure.

## 2026-10-08 — Favicon missing in local dev (v6.82.16)

- Done: since `1b3dd4a` (2026-09-09) `index.html` wrote favicon / apple-touch-icon / manifest links as `%BASE_URL%assets/…`; the Vite dev server replaced `%BASE_URL%` and then prefixed the base again (`/artemis-foodlab/artemis-foodlab/…`), so no favicon in local; prod was correct. Links are back to root paths (`/assets/ui/icon/…`, `/manifest.webmanifest`), which Vite prefixes once. Checked on the running dev server: single `/artemis-foodlab/` prefix.
- Numbers: `npx tsc -b` + `npm run lint` not affected (HTML only). **Build output not checked** (agents never run `npm run build`): the owner must check `dist/index.html` before pushing.
- Still open: owner's build check; P4 closure (owner's agreement).

## 2026-10-08 — `shared/` migrated to the named theme colours, code review done (v6.82.15)

- Done: the last 31 `dark:*-slate-*` classes (all in `shared/components/`) replaced by the named colours (D-031): 30 exact pairs, one one-off (`ConfirmActionModal` recap list `bg-slate-50 dark:bg-slate-200/60` → `bg-subtle-tint`, 40 % instead of 60 % in dark mode, same mapping the owner accepted for the journal). The theme check now finds 0 occurrence in `src/`. This closes the `shared/` review and every folder of the P4 code review.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser (light and dark mode).
- Still open: closing phase P4 in the roadmap needs the owner's agreement (its definition of done also asks the open points of `dev/refactoring.md` to be closed or explicitly deferred); outdoor activity photo waiting for the API deployment; later items: data import removal, backdrop-close convention, comma display in `DecimalInput` / `formatQty`, category change of a recipe, ISO week-year bug, ingredient card in search.

## 2026-10-08 — `shared/` review, part 4: layout duplicates (v6.82.14)

- Done: sidebar links (5 in `SidebarNav` + 2 admin links in `Layout`) → `SidebarLink`; the 5 settings menu buttons → `SettingsMenuItem`; `FORM_INPUT_CLASS` moved from the dashboard to `shared/components/ui/formStyles.ts` and reused by `AccountModal` (identical class). Identical rendering.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 3 (last theme classes, end of the code review).

## 2026-10-08 — `shared/` review, part 4: SVG card escaping (v6.82.13)

- Done: read-only review of `shared/components/` (findings in `dev/refactoring.md`). Fix (security): the food card label (`[[FOOD_LABEL]]`, name of an ingredient-type recipe) was inserted into SVG injected with `dangerouslySetInnerHTML` without `escapeXml`; it is now escaped, image URLs too, and templates are filled by `fillTemplate` (split/join) so `$&`-like sequences in data are no longer interpreted (`shared/utils/cards/cardSvg.ts`). Identical rendering for normal names.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open (resume here): `shared/components` step 2 (sidebar link, settings menu items, shared input class), step 3 (last 38 theme classes, which ends the code review); outdoor activity photo waiting for the API deployment.

## 2026-10-08 — `shared/` review, part 3: stores (v6.82.12)

- Done: read-only review of `shared/store/` (11 stores), findings in `dev/refactoring.md`, no data bug. Fix: `localStorage` writes/reads that could throw when storage is blocked (strict private mode, full quota) now go through `readStorage` / `writeStorage` (`shared/utils/safeStorage.ts`): theme (read at startup, could prevent the app from rendering) and recipe filter save. Dead code removed: `useMenuStore.currentWeek` / `currentYear` / `currentWeekId` (never read) and `getWeekId`.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: `shared/` part 4 (components).

## 2026-10-08 — `shared/` review, part 2: hooks (v6.82.11)

- Done: read-only review of `shared/hooks/` (37 hooks), findings in `dev/refactoring.md`, no bug. Search logic (~100 lines) moved out of `useSearch` to `searchRecipes` (`core/logic/recipe/recipeSearchLogic.ts`, with `SearchRecipeResult` and `MAX_PICKER_RESULTS`); the hooks only call it. `useVersionCheck`: comment removed (rule 2), `version.json` read without a cast. Theme context moved from `hooks/useTheme.ts` to `contexts/themeContextValue.ts` (name avoids a case clash with `ThemeContext.tsx` on Windows), stored theme validated (`readStoredTheme`). `useColCount` + `useFreezerColCount` → one `useColCount(breakpoints)`, Shopping (3 / 2 / 1 columns) and Freezer (2 / 1) keep their thresholds.
- Numbers: `npx tsc -b` + `npm run lint` pass; no behaviour change.
- Still open: `shared/` part 3 (stores), part 4 (components).

## 2026-10-08 — Slot labels: single source, « Collation » in the planning grid (v6.82.10)

- Done: slot labels moved from `shared/utils/slotLabels.ts` to `core/domain/slotLabels.ts`: `SLOT_LABELS` (full: « Petit-déjeuner », « Déjeuner », « Dîner », « Collation », journal and shopping) and `SLOT_SHORT_LABELS` (planning grid: « Petit déj. », …), used by `SLOT_DISPLAY` (which keeps the icon and row height). Visible change, owner's choice: the planning grid says « Collation » instead of « Goûter ». The recipe filter type « Goûter » (pastries) is a different concept and is unchanged.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: `shared/` review part 2 (hooks), then stores and components.

## 2026-10-08 — `shared/` review, part 1: card adapter cleanup (v6.82.9)

- Done: `cardAdapter` no longer rewrites zero macros (uses `ZERO`) nor rounds the 5 macros by hand twice: new `roundMacros` (`core/logic/nutrition/macroLogic.ts`). Identical card rendering.
- Numbers: `npx tsc -b` + `npm run lint` pass.
- Still open: slot labels (« Collation » chosen by the owner; single source in `core/domain/` with a short label for the planning grid, to confirm); then hooks, stores, components.

## 2026-10-08 — `shared/` review, part 1: business utilities to `core/` (v6.82.8)

- Done: `unitUtils` → `core/logic/unit/unitFormatLogic.ts`; `macroUtils` → `core/logic/nutrition/macroLogic.ts` (pure computations, no catalogue import any more); the precomputed caches `RECIPE_MACROS` / `RECIPE_BASE_GRAMS` and `refreshRecipeMacros` (filled at module load from the catalogue) → `core/catalogue/recipeMetrics.ts`. `core/` no longer imports anything from `shared/` (D-032 complete). Docs updated (architecture, conventions, spec-journal, decisions).
- Numbers: `npx tsc -b` + `npm run lint` pass; no behaviour change.
- Still open: slot labels (owner); `cardAdapter` duplicates; then hooks, stores, components.

## 2026-10-08 — `shared/` review, part 1: generic utilities to `core/utils/` (v6.82.7)

- Done: read-only review of `shared/utils/` (findings in `dev/refactoring.md`). Owner's decision D-032: split utilities by nature; generic pure helpers move to `core/utils/` (`numberUtils`, `collectionUtils`, `sortUtils`, `textUtils`, `codeUtils`, `columnUtils`, `dateUtils`, `weekUtils`; 56 files touched, imports rewritten), browser/React-bound ones stay in `shared/utils/`. Dead code removed: `dayLabels.ts`, `getDaysOfWeek`, `formatIsoDateShort`; `dateUtils` uses `DAYS` instead of its own day list. Docs: `AGENTS.md` (map, golden rule 4), `docs/architecture.md`, `docs/conventions.md`, `docs/decisions.md` D-032.
- Numbers: `npx tsc -b` + `npm run lint` pass; no behaviour change.
- Still open: `unitUtils` → `core/logic/unit/`, `macroUtils` → `core/logic/nutrition/` + caches → `core/catalogue/` (last `core` → `shared` imports); slot labels (`SLOT_LABELS` vs `SLOT_DISPLAY`) waiting for the owner; `cardAdapter` duplicates (zero macros, rounding); then hooks, stores, components.

## 2026-10-08 — News + sync migrated to the named theme colours (v6.82.6)

- Done: the 7 `dark:*-slate-*` classes of `features/news` and `features/sync` replaced by the named colours (D-031), all exact pairs, identical rendering. This closes the news + sync review and the whole `features/` review.
- Numbers: `npx tsc -b` + `npm run lint` pass; theme check 37 occurrences in 15 files left, none in `features/`; not checked in a browser.
- Still open: `shared/` review (with the `core` → `shared` layering fix, `SLOT_LABELS` vs `SLOT_DISPLAY`, `DecimalInput` comma display); outdoor activity photo waiting for the API deployment; data import removal (later).

## 2026-10-08 — `features/` review: news + sync, step 2 (v6.82.5)

- Done: import summary sentence and the `ImportResult` type moved from `ImportModal` / `importService` to `core/logic/sync/importSummaryLogic.ts` (`formatImportSummary`); « Nouveautés » navigates with `buildRecipeDetailUrl`. Identical behaviour.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 3 (theme, 6 exact pairs).

## 2026-10-08 — `features/` review: news + sync, step 1 (v6.82.4)

- Done: read-only review of `features/news` and `features/sync` (4 files), findings in `dev/refactoring.md`. Step 1: « Nouveautés » modal height in `dvh`, `aria-label` on its close button; import summary says « éléments » instead of the English « items » (owner's choice). The « no close on backdrop click » convention turned out to come from the doc migration, never explicitly validated: kept as is for now, to revisit if annoying in use (`docs/ui-design.md`); `NewsModal` still closes on backdrop.
- Numbers: `npx tsc -b` + `npm run lint` pass; not checked in a browser.
- Still open: step 2 (import summary to `core/logic/sync`, recipe link via `buildRecipeDetailUrl`), step 3 (theme, 6 exact pairs).

## 2026-10-08 — Recipes migrated to the named theme colours (v6.82.3)

- Done: the 23 `dark:*-slate-*` classes of `features/recipes` replaced by the named colours (D-031), all exact pairs, identical rendering (`bg-surface`, `bg-surface-raised`, `bg-muted`, `ring-strong` and their `hover:`). This closes the recipes review.
- Numbers: `npx tsc -b` + `npm run lint` pass; theme check 43 occurrences in 19 files left; not checked in a browser.
- Still open: next `features/` folders (`news` + `sync`), then `shared/`; outdoor activity photo waiting for the API deployment.

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
