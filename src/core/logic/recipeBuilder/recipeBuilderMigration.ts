import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { initialRecipeBuilderState } from "./recipeBuilderState";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateDraftV2ToV3(persisted: unknown): RecipeBuilderState | null {
  if (!isRecord(persisted) || !isRecord(persisted.draft)) return null;
  const { fromBook, ...rest } = persisted.draft;
  return { ...initialRecipeBuilderState(), ...rest, isFromBook: fromBook === true };
}
