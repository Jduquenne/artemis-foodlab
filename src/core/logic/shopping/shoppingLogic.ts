import { addDays, getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekSlots } from "../../services/planningService";
import { HouseholdItem, Ingredient, IngredientCategory, MealSlot, RecipeKind, ShoppingDay } from "../../domain/types";
import { getAllRecipeIds } from "../../domain/recipePredicates";
import { typedRecipesDb } from "../../typed-db/typedRecipesDb";
import { RECIPE_BASE_GRAMS } from "../../../shared/utils/macroUtils";
import { pluralizeUnit } from "../../../shared/utils/unitUtils";
import { distributeToColumns } from "../../../shared/utils/columnUtils";

export interface IngredientSource {
  recipeId: string;
  recipeName: string;
  day: string;
  slot: string;
  quantity: number;
  unit: string;
  persons?: number;
  baseQuantity?: number;
  fromBaseId?: string;
}

export interface ConsolidatedIngredient {
  key: string;
  name: string;
  foodId?: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory | undefined;
  preparation?: string;
  sources: IngredientSource[];
}

export interface BaseEntry {
  baseId: string;
  name: string;
  totalPortions: number;
  unit: string;
}

function cleanRecipeName(name: string): string {
  return name
    .replace(/\s+(ingrédients?|ingredients?|recettes?|recipes?|photo)$/i, "")
    .trim();
}

function slotScaleFactor(
  slot: MealSlot,
  recipeId: string,
  defaultPortions: number,
): number {
  const recipePersonsOverride = slot.recipePersons?.[recipeId];
  const recipeGramsOverride = slot.recipeQuantities?.[recipeId];
  const baseGrams = RECIPE_BASE_GRAMS[recipeId];
  if (recipeGramsOverride !== undefined && baseGrams) {
    const persons =
      recipePersonsOverride ?? slot.persons ?? defaultPortions;
    return (persons * recipeGramsOverride) / (defaultPortions * baseGrams);
  }
  if (recipePersonsOverride !== undefined && defaultPortions > 0) {
    return recipePersonsOverride / defaultPortions;
  }
  if (slot.persons !== undefined && defaultPortions > 0) {
    return slot.persons / defaultPortions;
  }
  if (slot.dessertIds?.includes(recipeId) && defaultPortions > 0) {
    return 1 / defaultPortions;
  }
  return 1;
}

