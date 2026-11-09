import { BaseVersion, BaseVersionChoice } from "../../domain/baseVersion";
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
