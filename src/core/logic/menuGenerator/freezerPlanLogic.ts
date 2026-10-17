import { MealReason } from "../../domain/menuGenerator";
import { pickRandom } from "../../utils/randomUtils";
import { FreezerBatchStock } from "../freezer/freezerStockLogic";

export interface FreezerPlanEntry {
  recipeCode: string;
  remainingMeals: number;
  portionsPerMeal: number;
  remainingPortions: number;
}

export interface FreezerPlan {
  entries: FreezerPlanEntry[];
}

export interface OpenSlot {
  key: string;
  index: number;
  date: string;
  candidateCodes: ReadonlySet<string>;
}

export interface FreezerReservation {
  recipeCode: string;
  reason: MealReason;
}

const MIN_FREEZER_GAP = 3;

export function createFreezerPlan(
  stocks: readonly FreezerBatchStock[],
  householdSize: number,
  alreadyPlannedCodes: readonly string[],
): FreezerPlan {
  const portionsPerMeal = Math.max(1, householdSize);
  const entries = stocks
    .map((stock) => {
      const planned = alreadyPlannedCodes.filter((code) => code === stock.recipeCode).length;
      return {
        recipeCode: stock.recipeCode,
        remainingMeals: Math.floor(stock.portions / portionsPerMeal) - planned,
        portionsPerMeal,
        remainingPortions: stock.portions - planned * portionsPerMeal,
      };
    })
    .filter((entry) => entry.remainingMeals > 0);
  return { entries };
}

function freezerReason(portionsPerMeal: number, remainingPortions: number): MealReason {
  const plural = (count: number) => (count > 1 ? "s" : "");
  return {
    kind: "freezer",
    label: `Au congélateur : ${portionsPerMeal} portion${plural(portionsPerMeal)} utilisée${plural(portionsPerMeal)}, ${remainingPortions} restante${plural(remainingPortions)}`,
  };
}

export function reserveFreezerSlots(
  plan: FreezerPlan,
  openSlots: readonly OpenSlot[],
  categoryOf: (code: string) => string | null,
  random: () => number,
): Record<string, FreezerReservation> {
  const taken = new Map<string, { slot: OpenSlot; recipeCode: string }>();
  for (const entry of plan.entries) {
    const category = categoryOf(entry.recipeCode);
    for (let meal = 0; meal < entry.remainingMeals; meal += 1) {
      const reserved = [...taken.values()];
      const options = openSlots.filter((slot) =>
        !taken.has(slot.key)
        && slot.candidateCodes.has(entry.recipeCode)
        && reserved.every((other) => {
          const gap = Math.abs(other.slot.index - slot.index);
          if (other.recipeCode === entry.recipeCode && gap < MIN_FREEZER_GAP) return false;
          const sameCategory = category !== null && categoryOf(other.recipeCode) === category;
          return !(sameCategory && (gap === 1 || other.slot.date === slot.date));
        }),
      );
      const picked = pickRandom(options, random);
      if (!picked) break;
      taken.set(picked.key, { slot: picked, recipeCode: entry.recipeCode });
    }
  }

  const result: Record<string, FreezerReservation> = {};
  for (const entry of plan.entries) {
    const slots = [...taken.values()]
      .filter((item) => item.recipeCode === entry.recipeCode)
      .sort((a, b) => a.slot.index - b.slot.index);
    slots.forEach((item, position) => {
      const remaining = entry.remainingPortions - (position + 1) * entry.portionsPerMeal;
      result[item.slot.key] = { recipeCode: entry.recipeCode, reason: freezerReason(entry.portionsPerMeal, remaining) };
    });
  }
  return result;
}
