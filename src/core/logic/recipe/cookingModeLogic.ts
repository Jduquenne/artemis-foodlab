import { Ingredient } from "../../domain/ingredient";
import { isRemovedIngredient } from "../../domain/ingredientPredicates";
import { RecipeDetails } from "../../domain/recipe";
import { formatQty, pluralizeUnit } from "../unit/unitFormatLogic";
import { basePortionsOf } from "./cookedWeightLogic";

export interface CookingLine {
  key: string;
  name: string;
  quantityLabel: string;
  preparation: string | null;
}

export interface CookingGroup {
  key: string;
  title: string | null;
  lines: CookingLine[];
}

function quantityLabel(ingredient: Ingredient, scale: number): string {
  if (ingredient.quantity === null) return "";
  const quantity = Math.round(ingredient.quantity * scale * 10) / 10;
  return `${formatQty(quantity)} ${pluralizeUnit(ingredient.unit, quantity)}`.trim();
}

function lineOf(ingredient: Ingredient, scale: number, keyPrefix: string): CookingLine {
  return {
    key: `${keyPrefix}${ingredient.id}`,
    name: ingredient.name,
    quantityLabel: quantityLabel(ingredient, scale),
    preparation: ingredient.preparation ?? null,
  };
}

function collect(
  recipe: RecipeDetails,
  scale: number,
  recipes: Record<string, RecipeDetails>,
  visited: ReadonlySet<string>,
  keyPrefix: string,
  title: string | null,
  groups: CookingGroup[],
  removed: CookingLine[],
): void {
  const own: CookingLine[] = [];
  for (const ingredient of recipe.ingredients) {
    if (isRemovedIngredient(ingredient)) {
      removed.push(lineOf(ingredient, scale, keyPrefix));
      continue;
    }
    const base = ingredient.link === "base" ? recipes[ingredient.baseId] : undefined;
    if (ingredient.link === "base" && base && !visited.has(base.code) && base.defaultPortions > 0 && ingredient.quantity !== null) {
      const basePortions = basePortionsOf(ingredient.quantity, ingredient.unit, base) ?? 0;
      collect(base, (scale * basePortions) / base.defaultPortions, recipes, new Set([...visited, base.code]), `${keyPrefix}${ingredient.id}/`, base.name, groups, removed);
      continue;
    }
    own.push(lineOf(ingredient, scale, keyPrefix));
  }
  if (own.length > 0) groups.push({ key: keyPrefix || "root", title, lines: own });
}

export function cookingGroups(recipe: RecipeDetails, portions: number, recipes: Record<string, RecipeDetails>): CookingGroup[] {
  if (recipe.defaultPortions <= 0 || portions <= 0) return [];
  const groups: CookingGroup[] = [];
  const removed: CookingLine[] = [];
  collect(recipe, portions / recipe.defaultPortions, recipes, new Set([recipe.code]), "", null, groups, removed);
  const ordered = [...groups.filter((g) => g.title === null), ...groups.filter((g) => g.title !== null)];
  return removed.length > 0 ? [...ordered, { key: "removed", title: "À retirer pendant la préparation", lines: removed }] : ordered;
}

export function instructionSteps(instructions: string | null): string[] {
  return (instructions ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}
