import { Food, RecipeDetails } from "../../domain/types";
import { Category } from "../../domain/categories";
import { isDessert, isDish } from "../../domain/recipePredicates";
import { RecipeUsageItem } from "../../services/planningUsageService";

export interface DishUsage {
  code: string;
  name: string;
  categoryId: string;
  photoUrl?: string;
  plannedCount: number;
  lastWeek: string | null;
  foodIds: string[];
}

export interface UsageDistribution {
  never: number;
  once: number;
  occasional: number;
  regular: number;
}

export interface PlanningUsageInsights {
  totalDishes: number;
  distribution: UsageDistribution;
  mostPlanned: DishUsage[];
  toReview: DishUsage[];
}

export interface ReviewFilterOption {
  id: string;
  name: string;
  count: number;
}

export interface ReviewFilters {
  categoryId: string;
  foodId: string;
}

export const EMPTY_REVIEW_FILTERS: ReviewFilters = { categoryId: "", foodId: "" };

const TOP_COUNT = 6;
const OCCASIONAL_MAX = 4;
const REGULAR_MIN = 5;

function isMainDish(recipe: RecipeDetails): boolean {
  return isDish(recipe) && !isDessert(recipe);
}

export function buildPlanningUsageInsights(
  usage: RecipeUsageItem[],
  recipes: Record<string, RecipeDetails>,
): PlanningUsageInsights {
  const usageByCode = new Map(usage.map((item) => [item.code, item]));

  const all: DishUsage[] = Object.values(recipes)
    .filter(isMainDish)
    .map((recipe) => {
      const item = usageByCode.get(recipe.code);
      return {
        code: recipe.code,
        name: recipe.name,
        categoryId: recipe.categoryId,
        photoUrl: recipe.assets?.mealPhoto?.url,
        plannedCount: item?.plannedCount ?? 0,
        lastWeek: item?.lastWeek ?? null,
        foodIds: [
          ...new Set(recipe.ingredients.map((ing) => ing.foodId).filter((id): id is string => Boolean(id))),
        ],
      };
    });

  const distribution: UsageDistribution = {
    never: all.filter((d) => d.plannedCount === 0).length,
    once: all.filter((d) => d.plannedCount === 1).length,
    occasional: all.filter((d) => d.plannedCount >= 2 && d.plannedCount <= OCCASIONAL_MAX).length,
    regular: all.filter((d) => d.plannedCount >= REGULAR_MIN).length,
  };

  const mostPlanned = all
    .filter((d) => d.plannedCount > 0)
    .sort((a, b) => b.plannedCount - a.plannedCount || a.name.localeCompare(b.name, "fr"))
    .slice(0, TOP_COUNT);

  const toReview = all
    .filter((d) => d.plannedCount <= 1)
    .sort(
      (a, b) =>
        a.plannedCount - b.plannedCount ||
        (a.lastWeek ?? "").localeCompare(b.lastWeek ?? "") ||
        a.name.localeCompare(b.name, "fr"),
    );

  return {
    totalDishes: all.length,
    distribution,
    mostPlanned,
    toReview,
  };
}

export function getReviewFilterOptions(
  dishes: DishUsage[],
  foods: Record<string, Food>,
  categories: Category[],
): { categories: ReviewFilterOption[]; foods: ReviewFilterOption[] } {
  const perCategory = new Map<string, number>();
  const perFood = new Map<string, number>();

  for (const dish of dishes) {
    perCategory.set(dish.categoryId, (perCategory.get(dish.categoryId) ?? 0) + 1);
    for (const foodId of dish.foodIds) {
      perFood.set(foodId, (perFood.get(foodId) ?? 0) + 1);
    }
  }

  const categoryOptions: ReviewFilterOption[] = categories
    .filter((category) => perCategory.has(category.id))
    .map((category) => ({ id: category.id, name: category.name, count: perCategory.get(category.id) ?? 0 }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const foodOptions: ReviewFilterOption[] = [...perFood.entries()]
    .map(([id, count]) => ({ id, name: foods[id]?.name ?? id, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return { categories: categoryOptions, foods: foodOptions };
}

export function filterReviewDishes(dishes: DishUsage[], filters: ReviewFilters): DishUsage[] {
  return dishes.filter((dish) => {
    if (filters.categoryId && dish.categoryId !== filters.categoryId) return false;
    if (filters.foodId && !dish.foodIds.includes(filters.foodId)) return false;
    return true;
  });
}
