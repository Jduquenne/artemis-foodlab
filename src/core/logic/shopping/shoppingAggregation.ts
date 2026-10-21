import { Ingredient, IngredientCategory } from "../../domain/ingredient";
import { MealSlot, ShoppingDay } from "../../domain/planning";
import { getAllRecipeIds } from "../../domain/recipePredicates";
import { BaseEntry, ConsolidatedIngredient, IngredientSource, ShoppingCatalogue } from "../../domain/shopping";
import { isoDateFromWeekDay } from "../../utils/dateUtils";
import { compareByName } from "../../utils/sortUtils";
import { reachableGroupIngredients, splitGroupIngredient } from "../foodGroup/foodChoiceLogic";

function cleanRecipeName(name: string): string {
  return name
    .replace(/\s+(ingrédients?|ingredients?|recettes?|recipes?|photo)$/i, "")
    .trim();
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

function buildIngredientSource(
  slot: MealSlot,
  recipeId: string,
  recipeName: string,
  ingredient: Ingredient,
  quantity: number,
  fromBaseId?: string,
  profileNames?: string[],
): IngredientSource {
  const persons = slot.recipePersons?.[recipeId] ?? slot.persons;
  if (profileNames) {
    return {
      recipeId,
      recipeName,
      day: slot.day,
      isoDate: isoDateFromWeekDay(slot.year, slot.week, slot.day),
      slot: slot.slot,
      quantity,
      unit: ingredient.unit,
      ...(fromBaseId && { fromBaseId }),
      profileNames,
    };
  }
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

export function aggregateSlots(
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
    toSpecify = false,
  ) {
    const key = `${ing.name.toLowerCase()}-${ing.unit}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalQuantity += qty;
      if (!existing.foodId && ing.foodId) existing.foodId = ing.foodId;
      if (toSpecify) existing.toSpecify = true;
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
        ...(toSpecify && { toSpecify }),
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
      const choices = slot.foodChoices?.[recipeId] ?? [];
      const portionFactors = new Map(
        reachableGroupIngredients(details, data).map((entry) => [entry.ingredient.id, entry.portionFactor]),
      );

      const addGroupIngredient = (ing: Ingredient, choiceShare: number, fromBaseId?: string) => {
        for (const share of splitGroupIngredient(ing, details.defaultPortions, scaleFactor, catalogue.profiles, choices, choiceShare)) {
          const isDefault = share.foodId === ing.foodId;
          const shareIng = isDefault ? ing : { ...ing, foodId: share.foodId, name: catalogue.foods[share.foodId]?.name ?? ing.name };
          const names = share.profileIds.map((id) => catalogue.profiles.find((p) => p.id === id)?.name ?? "");
          addIngredientToMap(
            shareIng,
            share.quantity,
            buildIngredientSource(slot, recipeId, recipeName, shareIng, share.quantity, fromBaseId, names.filter(Boolean)),
            share.byRecipeDefault,
          );
        }
      };

      for (const ing of details.ingredients) {
        if (ing.baseId) {
          const baseRecipe = data[ing.baseId];
          if (baseRecipe) {
            const basePortionScale = (ing.quantity ?? 1) / baseRecipe.defaultPortions;
            const combinedScale = scaleFactor * basePortionScale;
            for (const baseIng of baseRecipe.ingredients) {
              if (baseIng.foodGroupId && baseIng.foodId) {
                const dishIng = { ...baseIng, quantity: (baseIng.quantity ?? 0) * basePortionScale };
                const occurrence = basePortionScale / Math.max(details.defaultPortions, 1);
                const total = portionFactors.get(baseIng.id) ?? 0;
                addGroupIngredient(dishIng, total > 0 ? occurrence / total : 1, ing.baseId);
                continue;
              }
              const qty = (baseIng.quantity ?? 0) * combinedScale;
              addIngredientToMap(baseIng, qty, buildIngredientSource(slot, recipeId, recipeName, baseIng, qty, ing.baseId));
            }
            continue;
          }
        }

        if (ing.foodGroupId) {
          addGroupIngredient(ing, 1);
          continue;
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
    .sort(compareByName);
}

export function aggregateBases(slots: MealSlot[], catalogue: ShoppingCatalogue): BaseEntry[] {
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

  return Array.from(map.values()).sort(compareByName);
}

export function groupDaysByWeek(days: ShoppingDay[]): { year: number; week: number; days: Set<string> }[] {
  const weeks = new Map<string, { year: number; week: number; days: Set<string> }>();
  for (const d of days) {
    const key = `${d.year}-${d.week}`;
    let entry = weeks.get(key);
    if (!entry) {
      entry = { year: d.year, week: d.week, days: new Set() };
      weeks.set(key, entry);
    }
    entry.days.add(d.day);
  }
  return [...weeks.values()];
}
