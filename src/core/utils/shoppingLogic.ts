import { addDays } from "date-fns";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { db } from "../services/db";
import { MealSlot } from "../services/db";
import { RecipeDetails, IngredientCategory, ShoppingDay } from "../domain/types";
import recipesData from "../domain/recipes-ingredients.json";

export interface IngredientSource {
  recipeId: string;
  recipeName: string;
  day: string;
  slot: string;
  quantity: number;
  unit: string;
}

export interface ConsolidatedIngredient {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory | undefined;
  sources: IngredientSource[];
}

function cleanRecipeName(name: string): string {
  return name
    .replace(/\s+(ingrédients?|ingredients?|recettes?|recipes?|photo)$/i, "")
    .trim();
}

function toJsonKey(recipeId: string): string {
  const parts = recipeId.split("-");
  if (parts.length < 2) return recipeId.toUpperCase();
  const prefix = parts[0].toUpperCase();
  const numStr = parts.slice(1).join("-");
  const numMatch = numStr.match(/^(\d+)(BIS)?$/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10).toString().padStart(2, "0");
    const bis = numMatch[2] ? numMatch[2].toUpperCase() : "";
    return `${prefix}_${num}${bis}`;
  }
  return `${prefix}_${numStr.toUpperCase()}`;
}

async function aggregateSlots(slots: MealSlot[]): Promise<ConsolidatedIngredient[]> {
  const allRecipeIds = [...new Set(slots.flatMap((s) => s.recipeIds))];

  const recipeEntries = await db.recipes
    .where("recipeId")
    .anyOf(allRecipeIds)
    .toArray();

  const nameByRecipeId = new Map<string, string>();
  for (const entry of recipeEntries) {
    const existing = nameByRecipeId.get(entry.recipeId);
    if (!existing || entry.type === "photo") {
      nameByRecipeId.set(entry.recipeId, entry.name);
    }
  }

  const map = new Map<string, ConsolidatedIngredient>();
  const data = recipesData as unknown as Record<string, RecipeDetails>;

  for (const slot of slots) {
    for (const recipeId of slot.recipeIds) {
      const jsonKey = toJsonKey(recipeId);
      const details = data[recipeId] || data[jsonKey];
      if (!details) continue;

      const recipeName = cleanRecipeName(nameByRecipeId.get(recipeId) ?? recipeId);

      for (const ing of details.ingredients) {
        const qty = parseFloat(ing.quantity);
        if (isNaN(qty)) continue;
        const key = `${ing.name.toLowerCase()}-${ing.unit}`;

        const source: IngredientSource = {
          recipeId,
          recipeName,
          day: slot.day,
          slot: slot.slot,
          quantity: qty,
          unit: ing.unit,
        };

        const existing = map.get(key);
        if (existing) {
          existing.totalQuantity += qty;
          const alreadyListed = existing.sources.some(
            (s) => s.recipeId === source.recipeId && s.day === source.day && s.slot === source.slot,
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
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "fr"),
  );
}

export const getNextWeekShoppingList = async (): Promise<ConsolidatedIngredient[]> => {
  const nextWeekDate = addDays(new Date(), 7);
  const nextWeek = getISOWeek(nextWeekDate);
  const nextYear = getISOWeekYear(nextWeekDate);

  const slots = await db.planning
    .where("[year+week]")
    .equals([nextYear, nextWeek])
    .toArray();

  return aggregateSlots(slots);
};

export const getShoppingListForDays = async (days: ShoppingDay[]): Promise<ConsolidatedIngredient[]> => {
  if (days.length === 0) return [];

  const weekMap = new Map<string, { year: number; week: number; daySet: Set<string> }>();
  for (const d of days) {
    const key = `${d.year}-${d.week}`;
    if (!weekMap.has(key)) weekMap.set(key, { year: d.year, week: d.week, daySet: new Set() });
    weekMap.get(key)!.daySet.add(d.day);
  }

  const slots: MealSlot[] = [];
  for (const { year, week, daySet } of weekMap.values()) {
    const weekSlots = await db.planning.where("[year+week]").equals([year, week]).toArray();
    slots.push(...weekSlots.filter((s) => daySet.has(s.day)));
  }

  return aggregateSlots(slots);
};
