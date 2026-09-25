import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { BaseEntry, ConsolidatedIngredient, IngredientSource, RecipeCard, RecipeCardIngredient } from "../../domain/shopping";
import { compareByName, compareText } from "../../../shared/utils/sortUtils";

export function groupAndSortSources(sources: IngredientSource[]): IngredientSource[][] {
  const seen = new Map<string, IngredientSource[]>();
  for (const src of sources) {
    const existing = seen.get(src.recipeId);
    if (existing) { existing.push(src); } else { seen.set(src.recipeId, [src]); }
  }
  return [...seen.values()].sort((a, b) => {
    const minA = a.reduce((m, s) => s.isoDate < m ? s.isoDate : m, a[0].isoDate);
    const minB = b.reduce((m, s) => s.isoDate < m ? s.isoDate : m, b[0].isoDate);
    return compareText(minA, minB);
  });
}

function accumulateIngredient(
  target: Map<string, RecipeCardIngredient>,
  ing: ConsolidatedIngredient,
  source: IngredientSource,
): void {
  const existing = target.get(ing.key);
  if (existing) {
    existing.quantity += source.quantity;
    existing.sources.push(source);
    return;
  }
  target.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
}

interface RecipeCardAccumulator {
  recipeId: string;
  recipeName: string;
  directIngs: Map<string, RecipeCardIngredient>;
  baseGroups: Map<string, { baseId: string; baseName: string; ings: Map<string, RecipeCardIngredient> }>;
}

export function buildRecipeCards(
  ingredients: ConsolidatedIngredient[],
  bases: BaseEntry[],
  recipes: Record<string, RecipeDetails>,
): RecipeCard[] {
  const recipeMap = new Map<string, RecipeCardAccumulator>();
  for (const ing of ingredients) {
    for (const source of ing.sources) {
      let recipe = recipeMap.get(source.recipeId);
      if (!recipe) {
        recipe = { recipeId: source.recipeId, recipeName: source.recipeName, directIngs: new Map(), baseGroups: new Map() };
        recipeMap.set(source.recipeId, recipe);
      }
      if (!source.fromBaseId) {
        accumulateIngredient(recipe.directIngs, ing, source);
        continue;
      }
      let baseGroup = recipe.baseGroups.get(source.fromBaseId);
      if (!baseGroup) {
        const baseName = bases.find((b) => b.baseId === source.fromBaseId)?.name ?? source.fromBaseId;
        baseGroup = { baseId: source.fromBaseId, baseName, ings: new Map() };
        recipe.baseGroups.set(source.fromBaseId, baseGroup);
      }
      accumulateIngredient(baseGroup.ings, ing, source);
    }
  }
  return Array.from(recipeMap.values())
    .filter((r) => recipes[r.recipeId]?.kind !== RecipeKind.INGREDIENT)
    .map((r) => ({
      recipeId: r.recipeId,
      recipeName: r.recipeName,
      directIngredients: Array.from(r.directIngs.values()).sort(compareByName),
      baseGroups: Array.from(r.baseGroups.values())
        .map((b) => ({ baseId: b.baseId, baseName: b.baseName, ingredients: Array.from(b.ings.values()).sort(compareByName) }))
        .sort((a, b) => compareText(a.baseName, b.baseName)),
    }))
    .sort((a, b) => compareText(a.recipeName, b.recipeName));
}
