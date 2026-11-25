import { BaseVersion, BaseVersionChoice, SelectableBaseVersion } from "../../domain/baseVersion";
import { Food } from "../../domain/ingredient";
import { MealSlot } from "../../domain/planning";
import { IndustrialEquivalent, RecipeDetails } from "../../domain/recipe";
import { formatQty } from "../unit/unitFormatLogic";

export function reachableBaseCodes(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>): Set<string> {
  const found = new Set<string>();
  const visited = new Set<string>([recipe.code]);
  const queue: RecipeDetails[] = [recipe];
  for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
    for (const ingredient of current.ingredients) {
      if (ingredient.link !== "base") continue;
      const base = recipes[ingredient.baseId];
      if (!base) continue;
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

export function setBaseVersion(
  choices: readonly BaseVersionChoice[],
  baseCode: string,
  version: SelectableBaseVersion | null,
): BaseVersionChoice[] {
  const others = choices.filter((choice) => choice.baseCode !== baseCode);
  return version === null ? others : [...others, { baseCode, version }];
}

export function hasFrozenChoice(choices: readonly BaseVersionChoice[] | undefined): boolean {
  return (choices ?? []).some((choice) => choice.version === "frozen");
}

export function hasFrozenBase(slot: Pick<MealSlot, "baseVersionChoices">): boolean {
  return Object.values(slot.baseVersionChoices ?? {}).some(hasFrozenChoice);
}

export function withoutFrozenBases(choices: readonly BaseVersionChoice[]): BaseVersionChoice[] {
  return choices.filter((choice) => choice.version !== "frozen");
}

function choiceKey(choice: BaseVersionChoice): string {
  const link = choice.version === "frozen" ? `|${choice.freezerItemId}|${choice.quantity}` : "";
  return `${choice.baseCode}|${choice.version}${link}`;
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
        link: "food",
        foodId: food.id,
        foodGroupId: null,
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

export function hasNutritionData(food: Food): boolean {
  return Object.values(food.macros).some((value) => value > 0);
}

export interface ApplyBaseVersionsOptions {
  requireNutrition?: boolean;
}

export function applyBaseVersions(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  choices: readonly BaseVersionChoice[] | undefined,
  foods: Record<string, Food>,
  options: ApplyBaseVersionsOptions = {},
): Record<string, RecipeDetails> {
  if (!choices || choices.length === 0) return recipes;
  const reachable = reachableBaseCodes(recipe, recipes);
  const substitutes: Record<string, RecipeDetails> = {};
  for (const choice of choices) {
    const base = recipes[choice.baseCode];
    if (choice.version !== "industrial" || !reachable.has(choice.baseCode) || !base) continue;
    const equivalentFood = base.industrialEquivalent ? foods[base.industrialEquivalent.foodId] : undefined;
    if (options.requireNutrition && (!equivalentFood || !hasNutritionData(equivalentFood))) continue;
    const substitute = industrialBaseRecipe(base, foods);
    if (substitute) substitutes[choice.baseCode] = substitute;
  }
  return Object.keys(substitutes).length === 0 ? recipes : { ...recipes, ...substitutes };
}

export type FrozenBaseChoice = Extract<BaseVersionChoice, { version: "frozen" }>;

export function findFrozenChoice(choices: readonly BaseVersionChoice[] | undefined, baseCode: string): FrozenBaseChoice | null {
  const choice = choices?.find((candidate) => candidate.baseCode === baseCode);
  return choice?.version === "frozen" ? choice : null;
}

export function versionableBases(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  choices: readonly BaseVersionChoice[] | undefined,
): RecipeDetails[] {
  return [...reachableBaseCodes(recipe, recipes)].flatMap((code) => {
    const base = recipes[code];
    return base && (base.industrialEquivalent || findFrozenChoice(choices, code)) ? [base] : [];
  });
}

export function selectBaseVersion(
  current: readonly BaseVersionChoice[],
  initial: readonly BaseVersionChoice[],
  baseCode: string,
  version: BaseVersion,
): BaseVersionChoice[] {
  if (version !== "frozen") return setBaseVersion(current, baseCode, version === "industrial" ? "industrial" : null);
  const frozen = findFrozenChoice(initial, baseCode);
  return frozen ? [...current.filter((choice) => choice.baseCode !== baseCode), frozen] : [...current];
}

export function isFrozenChoice(choices: readonly BaseVersionChoice[] | undefined, baseCode: string): boolean {
  return findBaseVersion(choices, baseCode) === "frozen";
}

export function applyFrozenBases(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  choices: readonly BaseVersionChoice[] | undefined,
): Record<string, RecipeDetails> {
  const frozen = (choices ?? []).filter((choice) => choice.version === "frozen");
  if (frozen.length === 0) return recipes;
  const reachable = reachableBaseCodes(recipe, recipes);
  const emptied: Record<string, RecipeDetails> = {};
  for (const choice of frozen) {
    const base = recipes[choice.baseCode];
    if (base && reachable.has(choice.baseCode)) emptied[choice.baseCode] = { ...base, ingredients: [] };
  }
  return Object.keys(emptied).length === 0 ? recipes : { ...recipes, ...emptied };
}

export function industrialEquivalentLabel(equivalent: IndustrialEquivalent, foods: Record<string, Food>): string {
  const name = foods[equivalent.foodId]?.name ?? equivalent.foodId;
  return `${name} · ${formatQty(equivalent.quantity)} ${equivalent.unit} / portion`.replace("  ", " ");
}
