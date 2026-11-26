import { SlotType } from "../domain/planning";
import { RecipeUsageItem } from "../domain/planningUsage";
import { apiFetchJson } from "./apiClient";

export async function getRecipeUsage(slots: readonly SlotType[] = ["lunch", "dinner"]): Promise<RecipeUsageItem[]> {
  const { items } = await apiFetchJson<{ items: RecipeUsageItem[] }>(
    `/planning-slots/recipe-usage?slots=${slots.join(",")}`,
  );
  return items;
}
