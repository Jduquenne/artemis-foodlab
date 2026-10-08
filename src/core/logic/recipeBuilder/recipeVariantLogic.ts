import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";

export function validateVariantName(name: string, sourceName: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Le nom de la variante est obligatoire.";
  if (trimmed.toLowerCase() === sourceName.trim().toLowerCase()) return "Le nom doit être différent de la recette d'origine.";
  return null;
}

export function toVariantDraft(state: RecipeBuilderState, name: string, recipeNumber: string): RecipeBuilderState {
  return {
    ...state,
    sourceCode: null,
    name: name.trim(),
    recipeNumber,
    ingredients: state.ingredients.map((ingredient) => ({ ...ingredient, id: crypto.randomUUID(), apiId: undefined })),
  };
}
