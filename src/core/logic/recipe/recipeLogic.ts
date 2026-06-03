import { RecipeDetails } from "../../domain/types";
import { typedRecipesDb } from "../../typed-db/typedRecipesDb";
import { OutdoorEntry, typedOutdoorDb } from "../../typed-db/typedOutdoorDb";

export function searchOutdoorRecipes(query: string): OutdoorEntry[] {
  const q = query.toLowerCase();
  return Object.values(typedOutdoorDb).filter(e => !q || e.name.toLowerCase().includes(q));
}

export function getLinkedBases(
  recipe: Pick<RecipeDetails, "ingredients">,
): { id: string; name: string }[] {
  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.baseId && !seen.has(ing.baseId)) {
      seen.add(ing.baseId);
      const base = typedRecipesDb[ing.baseId];
      if (base?.assets?.mealPhoto) {
        result.push({ id: ing.baseId, name: base.name });
      }
    }
  }
  return result;
}
