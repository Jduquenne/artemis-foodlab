import { FoodChoice } from "../../domain/foodGroup";
import { MealSlot } from "../../domain/planning";
import { AccompanimentChoice } from "../../domain/accompaniment";
import { sameFoodChoices } from "../foodGroup/foodChoiceLogic";
import { sameAccompanimentChoices } from "../accompaniment/accompanimentLogic";

export interface ItemToAdd {
  code: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
  foodChoices: FoodChoice[];
  accompanimentChoices: AccompanimentChoice[];
}

export interface ItemToUpdate {
  itemApiId: string;
  personsOverride: number | null;
  gramsOverride: number | null;
  foodChoices?: FoodChoice[];
  accompanimentChoices?: AccompanimentChoice[];
}

export interface SlotDiff {
  personsChanged: boolean;
  itemsToAdd: ItemToAdd[];
  itemsToRemoveApiIds: string[];
  itemsToUpdate: ItemToUpdate[];
  carryOverItemApiIds: Record<string, string>;
}

export function diffSlotItems(previous: MealSlot | undefined, next: MealSlot): SlotDiff {
  const nextCombined = [...next.recipeIds, ...(next.dessertIds ?? [])];
  const nextDessertSet = new Set(next.dessertIds ?? []);
  const previousCombined = previous ? [...previous.recipeIds, ...(previous.dessertIds ?? [])] : [];
  const previousSet = new Set(previousCombined);
  const nextSet = new Set(nextCombined);

  const itemsToAdd: ItemToAdd[] = [];
  const carryOverItemApiIds: Record<string, string> = {};
  const itemsToUpdate: ItemToUpdate[] = [];

  for (const code of nextCombined) {
    const personsOverride = next.recipePersons?.[code] ?? null;
    const gramsOverride = next.recipeQuantities?.[code] ?? null;
    const foodChoices = next.foodChoices?.[code] ?? [];
    const accompanimentChoices = next.accompanimentChoices?.[code] ?? [];
    if (!previousSet.has(code)) {
      itemsToAdd.push({ code, isDessert: nextDessertSet.has(code), personsOverride, gramsOverride, foodChoices, accompanimentChoices });
      continue;
    }
    const itemApiId = previous?.itemApiIds?.[code];
    if (itemApiId) carryOverItemApiIds[code] = itemApiId;
    const prevPersons = previous?.recipePersons?.[code] ?? null;
    const prevGrams = previous?.recipeQuantities?.[code] ?? null;
    const choicesChanged = !sameFoodChoices(previous?.foodChoices?.[code], foodChoices);
    const accompanimentsChanged = !sameAccompanimentChoices(previous?.accompanimentChoices?.[code], accompanimentChoices);
    if (itemApiId && (prevPersons !== personsOverride || prevGrams !== gramsOverride || choicesChanged || accompanimentsChanged)) {
      itemsToUpdate.push({
        itemApiId,
        personsOverride,
        gramsOverride,
        ...(choicesChanged ? { foodChoices } : {}),
        ...(accompanimentsChanged ? { accompanimentChoices } : {}),
      });
    }
  }

  const itemsToRemoveApiIds: string[] = [];
  for (const code of previousCombined) {
    if (!nextSet.has(code)) {
      const itemApiId = previous?.itemApiIds?.[code];
      if (itemApiId) itemsToRemoveApiIds.push(itemApiId);
    }
  }

  return {
    personsChanged: !previous || (previous.persons ?? null) !== (next.persons ?? null),
    itemsToAdd,
    itemsToRemoveApiIds,
    itemsToUpdate,
    carryOverItemApiIds,
  };
}
