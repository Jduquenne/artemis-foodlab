import { RecipeUsageItem } from "../../domain/planningUsage";
import { RecipeDetails } from "../../domain/recipe";

export const PICKER_SUGGESTION_SIZE = 6;

export interface PickerSuggestionSection {
  key: "recent" | "frequent" | "season";
  label: string;
  recipeIds: string[];
}

export function pickerSuggestions(
  usage: readonly RecipeUsageItem[],
  recipes: Record<string, RecipeDetails>,
  seasonalIds: ReadonlySet<string>,
): PickerSuggestionSection[] {
  const known = usage.filter((item) => item.code in recipes);
  const taken = new Set<string>();
  const take = (codes: readonly string[]): string[] => {
    const picked = codes.filter((code) => !taken.has(code)).slice(0, PICKER_SUGGESTION_SIZE);
    picked.forEach((code) => taken.add(code));
    return picked;
  };
  const recent = take([...known].sort((a, b) => b.lastWeek.localeCompare(a.lastWeek) || b.plannedCount - a.plannedCount).map((item) => item.code));
  const frequent = take(known.filter((item) => item.plannedCount > 1).map((item) => item.code));
  const recentlyPlanned = new Set(recent);
  const season = take(
    [...seasonalIds]
      .filter((code) => !recentlyPlanned.has(code))
      .sort((a, b) => (recipes[a]?.name ?? "").localeCompare(recipes[b]?.name ?? "", "fr")),
  );
  return [
    { key: "recent" as const, label: "Récents", recipeIds: recent },
    { key: "frequent" as const, label: "Souvent planifiés", recipeIds: frequent },
    { key: "season" as const, label: "De saison", recipeIds: season },
  ].filter((section) => section.recipeIds.length > 0);
}
