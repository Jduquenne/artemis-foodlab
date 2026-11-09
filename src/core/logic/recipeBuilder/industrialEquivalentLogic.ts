import { Food, Unit } from "../../domain/ingredient";
import { IndustrialEquivalent } from "../../domain/recipe";
import { IndustrialEquivalentDraft } from "../../domain/recipeBuilderTypes";
import { isUnit } from "../unit/unitLogic";

export interface ApiIndustrialEquivalent {
  foodId: string;
  quantity: number;
  unit: string;
}

export function emptyIndustrialDraft(): IndustrialEquivalentDraft {
  return { foodId: null, quantity: null, unit: Unit.G };
}

export function industrialDraftFromRecipe(equivalent: IndustrialEquivalent | null | undefined): IndustrialEquivalentDraft | null {
  if (!equivalent) return null;
  return { foodId: equivalent.foodId, quantity: equivalent.quantity, unit: equivalent.unit };
}

export function isIndustrialDraftComplete(draft: IndustrialEquivalentDraft | null | undefined): draft is IndustrialEquivalentDraft & { foodId: string; quantity: number } {
  return draft != null && draft.foodId !== null && draft.quantity !== null && draft.quantity > 0 && draft.unit !== Unit.NONE;
}

export function pickIndustrialFood(draft: IndustrialEquivalentDraft, food: Food): IndustrialEquivalentDraft {
  return { ...draft, foodId: food.id, unit: isUnit(food.unit) && food.unit !== Unit.NONE ? food.unit : draft.unit };
}

export function industrialDraftToApi(draft: IndustrialEquivalentDraft | null | undefined, isBase: boolean): ApiIndustrialEquivalent | null {
  if (!isBase || !isIndustrialDraftComplete(draft)) return null;
  return { foodId: draft.foodId, quantity: draft.quantity, unit: draft.unit };
}

export function validateIndustrialDraft(draft: IndustrialEquivalentDraft | null | undefined, isBase: boolean): string[] {
  if (!isBase || draft == null || isIndustrialDraftComplete(draft)) return [];
  return ["Version industrielle : choisis un aliment et une quantité supérieure à 0 par portion de la base."];
}

export function mapApiIndustrialEquivalent(api: ApiIndustrialEquivalent | null | undefined): IndustrialEquivalent | undefined {
  if (!api) return undefined;
  return { foodId: api.foodId, quantity: api.quantity, unit: isUnit(api.unit) ? api.unit : Unit.NONE };
}