async function aggregateSlots(
  slots: MealSlot[],
): Promise<ConsolidatedIngredient[]> {
  const data = typedRecipesDb;
  const map = new Map<string, ConsolidatedIngredient>();
  const prepMap = new Map<string, Set<string>>();

  function addIngredientToMap(
    ing: Ingredient,
    qty: number,
    source: IngredientSource,
  ) {
    const key = `${ing.name.toLowerCase()}-${ing.unit}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalQuantity += qty;
      if (!existing.foodId && ing.foodId) existing.foodId = ing.foodId;
      const alreadyListed = existing.sources.some(
        (s) =>
          s.recipeId === source.recipeId &&
          s.day === source.day &&
          s.slot === source.slot,
      );
      if (!alreadyListed) existing.sources.push(source);
    } else {
      map.set(key, {
        key,
        name: ing.name,
        foodId: ing.foodId,
        totalQuantity: qty,
        unit: ing.unit,
        category: ing.category as IngredientCategory | undefined,
        sources: [source],
      });
    }
    if (ing.preparation) {
      if (!prepMap.has(key)) prepMap.set(key, new Set());
      prepMap.get(key)!.add(ing.preparation);
    }
  }

  for (const slot of slots) {
    const allIds = getAllRecipeIds(slot);
    for (const recipeId of allIds) {
      const details = data[recipeId];
      if (!details) continue;

      const recipeName = cleanRecipeName(details.name);
      const scaleFactor = slotScaleFactor(slot, recipeId, details.defaultPortions);
      const effectivePersons = slot.recipePersons?.[recipeId] ?? slot.persons;

      for (const ing of details.ingredients) {
        if (ing.baseId) {
          const baseRecipe = data[ing.baseId];
          if (baseRecipe) {
            const basePortionScale = (ing.quantity ?? 1) / baseRecipe.defaultPortions;
            const combinedScale = scaleFactor * basePortionScale;
            for (const baseIng of baseRecipe.ingredients) {
              const baseQty = baseIng.quantity ?? 0;
              const qty = baseQty * combinedScale;
              const source: IngredientSource = {
                recipeId,
                recipeName,
                day: slot.day,
                slot: slot.slot,
                quantity: qty,
                unit: baseIng.unit,
                fromBaseId: ing.baseId,
                ...(effectivePersons !== undefined && {
                  persons: effectivePersons,
                  baseQuantity: baseQty,
                }),
              };
              addIngredientToMap(baseIng, qty, source);
            }
            continue;
          }
        }

        const baseQty = ing.quantity ?? 0;
        const qty = baseQty * scaleFactor;
        const source: IngredientSource = {
          recipeId,
          recipeName,
          day: slot.day,
          slot: slot.slot,
          quantity: qty,
          unit: ing.unit,
          ...(effectivePersons !== undefined && {
            persons: effectivePersons,
            baseQuantity: baseQty,
          }),
        };
        addIngredientToMap(ing, qty, source);
      }
    }
  }

  return Array.from(map.values())
    .map((item) => {
      const preps = prepMap.get(item.key);
      return preps && preps.size > 0
        ? { ...item, preparation: [...preps].join(", ") }
        : item;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

async function aggregateBases(slots: MealSlot[]): Promise<BaseEntry[]> {
  const data = typedRecipesDb;
  const map = new Map<string, BaseEntry>();

  for (const slot of slots) {
    const allIds = getAllRecipeIds(slot);
    for (const recipeId of allIds) {
      const details = data[recipeId];
      if (!details) continue;

      const scaleFactor = slotScaleFactor(slot, recipeId, details.defaultPortions);

      for (const ing of details.ingredients) {
        if (!ing.baseId) continue;
        const baseRecipe = data[ing.baseId];
        if (!baseRecipe) continue;

        const qty = (ing.quantity ?? 1) * scaleFactor;
        const existing = map.get(ing.baseId);
        if (existing) {
          existing.totalPortions += qty;
        } else {
          map.set(ing.baseId, {
            baseId: ing.baseId,
            name: cleanRecipeName(baseRecipe.name),
            totalPortions: qty,
            unit: ing.unit,
          });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "fr"),
  );
}

async function resolveWeekSlots(days: ShoppingDay[]): Promise<MealSlot[]> {
  const weekMap = new Map<
    string,
    { year: number; week: number; daySet: Set<string> }
  >();
  for (const d of days) {
    const key = `${d.year}-${d.week}`;
    if (!weekMap.has(key))
      weekMap.set(key, { year: d.year, week: d.week, daySet: new Set() });
    weekMap.get(key)!.daySet.add(d.day);
  }

  const slots: MealSlot[] = [];
  for (const { year, week, daySet } of weekMap.values()) {
    const weekSlots = await getWeekSlots(year, week);
    slots.push(...weekSlots.filter((s) => daySet.has(s.day)));
  }
  return slots;
}

export const getNextWeekShoppingList = async (): Promise<
  ConsolidatedIngredient[]
> => {
  const nextWeekDate = addDays(new Date(), 7);
  const nextWeek = getISOWeek(nextWeekDate);
  const nextYear = getISOWeekYear(nextWeekDate);

  const slots = await getWeekSlots(nextYear, nextWeek);

  return aggregateSlots(slots);
};

export const getShoppingListForDays = async (
  days: ShoppingDay[],
): Promise<ConsolidatedIngredient[]> => {
  if (days.length === 0) return [];
  return aggregateSlots(await resolveWeekSlots(days));
};

export const getBasesForDays = async (
  days: ShoppingDay[],
): Promise<BaseEntry[]> => {
  if (days.length === 0) return [];
  return aggregateBases(await resolveWeekSlots(days));
};

export interface RecipeCardIngredient {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  sources: IngredientSource[];
}

export interface RecipeBaseGroup {
  baseId: string;
  baseName: string;
  ingredients: RecipeCardIngredient[];
}

export interface RecipeCard {
  recipeId: string;
  recipeName: string;
  directIngredients: RecipeCardIngredient[];
  baseGroups: RecipeBaseGroup[];
}

export function isIngChecked(ing: RecipeCardIngredient, sourceChecked: Set<string>): boolean {
  return ing.sources.length > 0 && ing.sources.every(
    (s) => sourceChecked.has(`${ing.ingredientKey}::${s.recipeId}::${s.day}::${s.slot}`)
  );
}

export const CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.FRUIT_VEGETABLE,
  IngredientCategory.MEAT,
  IngredientCategory.FISH,
  IngredientCategory.DELI,
  IngredientCategory.DAIRY,
  IngredientCategory.FARM,
  IngredientCategory.BAKERY,
  IngredientCategory.STARCH,
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.DRIED_FRUIT,
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
  IngredientCategory.FROZEN,
  IngredientCategory.RECIPE,
  IngredientCategory.INTERNET,
  IngredientCategory.NON_PURCHASE,
  IngredientCategory.UNKNOWN,
];

export function getPeriodKey(days: ShoppingDay[]): string {
  return [...days].map((d) => `${d.year}-${d.week}-${d.day}`).sort().join('|');
}

type IngredientGroup = { label: string; list: ConsolidatedIngredient[] };

export function buildRecipeCards(ingredients: ConsolidatedIngredient[], bases: BaseEntry[]): RecipeCard[] {
  type RecipeAcc = {
    recipeId: string;
    recipeName: string;
    directIngs: Map<string, RecipeCardIngredient>;
    baseGroups: Map<string, { baseId: string; baseName: string; ings: Map<string, RecipeCardIngredient> }>;
  };
  const recipeMap = new Map<string, RecipeAcc>();
  for (const ing of ingredients) {
    for (const source of ing.sources) {
      if (!recipeMap.has(source.recipeId)) {
        recipeMap.set(source.recipeId, {
          recipeId: source.recipeId,
          recipeName: source.recipeName,
          directIngs: new Map(),
          baseGroups: new Map(),
        });
      }
      const recipe = recipeMap.get(source.recipeId)!;
      if (source.fromBaseId) {
        const baseName = bases.find((b) => b.baseId === source.fromBaseId)?.name ?? source.fromBaseId;
        if (!recipe.baseGroups.has(source.fromBaseId)) {
          recipe.baseGroups.set(source.fromBaseId, { baseId: source.fromBaseId, baseName, ings: new Map() });
        }
        const baseGroup = recipe.baseGroups.get(source.fromBaseId)!;
        if (!baseGroup.ings.has(ing.key)) {
          baseGroup.ings.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
        } else {
          const ex = baseGroup.ings.get(ing.key)!;
          ex.quantity += source.quantity;
          ex.sources.push(source);
        }
      } else {
        if (!recipe.directIngs.has(ing.key)) {
          recipe.directIngs.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
        } else {
          const ex = recipe.directIngs.get(ing.key)!;
          ex.quantity += source.quantity;
          ex.sources.push(source);
        }
      }
    }
  }
  return Array.from(recipeMap.values())
    .filter((r) => typedRecipesDb[r.recipeId]?.kind !== RecipeKind.INGREDIENT)
    .map((r) => ({
      recipeId: r.recipeId,
      recipeName: r.recipeName,
      directIngredients: Array.from(r.directIngs.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
      baseGroups: Array.from(r.baseGroups.values())
        .map((b) => ({ baseId: b.baseId, baseName: b.baseName, ingredients: Array.from(b.ings.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')) }))
        .sort((a, b) => a.baseName.localeCompare(b.baseName, 'fr')),
    }))
    .sort((a, b) => a.recipeName.localeCompare(b.recipeName, 'fr'));
}

export function groupIngredients(ingredients: ConsolidatedIngredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = CATEGORY_ORDER
    .map((cat) => ({ label: cat as string, list: ingredients.filter((i) => i.category === cat) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => !i.category || !CATEGORY_ORDER.includes(i.category));
  if (uncategorized.length > 0) groups.push({ label: 'Autres', list: uncategorized });
  return groups;
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  filter: 'all' | 'missing',
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  const getEffective = (i: ConsolidatedIngredient) => {
    const srcQty = i.sources
      .filter((s) => sourceChecked.has(`${i.key}::${s.recipeId}::${s.day}::${s.slot}`))
      .reduce((sum, s) => sum + s.quantity, 0);
    return Math.max(0, i.totalQuantity - srcQty);
  };
  const isNeeded = (i: ConsolidatedIngredient) => {
    if (checked.has(i.key)) return false;
    if (i.totalQuantity === 0) return true;
    return Math.max(0, getEffective(i) - (stocks[i.key] ?? 0)) > 0;
  };
  const filterItem = (i: ConsolidatedIngredient) => filter === 'all' || isNeeded(i);
  const groups: IngredientGroup[] = CATEGORY_ORDER
    .map((cat) => ({ label: cat as string, list: ingredients.filter((i) => i.category === cat && filterItem(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => (!i.category || !CATEGORY_ORDER.includes(i.category)) && filterItem(i));
  if (uncategorized.length > 0) groups.push({ label: 'Autres', list: uncategorized });
  return groups;
}

export function computeUncheckedCount(
  ingredients: ConsolidatedIngredient[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
  householdItems: HouseholdItem[],
): number {
  const ingredientUnchecked = ingredients.filter((i) => {
    if (checked.has(i.key)) return false;
    if (i.totalQuantity === 0) return true;
    const srcQty = i.sources
      .filter((s) => sourceChecked.has(`${i.key}::${s.recipeId}::${s.day}::${s.slot}`))
      .reduce((sum, s) => sum + s.quantity, 0);
    const effective = Math.max(0, i.totalQuantity - srcQty);
    return Math.max(0, effective - (stocks[i.key] ?? 0)) > 0;
  }).length;
  const householdUnchecked = householdItems.filter((i) => !checked.has(`household::${i.id}`)).length;
  return ingredientUnchecked + householdUnchecked;
}

export function assignIngredientColumns(
  allGroups: IngredientGroup[],
  filteredGroups: IngredientGroup[],
  colCount: number,
): IngredientGroup[][] {
  const stableAssignment = distributeToColumns(allGroups, (g) => g.list.length, colCount);
  const colForLabel = new Map<string, number>();
  stableAssignment.forEach((col, ci) => col.forEach((g) => colForLabel.set(g.label, ci)));
  const cols: IngredientGroup[][] = Array.from({ length: colCount }, () => []);
  for (const group of filteredGroups) {
    const ci = colForLabel.get(group.label) ?? 0;
    cols[ci].push(group);
  }
  return cols;
}

export function buildShoppingClipboardText(
  allGroupedItems: { label: string; list: ConsolidatedIngredient[] }[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
  uncheckedHouseholdItems: HouseholdItem[],
): string {
  const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
  const fmtUnit = (unit: string, qty: number): string => {
    if (unit === 'pièce') return '';
    if (unit === 'tranche') return 'tr';
    return pluralizeUnit(unit, qty);
  };

  const lines: string[] = [];

  for (const group of allGroupedItems) {
    const items = group.list.filter((i) => {
      if (checked.has(i.key)) return false;
      if (i.totalQuantity === 0) return true;
      const srcQty = i.sources
        .filter((s) => sourceChecked.has(`${i.key}::${s.recipeId}::${s.day}::${s.slot}`))
        .reduce((sum, s) => sum + s.quantity, 0);
      const effective = Math.max(0, i.totalQuantity - srcQty);
      return Math.max(0, effective - (stocks[i.key] ?? 0)) > 0;
    });

    if (items.length === 0) continue;

    const itemParts = items.map((item) => {
      const srcQty = item.sources
        .filter((s) => sourceChecked.has(`${item.key}::${s.recipeId}::${s.day}::${s.slot}`))
        .reduce((sum, s) => sum + s.quantity, 0);
      const effective = Math.max(0, item.totalQuantity - srcQty);
      const needed = item.totalQuantity === 0 ? 0 : Math.max(0, effective - (stocks[item.key] ?? 0));

      let part = item.name;
      if (item.preparation) part += ` (${item.preparation})`;
      if (item.totalQuantity > 0) part += ` ${fmt(needed)}${fmtUnit(item.unit, needed)}`;
      return part;
    });

    lines.push(group.label);
    lines.push(itemParts.join(" - "));
    lines.push("");
  }

  if (uncheckedHouseholdItems.length > 0) {
    lines.push(uncheckedHouseholdItems.map((item) => item.name).join(" - "));
    lines.push("");
  }

  return lines.join("\n").trim();
}
