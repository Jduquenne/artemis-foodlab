import { RecipeDetails } from "../../domain/recipe";
import { compareByName, compareText } from "../../../shared/utils/sortUtils";
import { groupBy } from "../../../shared/utils/collectionUtils";
import { padNumber } from "../../../shared/utils/numberUtils";

export const RECENT_RECIPE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface NewsGroup {
  date: string;
  recipes: RecipeDetails[];
}

function localDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1, 2);
  const day = padNumber(date.getDate(), 2);
  return `${year}-${month}-${day}`;
}

type AnnouncedRecipe = RecipeDetails & { announcedAt: string };

function isAnnouncedSince(recipe: RecipeDetails, cutoff: number): recipe is AnnouncedRecipe {
  if (!recipe.announcedAt) return false;
  const timestamp = new Date(recipe.announcedAt).getTime();
  return !Number.isNaN(timestamp) && timestamp >= cutoff;
}

export function getNewsGroups(
  recipes: Record<string, RecipeDetails>,
  now: Date = new Date(),
  windowDays: number = RECENT_RECIPE_DAYS,
): NewsGroup[] {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  const recentRecipes = Object.values(recipes).filter((recipe) => isAnnouncedSince(recipe, cutoff));
  const byDate = groupBy(recentRecipes, (recipe) => localDateKey(recipe.announcedAt));

  return [...byDate.entries()]
    .map(([date, list]) => ({
      date,
      recipes: [...list].sort(compareByName),
    }))
    .sort((a, b) => compareText(b.date, a.date));
}

export function latestNewsDate(groups: NewsGroup[]): string {
  return groups[0]?.date ?? "";
}
