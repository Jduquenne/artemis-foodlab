import { RecipeDetails, RecipeKind } from "../../domain/types";
import { getCategoryById } from "../../domain/categories";
import { isBase, isDessert, isDish, isIngredient } from "../../domain/recipePredicates";

export type RecipeKindFilter = RecipeKind | "all" | "dessert";

export const RECIPE_KIND_LABELS: Record<RecipeKind, string> = {
  [RecipeKind.DISH]: "Plat",
  [RecipeKind.INGREDIENT]: "Ingrédient",
  [RecipeKind.BASE]: "Base",
};

export const RECIPE_KIND_FILTERS: { id: RecipeKindFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: RecipeKind.DISH, label: "Plats" },
  { id: RecipeKind.INGREDIENT, label: "Ingrédients" },
  { id: RecipeKind.BASE, label: "Bases" },
  { id: "dessert", label: "Desserts" },
];

export function sortRecipes(recipes: RecipeDetails[]): RecipeDetails[] {
  return [...recipes].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function matchesKind(recipe: RecipeDetails, kind: RecipeKindFilter): boolean {
  if (kind === "all") return true;
  if (kind === "dessert") return isDessert(recipe);
  if (kind === RecipeKind.DISH) return isDish(recipe);
  if (kind === RecipeKind.INGREDIENT) return isIngredient(recipe);
  return isBase(recipe);
}

export function filterRecipes(
  recipes: RecipeDetails[],
  query: string,
  kind: RecipeKindFilter,
): RecipeDetails[] {
  const needle = query.trim().toLowerCase();
  return recipes.filter((recipe) => {
    if (!matchesKind(recipe, kind)) return false;
    if (!needle) return true;
    const category = getCategoryById(recipe.categoryId)?.name ?? "";
    return (
      recipe.name.toLowerCase().includes(needle) ||
      category.toLowerCase().includes(needle)
    );
  });
}
