import { apiFetchJson } from "./apiClient";

export interface RecipeUsageItem {
  code: string;
  plannedCount: number;
  firstWeek: string;
  lastWeek: string;
}

export async function getRecipeUsage(): Promise<RecipeUsageItem[]> {
  const { items } = await apiFetchJson<{ items: RecipeUsageItem[] }>(
    "/planning-slots/recipe-usage?slots=lunch,dinner",
  );
  return items;
}
