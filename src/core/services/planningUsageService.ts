import { RecipeUsageItem } from "../domain/planningUsage";
import { apiFetchJson } from "./apiClient";

export async function getRecipeUsage(): Promise<RecipeUsageItem[]> {
  const { items } = await apiFetchJson<{ items: RecipeUsageItem[] }>(
    "/planning-slots/recipe-usage?slots=lunch,dinner",
  );
  return items;
}
