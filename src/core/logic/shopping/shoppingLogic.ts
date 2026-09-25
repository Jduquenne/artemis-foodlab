import { getWeekSlots } from "../../services/planningService";
import { HouseholdItem } from "../../domain/household";
import { Ingredient, IngredientCategory } from "../../domain/ingredient";
import { MealSlot, ShoppingDay } from "../../domain/planning";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { getAllRecipeIds } from "../../domain/recipePredicates";
import { pluralizeUnit } from "../../../shared/utils/unitUtils";
import { distributeToColumns } from "../../../shared/utils/columnUtils";
import { isoDateFromWeekDay } from "../../../shared/utils/dateUtils";
import { getIngredientCategoryFromSlug } from "../../domain/ingredientCategorySlugs";
import { ApiShoppingExtra } from "./shoppingApiMapper";

export interface IngredientSource {
  recipeId: string;
  recipeName: string;
  day: string;
  isoDate: string;
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
  isExtra?: boolean;
  extraId?: string;
}

export function extrasToIngredients(extras: ApiShoppingExtra[]): ConsolidatedIngredient[] {
  return extras.map((extra) => ({
    key: `extra::${extra.id}`,
    name: extra.name,
    foodId: extra.foodId ?? undefined,
    totalQuantity: extra.quantity ?? 0,
    unit: extra.unit ?? "",
    category: extra.categoryId ? getIngredientCategoryFromSlug(extra.categoryId) : undefined,
    sources: [],
    isExtra: true,
    extraId: extra.id,
  }));
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

export interface ShoppingCatalogue {
  recipes: Record<string, RecipeDetails>;
  baseGrams: Record<string, number>;
}

function slotScaleFactor(
  slot: MealSlot,
  recipeId: string,
  defaultPortions: number,
  baseGramsById: Record<string, number>,
): number {
  const recipePersonsOverride = slot.recipePersons?.[recipeId];
  const recipeGramsOverride = slot.recipeQuantities?.[recipeId];
  const baseGrams = baseGramsById[recipeId];
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

function compareNames(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "fr");
}

function buildIngredientSource(
  slot: MealSlot,
  recipeId: string,
  recipeName: string,
  ingredient: Ingredient,
  quantity: number,
  fromBaseId?: string,
): IngredientSource {
  const persons = slot.recipePersons?.[recipeId] ?? slot.persons;
  return {
    recipeId,
    recipeName,
    day: slot.day,
    isoDate: isoDateFromWeekDay(slot.year, slot.week, slot.day),
    slot: slot.slot,
    quantity,
    unit: ingredient.unit,
    ...(fromBaseId && { fromBaseId }),
    ...(persons !== undefined && { persons, baseQuantity: ingredient.quantity ?? 0 }),
  };
}

function aggregateSlots(
  slots: MealSlot[],
  catalogue: ShoppingCatalogue,
): ConsolidatedIngredient[] {
  const data = catalogue.recipes;
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
      const scaleFactor = slotScaleFactor(slot, recipeId, details.defaultPortions, catalogue.baseGrams);

      for (const ing of details.ingredients) {
        if (ing.baseId) {
          const baseRecipe = data[ing.baseId];
          if (baseRecipe) {
            const basePortionScale = (ing.quantity ?? 1) / baseRecipe.defaultPortions;
            const combinedScale = scaleFactor * basePortionScale;
            for (const baseIng of baseRecipe.ingredients) {
              const qty = (baseIng.quantity ?? 0) * combinedScale;
              addIngredientToMap(baseIng, qty, buildIngredientSource(slot, recipeId, recipeName, baseIng, qty, ing.baseId));
            }
            continue;
          }
        }

        const qty = (ing.quantity ?? 0) * scaleFactor;
        addIngredientToMap(ing, qty, buildIngredientSource(slot, recipeId, recipeName, ing, qty));
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
    .sort(compareNames);
}

function aggregateBases(slots: MealSlot[], catalogue: ShoppingCatalogue): BaseEntry[] {
  const data = catalogue.recipes;
  const map = new Map<string, BaseEntry>();

  for (const slot of slots) {
    const allIds = getAllRecipeIds(slot);
    for (const recipeId of allIds) {
      const details = data[recipeId];
      if (!details) continue;

      const scaleFactor = slotScaleFactor(slot, recipeId, details.defaultPortions, catalogue.baseGrams);

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

  return Array.from(map.values()).sort(compareNames);
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

export const getShoppingListForDays = async (
  days: ShoppingDay[],
  catalogue: ShoppingCatalogue,
): Promise<ConsolidatedIngredient[]> => {
  if (days.length === 0) return [];
  return aggregateSlots(await resolveWeekSlots(days), catalogue);
};

export const getBasesForDays = async (
  days: ShoppingDay[],
  catalogue: ShoppingCatalogue,
): Promise<BaseEntry[]> => {
  if (days.length === 0) return [];
  return aggregateBases(await resolveWeekSlots(days), catalogue);
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

export function buildSourceCheckKey(
  ingredientKey: string,
  source: Pick<IngredientSource, "recipeId" | "day" | "slot">
): string {
  return `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
}

function checkedSourcesQuantity(ing: ConsolidatedIngredient, sourceChecked: Set<string>): number {
  return ing.sources
    .filter((s) => sourceChecked.has(buildSourceCheckKey(ing.key, s)))
    .reduce((sum, s) => sum + s.quantity, 0);
}

export function remainingToBuy(
  ing: ConsolidatedIngredient,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): number {
  if (ing.totalQuantity === 0) return 0;
  const effective = Math.max(0, ing.totalQuantity - checkedSourcesQuantity(ing, sourceChecked));
  return Math.max(0, effective - (stocks[ing.key] ?? 0));
}

export function isIngredientNeeded(
  ing: ConsolidatedIngredient,
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): boolean {
  if (checked.has(ing.key)) return false;
  return ing.totalQuantity === 0 || remainingToBuy(ing, stocks, sourceChecked) > 0;
}

export function isIngChecked(ing: RecipeCardIngredient, sourceChecked: Set<string>): boolean {
  return ing.sources.length > 0 && ing.sources.every(
    (s) => sourceChecked.has(buildSourceCheckKey(ing.ingredientKey, s))
  );
}

export function groupAndSortSources(sources: IngredientSource[]): IngredientSource[][] {
  const seen = new Map<string, IngredientSource[]>();
  for (const src of sources) {
    const existing = seen.get(src.recipeId);
    if (existing) { existing.push(src); } else { seen.set(src.recipeId, [src]); }
  }
  return [...seen.values()].sort((a, b) => {
    const minA = a.reduce((m, s) => s.isoDate < m ? s.isoDate : m, a[0].isoDate);
    const minB = b.reduce((m, s) => s.isoDate < m ? s.isoDate : m, b[0].isoDate);
    return minA.localeCompare(minB);
  });
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

type IngredientGroup = { label: string; list: ConsolidatedIngredient[] };

function accumulateIngredient(
  target: Map<string, RecipeCardIngredient>,
  ing: ConsolidatedIngredient,
  source: IngredientSource,
): void {
  const existing = target.get(ing.key);
  if (existing) {
    existing.quantity += source.quantity;
    existing.sources.push(source);
    return;
  }
  target.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
}

interface RecipeCardAccumulator {
  recipeId: string;
  recipeName: string;
  directIngs: Map<string, RecipeCardIngredient>;
  baseGroups: Map<string, { baseId: string; baseName: string; ings: Map<string, RecipeCardIngredient> }>;
}

export function buildRecipeCards(
  ingredients: ConsolidatedIngredient[],
  bases: BaseEntry[],
  recipes: Record<string, RecipeDetails>,
): RecipeCard[] {
  const recipeMap = new Map<string, RecipeCardAccumulator>();
  for (const ing of ingredients) {
    for (const source of ing.sources) {
      let recipe = recipeMap.get(source.recipeId);
      if (!recipe) {
        recipe = { recipeId: source.recipeId, recipeName: source.recipeName, directIngs: new Map(), baseGroups: new Map() };
        recipeMap.set(source.recipeId, recipe);
      }
      if (!source.fromBaseId) {
        accumulateIngredient(recipe.directIngs, ing, source);
        continue;
      }
      let baseGroup = recipe.baseGroups.get(source.fromBaseId);
      if (!baseGroup) {
        const baseName = bases.find((b) => b.baseId === source.fromBaseId)?.name ?? source.fromBaseId;
        baseGroup = { baseId: source.fromBaseId, baseName, ings: new Map() };
        recipe.baseGroups.set(source.fromBaseId, baseGroup);
      }
      accumulateIngredient(baseGroup.ings, ing, source);
    }
  }
  return Array.from(recipeMap.values())
    .filter((r) => recipes[r.recipeId]?.kind !== RecipeKind.INGREDIENT)
    .map((r) => ({
      recipeId: r.recipeId,
      recipeName: r.recipeName,
      directIngredients: Array.from(r.directIngs.values()).sort(compareNames),
      baseGroups: Array.from(r.baseGroups.values())
        .map((b) => ({ baseId: b.baseId, baseName: b.baseName, ingredients: Array.from(b.ings.values()).sort(compareNames) }))
        .sort((a, b) => a.baseName.localeCompare(b.baseName, "fr")),
    }))
    .sort((a, b) => a.recipeName.localeCompare(b.recipeName, "fr"));
}

function groupByCategory(
  ingredients: ConsolidatedIngredient[],
  keep: (ingredient: ConsolidatedIngredient) => boolean = () => true,
): IngredientGroup[] {
  const groups: IngredientGroup[] = CATEGORY_ORDER
    .map((cat) => ({ label: cat as string, list: ingredients.filter((i) => i.category === cat && keep(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => (!i.category || !CATEGORY_ORDER.includes(i.category)) && keep(i));
  if (uncategorized.length > 0) groups.push({ label: "Autres", list: uncategorized });
  return groups;
}

export function groupIngredients(ingredients: ConsolidatedIngredient[]): IngredientGroup[] {
  return groupByCategory(ingredients);
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  filter: "all" | "missing",
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, (i) => filter === "all" || isIngredientNeeded(i, checked, stocks, sourceChecked));
}

export function computeUncheckedCount(
  ingredients: ConsolidatedIngredient[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
  householdItems: HouseholdItem[],
): number {
  const ingredientUnchecked = ingredients.filter((i) => isIngredientNeeded(i, checked, stocks, sourceChecked)).length;
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
  allGroupedItems: IngredientGroup[],
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
    const items = group.list.filter((i) => isIngredientNeeded(i, checked, stocks, sourceChecked));

    if (items.length === 0) continue;

    const itemParts = items.map((item) => {
      const needed = remainingToBuy(item, stocks, sourceChecked);

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

export function computePricePerKg(weightGrams: number, price: number): number | null {
  if (!Number.isFinite(weightGrams) || !Number.isFinite(price) || weightGrams <= 0 || price <= 0) return null;
  return (price / weightGrams) * 1000;
}
