import { RecipeDetails } from "../domain/types";
import { typedRecipesDb } from "../typed-db/typedRecipesDb";

export function getLinkedBases(
  recipe: Pick<RecipeDetails, "ingredients">,
): { id: string; name: string; photoUrl: string }[] {
  const seen = new Set<string>();
  const result: { id: string; name: string; photoUrl: string }[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.baseId && !seen.has(ing.baseId)) {
      seen.add(ing.baseId);
      const base = typedRecipesDb[ing.baseId];
      if (base?.assets?.photo) {
        result.push({ id: ing.baseId, name: base.name, photoUrl: base.assets.photo.url });
      }
    }
  }
  return result;
}
