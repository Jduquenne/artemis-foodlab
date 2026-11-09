import { BaseVersion, BaseVersionChoice } from "../../domain/baseVersion";
import { Food } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";

export function reachableBaseCodes(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>): Set<string> {
  const found = new Set<string>();
  const visited = new Set<string>([recipe.code]);
  const queue: RecipeDetails[] = [recipe];
  for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
    for (const ingredient of current.ingredients) {
      const base = ingredient.baseId ? recipes[ingredient.baseId] : undefined;
      if (!ingredient.baseId || !base) continue;
      found.add(ingredient.baseId);
      if (visited.has(ingredient.baseId)) continue;
      visited.add(ingredient.baseId);
      queue.push(base);
    }
  }
  return found;
}

export function reachableIndustrialBases(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>): RecipeDetails[] {
  return [...reachableBaseCodes(recipe, recipes)]
    .map((code) => recipes[code])
    .filter((base): base is RecipeDetails => base !== undefined && base.industrialEquivalent !== undefined);
}

export function findBaseVersion(choices: readonly BaseVersionChoice[] | undefined, baseCode: string): BaseVersion | null {
  return choices?.find((choice) => choice.baseCode === baseCode)?.version ?? null;
}

export function setBaseVersion(choices: readonly BaseVersionChoice[], baseCode: string, version: BaseVersion | null): BaseVersionChoice[] {
  const others = choices.filter((choice) => choice.baseCode !== baseCode);
  return version === null ? others : [...others, { baseCode, version }];
}

function choiceKey(choice: BaseVersionChoice): string {
  return `${choice.baseCode}|${choice.version}`;
}

export function sameBaseVersionChoices(
  a: readonly BaseVersionChoice[] | undefined,
  b: readonly BaseVersionChoice[] | undefined,
): boolean {
  const left = (a ?? []).map(choiceKey).sort();
  const right = (b ?? []).map(choiceKey).sort();
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function pruneBaseVersionChoices(
  choices: BaseVersionChoice[],
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
): BaseVersionChoice[] {
  const reachable = reachableBaseCodes(recipe, recipes);
  const kept = choices.filter((choice) => reachable.has(choice.baseCode));
  return kept.length === choices.length ? choices : kept;
}

export function industrialBaseRecipe(base: RecipeDetails, foods: Record<string, Food>): RecipeDetails | null {
  const equivalent = base.industrialEquivalent;
  const food = equivalent ? foods[equivalent.foodId] : undefined;
  if (!equivalent || !food) return null;
  return {
    ...base,
    ingredients: [
      {
        id: `industrial-${base.code}`,
        name: food.name,
        quantity: equivalent.quantity * Math.max(base.defaultPortions, 1),
        unit: equivalent.unit,
        category: food.category,
        foodId: food.id,
      },
    ],
  };
}

export function isIndustrialChoice(
  choices: readonly BaseVersionChoice[] | undefined,
  base: RecipeDetails,
  foods: Record<string, Food>,
): boolean {
  return findBaseVersion(choices, base.code) === "industrial" && industrialBaseRecipe(base, foods) !== null;
}

export function applyBaseVersions(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  choices: readonly BaseVersionChoice[] | undefined,
  foods: Record<string, Food>,
): Record<string, RecipeDetails> {
  if (!choices || choices.length === 0) return recipes;
  const reachable = reachableBaseCodes(recipe, recipes);
  const substitutes: Record<string, RecipeDetails> = {};
  for (const choice of choices) {
    const base = recipes[choice.baseCode];
    if (choice.version !== "industrial" || !reachable.has(choice.baseCode) || !base) continue;
    const substitute = industrialBaseRecipe(base, foods);
    if (substitute) substitutes[choice.baseCode] = substitute;
  }
  return Object.keys(substitutes).length === 0 ? recipes : { ...recipes, ...substitutes };
}
