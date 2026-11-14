import { Unit } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { cookedWeightToApi } from "./cookedWeightLogic";

export function baseAllowsGrams(base: Pick<RecipeDetails, "cookedWeightGrams"> | undefined): boolean {
  return (base?.cookedWeightGrams ?? 0) > 0;
}

export function recipesUsingBaseInGrams(baseCode: string, recipes: Record<string, RecipeDetails>): RecipeDetails[] {
  return Object.values(recipes).filter(
    (recipe) => recipe.code !== baseCode && recipe.ingredients.some((ing) => ing.baseId === baseCode && ing.unit === Unit.G),
  );
}

export function validateBaseGrams(state: RecipeBuilderState, recipes: Record<string, RecipeDetails>): string[] {
  const errors: string[] = [];
  for (const ing of state.ingredients) {
    if (ing.ingredientType !== "base" || !ing.baseId || ing.unit !== Unit.G) continue;
    if (!baseAllowsGrams(recipes[ing.baseId])) {
      errors.push(`« ${ing.name} » est en grammes mais cette base n'a pas de poids cuit : renseigne-le ou repasse l'ingrédient en portions.`);
    }
  }
  const source = state.sourceCode ? recipes[state.sourceCode] : undefined;
  if (source && baseAllowsGrams(source) && cookedWeightToApi(state.cookedWeightGrams, state.categoryId) === null) {
    const count = recipesUsingBaseInGrams(source.code, recipes).length;
    if (count > 0) {
      errors.push(`Le poids cuit ne peut pas être retiré : ${count} recette${count > 1 ? "s" : ""} utilisent cette base en grammes. Repasse d'abord ces ingrédients en portions.`);
    }
  }
  return errors;
}
