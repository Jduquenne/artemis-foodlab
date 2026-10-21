import { Ingredient, IngredientCategory, Unit } from "../../domain/ingredient";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { MealSlot, ShoppingDay } from "../../domain/planning";
import { getAllRecipeIds } from "../../domain/recipePredicates";
import { BaseEntry, ConsolidatedIngredient, IngredientSource, ShoppingCatalogue } from "../../domain/shopping";
import { isoDateFromWeekDay } from "../../utils/dateUtils";
import { compareByName } from "../../utils/sortUtils";
import { AccompanimentOption } from "../../domain/accompaniment";
import { reachableGroupIngredients, resolveIngredientFood, personalizeRecipeTree, splitGroupIngredient } from "../foodGroup/foodChoiceLogic";
import { accompanimentsFor, resolveAccompaniment } from "../accompaniment/accompanimentLogic";
import { parseUnit } from "../unit/unitLogic";

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
      const listed = existing.sources.find(
        (s) =>
          s.recipeId === source.recipeId &&
          s.day === source.day &&
          s.slot === source.slot,
      );
      if (!listed) existing.sources.push(source);
      else if (listed.profileNames && source.profileNames) {
        listed.quantity += source.quantity;
        listed.profileNames = [...new Set([...listed.profileNames, ...source.profileNames])];
      }
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

      const addAccompanimentOption = (option: AccompanimentOption, profile: ShoppingCatalogue["profiles"][number], persons: number) => {
        const names = [profile.name].filter(Boolean);
        if (option.kind === "food") {
          const food = option.foodId ? catalogue.foods[option.foodId] : undefined;
          if (!food || option.quantityPerPerson === null) return;
          const qty = option.quantityPerPerson * persons;
          const ing: Ingredient = {
            id: `accompaniment-${option.id}`,
            name: food.name,
            quantity: option.quantityPerPerson,
            unit: parseUnit(option.unit),
            category: food.category,
            foodId: food.id,
          };
          addIngredientToMap(ing, qty, buildIngredientSource(slot, recipeId, recipeName, ing, qty, undefined, names));
          return;
        }
        const optionRecipe = option.recipeCode ? data[option.recipeCode] : undefined;
        if (!optionRecipe || !option.recipeCode) return;
        const perPerson = option.portionsPerPerson ?? 1;
        const mealChoices = slot.foodChoices?.[recipeId] ?? [];
        const personalization = { profile, mealChoices };
        const toSpecify = new Set(
          reachableGroupIngredients(optionRecipe, data, perPerson)
            .filter(({ ingredient }) => resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, mealChoices)?.source === "recipe")
            .map(({ ingredient }) => ingredient.id),
        );
        const tree = personalizeRecipeTree(optionRecipe, personalization, data, catalogue.foods, perPerson);
        const scale = (perPerson * persons) / Math.max(optionRecipe.defaultPortions, 1);
        for (const optionIng of tree.recipe.ingredients) {
          const base = optionIng.baseId ? tree.recipes[optionIng.baseId] : undefined;
          if (optionIng.baseId && base) {
            const baseScale = (scale * (optionIng.quantity ?? 1)) / Math.max(base.defaultPortions, 1);
            for (const baseIng of base.ingredients) {
              const qty = (baseIng.quantity ?? 0) * baseScale;
              addIngredientToMap(baseIng, qty, buildIngredientSource(slot, recipeId, recipeName, baseIng, qty, optionIng.baseId, names), toSpecify.has(baseIng.id));
            }
            continue;
          }
          const qty = (optionIng.quantity ?? 0) * scale;
          addIngredientToMap(optionIng, qty, buildIngredientSource(slot, recipeId, recipeName, optionIng, qty, option.recipeCode, names), toSpecify.has(optionIng.id));
        }
      };

      const accompaniments = accompanimentsFor(recipeId, catalogue.accompaniments ?? []);
      if (accompaniments.length > 0 && catalogue.profiles.length > 0) {
        const persons = (scaleFactor * Math.max(details.defaultPortions, 1)) / catalogue.profiles.length;
        const accompanimentChoices = slot.accompanimentChoices?.[recipeId] ?? [];
        for (const accompaniment of accompaniments) {
          for (const profile of catalogue.profiles) {
            const { option } = resolveAccompaniment(accompaniment, profile, accompanimentChoices);
            if (option) addAccompanimentOption(option, profile, persons);
          }
        }
      }

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
      const addBase = (baseId: string, baseRecipe: RecipeDetails, qty: number, unit: Unit) => {
        const existing = map.get(baseId);
        if (existing) {
          existing.totalPortions += qty;
        } else {
          map.set(baseId, { baseId, name: cleanRecipeName(baseRecipe.name), totalPortions: qty, unit });
        }
      };

      for (const ing of details.ingredients) {
        if (!ing.baseId) continue;
        const baseRecipe = data[ing.baseId];
        if (!baseRecipe) continue;
        addBase(ing.baseId, baseRecipe, (ing.quantity ?? 1) * scaleFactor, ing.unit);
      }

      const accompaniments = accompanimentsFor(recipeId, catalogue.accompaniments ?? []);
      if (accompaniments.length === 0 || catalogue.profiles.length === 0) continue;
      const persons = (scaleFactor * Math.max(details.defaultPortions, 1)) / catalogue.profiles.length;
      const accompanimentChoices = slot.accompanimentChoices?.[recipeId] ?? [];
      for (const accompaniment of accompaniments) {
        for (const profile of catalogue.profiles) {
          const { option } = resolveAccompaniment(accompaniment, profile, accompanimentChoices);
          const optionRecipe = option?.kind === "recipe" && option.recipeCode ? data[option.recipeCode] : undefined;
          if (!option?.recipeCode || !optionRecipe || optionRecipe.kind !== RecipeKind.BASE) continue;
          addBase(option.recipeCode, optionRecipe, (option.portionsPerPerson ?? 1) * persons, Unit.PORTION);
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
