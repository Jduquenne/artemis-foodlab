import { addDays, getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekSlots } from "../services/planningService";
import { Ingredient, IngredientCategory, MealSlot, ShoppingDay } from "../domain/types";
import { getAllRecipeIds } from "../domain/recipePredicates";
import { typedRecipesDb } from "../typed-db/typedRecipesDb";
import { RECIPE_BASE_GRAMS } from "./macroUtils";

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
