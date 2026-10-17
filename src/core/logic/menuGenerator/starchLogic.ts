import { Food, IngredientCategory } from "../../domain/ingredient";

export const STARCH_SCORE = 3;

export function starchFoodIds(foodIds: ReadonlySet<string>, foods: Record<string, Food>): Set<string> {
  return new Set([...foodIds].filter((foodId) => foods[foodId]?.category === IngredientCategory.STARCH));
}

function runLength(starch: string, meals: readonly ReadonlySet<string>[]): number {
  let length = 0;
  for (const meal of meals) {
    if (!meal.has(starch)) break;
    length += 1;
  }
  return length;
}

export function starchRunViolations(
  candidate: ReadonlySet<string>,
  previous: readonly ReadonlySet<string>[],
  next: readonly ReadonlySet<string>[],
  max: number,
): string[] {
  const before = [...previous].reverse();
  return [...candidate].filter((starch) => runLength(starch, before) + 1 + runLength(starch, next) > max);
}
