import { RecipeDetails } from "../../domain/types";

export const RECENT_RECIPE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface NewsGroup {
  date: string;
  recipes: RecipeDetails[];
}

function localDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNewsGroups(
  recipes: Record<string, RecipeDetails>,
  now: Date = new Date(),
  windowDays: number = RECENT_RECIPE_DAYS,
): NewsGroup[] {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  const byDate = new Map<string, RecipeDetails[]>();

  for (const recipe of Object.values(recipes)) {
    if (!recipe.announcedAt) continue;
    const timestamp = new Date(recipe.announcedAt).getTime();
    if (Number.isNaN(timestamp) || timestamp < cutoff) continue;
    const key = localDateKey(recipe.announcedAt);
    const list = byDate.get(key) ?? [];
    list.push(recipe);
    byDate.set(key, list);
  }

  return [...byDate.entries()]
    .map(([date, list]) => ({
      date,
      recipes: [...list].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function latestNewsDate(groups: NewsGroup[]): string {
  return groups[0]?.date ?? "";
}
