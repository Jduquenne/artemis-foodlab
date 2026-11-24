import { DraftIngredient, DraftIngredientCommon, RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { emptyDraftIngredientCommon, initialRecipeBuilderState } from "./recipeBuilderState";
import { buildRecipeDbId } from "./recipeCodeLogic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateDraftV2ToV3(persisted: unknown): RecipeBuilderState | null {
  if (!isRecord(persisted) || !isRecord(persisted.draft)) return null;
  const { fromBook, ...rest } = persisted.draft;
  return { ...initialRecipeBuilderState(), ...rest, isFromBook: fromBook === true };
}

export function migrateDraftV3ToV4(persisted: unknown): RecipeBuilderState | null {
  if (!isRecord(persisted) || !isRecord(persisted.draft)) return null;
  const draft: RecipeBuilderState = { ...initialRecipeBuilderState(), ...persisted.draft };
  return { ...draft, sourceCode: draft.recipeNumber.trim() ? buildRecipeDbId(draft.categoryId, draft.recipeNumber) : null };
}

function idOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function migrateIngredientV4ToV5(value: unknown): DraftIngredient[] {
  if (!isRecord(value)) return [];
  const { ingredientType, foodId, baseId, foodGroupId, ...rest } = value;
  const common: DraftIngredientCommon = { ...emptyDraftIngredientCommon(), ...rest };
  return ingredientType === "base"
    ? [{ ...common, ingredientType: "base", baseId: idOrNull(baseId) }]
    : [{ ...common, ingredientType: "food", foodId: idOrNull(foodId), foodGroupId: idOrNull(foodGroupId) }];
}

export function migrateDraftV4ToV5(persisted: unknown): RecipeBuilderState | null {
  if (!isRecord(persisted) || !isRecord(persisted.draft)) return null;
  const { ingredients } = persisted.draft;
  const draft: RecipeBuilderState = { ...initialRecipeBuilderState(), ...persisted.draft };
  return { ...draft, ingredients: Array.isArray(ingredients) ? ingredients.flatMap(migrateIngredientV4ToV5) : [] };
}
