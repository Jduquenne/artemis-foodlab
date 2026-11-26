import { addDays } from "date-fns";
import { ChefHat, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { findNextMeal, weekKeyOf } from "../../../core/logic/planning/nextMealLogic";
import { buildRecipeDetailUrl } from "../../../core/logic/recipe/recipeScalingLogic";
import { usePlannedWeek } from "../../hooks/usePlannedWeek";
import { useRecipesSnapshot } from "../../hooks/useCatalogueSnapshot";

export const NextMealLink = () => {
  const navigate = useNavigate();
  const recipes = useRecipesSnapshot();
  const now = new Date();
  const today = weekKeyOf(now);
  const tomorrow = weekKeyOf(addDays(now, 1));
  const thisWeek = usePlannedWeek(today.year, today.week);
  const nextWeek = usePlannedWeek(tomorrow.year, tomorrow.week);
  const nextMeal = findNextMeal([...thisWeek, ...nextWeek], now, (code) => code in recipes);
  const recipe = nextMeal ? recipes[nextMeal.recipeId] : undefined;
  if (!nextMeal || !recipe) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(buildRecipeDetailUrl(nextMeal.recipeId, nextMeal.persons))}
      className="shrink-0 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-left hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
    >
      <ChefHat className="w-4 h-4 text-orange-500 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
        <span className="font-bold text-orange-600">{nextMeal.label} :</span> {recipe.name}
      </span>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
};
