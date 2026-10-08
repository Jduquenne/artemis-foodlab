import { RecipeBuilderState } from "../../core/domain/recipeBuilderTypes";
import { RecipeDetails } from "../../core/domain/recipe";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useBuilderSourceRecipe(state: RecipeBuilderState): RecipeDetails | undefined {
  const recipes = useRecipesSnapshot();
  const source = state.sourceCode ? recipes[state.sourceCode] : undefined;
  return source?.apiId ? source : undefined;
}
