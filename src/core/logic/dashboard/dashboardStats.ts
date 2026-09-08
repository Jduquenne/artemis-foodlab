import { Food, Macronutrients, OutdoorEntry, RecipeDetails } from "../../domain/types";
import { Category } from "../../domain/categories";
import { isBase, isDish, isIngredient } from "../../domain/recipePredicates";

export interface CatalogueCounts {
  recipes: number;
  dishes: number;
  ingredients: number;
  bases: number;
  desserts: number;
  outdoorActivities: number;
  foods: number;
  categories: number;
}

export interface CatalogueIssue {
  key: string;
  label: string;
  names: string[];
}

export interface CatalogueHealth {
  issueCount: number;
  flaggedItems: number;
}

export function getCatalogueHealth(issues: CatalogueIssue[]): CatalogueHealth {
  return {
    issueCount: issues.length,
    flaggedItems: issues.reduce((sum, issue) => sum + issue.names.length, 0),
  };
}

export interface CategoryBreakdownRow {
  id: string;
  name: string;
  color: string;
  recipes: number;
}

export function getCatalogueCounts(
  recipes: Record<string, RecipeDetails>,
  outdoor: Record<string, OutdoorEntry>,
  foods: Record<string, Food>,
  categories: Category[],
): CatalogueCounts {
  const list = Object.values(recipes);
  return {
    recipes: list.length,
    dishes: list.filter(isDish).length,
    ingredients: list.filter(isIngredient).length,
    bases: list.filter(isBase).length,
    desserts: list.filter((r) => r.isDessert).length,
    outdoorActivities: Object.keys(outdoor).length,
    foods: Object.keys(foods).length,
    categories: categories.length,
  };
}

export function getCategoryBreakdown(
  recipes: Record<string, RecipeDetails>,
  categories: Category[],
): CategoryBreakdownRow[] {
  const perCategory = new Map<string, number>();
  for (const recipe of Object.values(recipes)) {
    perCategory.set(recipe.categoryId, (perCategory.get(recipe.categoryId) ?? 0) + 1);
  }
  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      recipes: perCategory.get(category.id) ?? 0,
    }))
    .sort((a, b) => b.recipes - a.recipes);
}

function isEmptyMacros(macros: Macronutrients): boolean {
  return macros.kcal === 0 && macros.proteins === 0 && macros.lipids === 0 && macros.carbohydrates === 0 && macros.fibers === 0;
}

export function getCatalogueIssues(
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  recipeMacros: Record<string, Macronutrients>,
): CatalogueIssue[] {
  const recipeList = Object.values(recipes);
  const usedFoodIds = new Set<string>();
  for (const recipe of recipeList) {
    for (const ingredient of recipe.ingredients) {
      if (ingredient.foodId) usedFoodIds.add(ingredient.foodId);
    }
  }

  const noPhoto = recipeList.filter((r) => !r.assets?.mealPhoto?.url);
  const noMealType = recipeList.filter((r) => r.mealTypes.length === 0);
  const emptyDish = recipeList.filter((r) => isDish(r) && r.ingredients.length === 0);
  const unlinkedIngredients = recipeList.filter((r) =>
    r.ingredients.some((ing) => !ing.foodId && !ing.baseId),
  );
  const uncomputableMacros = recipeList.filter((r) => !recipeMacros[r.code]);
  const bookWithoutPage = recipeList.filter((r) => r.isFromBook && !r.bookPage);
  const unusedFoods = Object.values(foods).filter((f) => !usedFoodIds.has(f.id));
  const foodsWithoutMacros = Object.values(foods).filter((f) => isEmptyMacros(f.macros));

  return [
    { key: "no-photo", label: "Recettes sans photo", names: noPhoto.map((r) => r.name) },
    { key: "no-meal-type", label: "Recettes sans type de repas", names: noMealType.map((r) => r.name) },
    { key: "empty-dish", label: "Plats sans ingrédient", names: emptyDish.map((r) => r.name) },
    { key: "unlinked-ingredients", label: "Recettes avec un ingrédient non lié (ni aliment ni base)", names: unlinkedIngredients.map((r) => r.name) },
    { key: "uncomputable-macros", label: "Recettes dont les macros ne se calculent pas", names: uncomputableMacros.map((r) => r.name) },
    { key: "book-without-page", label: "Recettes « du livre » sans numéro de page", names: bookWithoutPage.map((r) => r.name) },
    { key: "unused-foods", label: "Aliments jamais utilisés dans une recette", names: unusedFoods.map((f) => f.name) },
    { key: "foods-without-macros", label: "Aliments sans valeurs nutritionnelles", names: foodsWithoutMacros.map((f) => f.name) },
  ].filter((issue) => issue.names.length > 0);
}
