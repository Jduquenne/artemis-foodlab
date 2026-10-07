import { HouseholdItem } from "../../domain/household";
import { ConsolidatedIngredient, IngredientSource } from "../../domain/shopping";
import { ApiItemCheck, ApiShoppingExtra, ApiSourceCheck } from "./shoppingApiMapper";
import { buildSourceCheckKey } from "./shoppingChecks";

export interface ShoppingCheckState {
  keyToFoodId: Map<string, string>;
  itemCheckByFoodId: Map<string, ApiItemCheck>;
  itemCheckByHouseholdId: Map<string, ApiItemCheck>;
  checked: Set<string>;
  stocks: Record<string, number>;
  freezerSelection: Record<string, string[]>;
  sourceChecked: Set<string>;
  sourceCheckIdByKey: Map<string, string>;
}

export interface SourceToggle {
  ingredientKey: string;
  sources: IngredientSource[];
}

export interface SourceCheckRequest {
  localKey: string;
  target: { foodId: string; recipeId: string; day: string; slot: string };
}

export function buildShoppingCheckState(
  ingredients: ConsolidatedIngredient[],
  householdItems: HouseholdItem[],
  itemChecks: ApiItemCheck[],
  sourceChecks: ApiSourceCheck[],
  extras: ApiShoppingExtra[],
  recipeCodeOf: (recipeApiId: string) => string,
): ShoppingCheckState {
  const keyToFoodId = new Map<string, string>();
  const keysByFoodId = new Map<string, string[]>();
  for (const ing of ingredients) {
    if (!ing.foodId) continue;
    keyToFoodId.set(ing.key, ing.foodId);
    keysByFoodId.set(ing.foodId, [...(keysByFoodId.get(ing.foodId) ?? []), ing.key]);
  }

  const itemCheckByFoodId = new Map<string, ApiItemCheck>();
  const itemCheckByHouseholdId = new Map<string, ApiItemCheck>();
  for (const ic of itemChecks) {
    if (ic.foodId) itemCheckByFoodId.set(ic.foodId, ic);
    if (ic.householdItemId) itemCheckByHouseholdId.set(ic.householdItemId, ic);
  }

  const checked = new Set<string>();
  const stocks: Record<string, number> = {};
  const freezerSelection: Record<string, string[]> = {};
  for (const [key, foodId] of keyToFoodId) {
    const ic = itemCheckByFoodId.get(foodId);
    if (!ic) continue;
    if (ic.isChecked) checked.add(key);
    if (ic.stock > 0) stocks[key] = ic.stock;
    if (ic.freezerBagIds.length > 0) freezerSelection[key] = ic.freezerBagIds;
  }
  for (const item of householdItems) {
    if (itemCheckByHouseholdId.get(item.id)?.isChecked) checked.add(`household::${item.id}`);
  }
  for (const extra of extras) {
    if (extra.isChecked) checked.add(`extra::${extra.id}`);
  }

  const sourceChecked = new Set<string>();
  const sourceCheckIdByKey = new Map<string, string>();
  for (const sc of sourceChecks) {
    const source = { recipeId: recipeCodeOf(sc.recipeId), day: sc.day, slot: sc.slot };
    for (const key of keysByFoodId.get(sc.foodId) ?? []) {
      const localKey = buildSourceCheckKey(key, source);
      sourceCheckIdByKey.set(localKey, sc.id);
      if (sc.isChecked) sourceChecked.add(localKey);
    }
  }

  return {
    keyToFoodId,
    itemCheckByFoodId,
    itemCheckByHouseholdId,
    checked,
    stocks,
    freezerSelection,
    sourceChecked,
    sourceCheckIdByKey,
  };
}

export function collectSourceCheckRequests(
  toggles: SourceToggle[],
  keyToFoodId: Map<string, string>,
  recipeApiIdOf: (recipeCode: string) => string,
): SourceCheckRequest[] {
  const requests = new Map<string, SourceCheckRequest>();
  for (const { ingredientKey, sources } of toggles) {
    const foodId = keyToFoodId.get(ingredientKey);
    if (!foodId) continue;
    for (const source of sources) {
      const recipeId = recipeApiIdOf(source.recipeId);
      const apiKey = `${foodId}::${recipeId}::${source.day}::${source.slot}`;
      if (requests.has(apiKey)) continue;
      requests.set(apiKey, {
        localKey: buildSourceCheckKey(ingredientKey, source),
        target: { foodId, recipeId, day: source.day, slot: source.slot },
      });
    }
  }
  return [...requests.values()];
}
