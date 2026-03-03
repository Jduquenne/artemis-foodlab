import { addDays } from "date-fns";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekSlots, MealSlot } from "../services/planningService";
import {
  RecipeDetails,
  IngredientCategory,
  ShoppingDay,
} from "../domain/types";
import recipesDb from "../data/recipes-db.json";

export interface IngredientSource {
  recipeId: string;
  recipeName: string;
  day: string;
  slot: string;
  quantity: number;
  unit: string;
  persons?: number;
  baseQuantity?: number;
}

export interface ConsolidatedIngredient {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory | undefined;
  preparation?: string;
  sources: IngredientSource[];
}

function cleanRecipeName(name: string): string {
  return name
    .replace(/\s+(ingrédients?|ingredients?|recettes?|recipes?|photo)$/i, "")
    .trim();
}

async function aggregateSlots(
  slots: MealSlot[],
): Promise<ConsolidatedIngredient[]> {
  const data = recipesDb as unknown as Record<string, RecipeDetails>;
  const map = new Map<string, ConsolidatedIngredient>();
  const prepMap = new Map<string, Set<string>>();

  for (const slot of slots) {
    for (const recipeId of slot.recipeIds) {
      const details = data[recipeId];
      if (!details) continue;

      const recipeName = cleanRecipeName(details.name);
      const scaleFactor =
        slot.persons !== undefined && details.defaultPortions > 0
          ? slot.persons / details.defaultPortions
          : 1;

      for (const ing of details.ingredients) {
        const baseQty = ing.quantity ?? 0;
        const qty = baseQty * scaleFactor;
        const key = `${ing.name.toLowerCase()}-${ing.unit}`;

        const source: IngredientSource = {
          recipeId,
          recipeName,
          day: slot.day,
          slot: slot.slot,
          quantity: qty,
          unit: ing.unit,
          ...(slot.persons !== undefined && {
            persons: slot.persons,
            baseQuantity: baseQty,
          }),
        };

        const existing = map.get(key);
        if (existing) {
          existing.totalQuantity += qty;
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

  return aggregateSlots(slots);
};
