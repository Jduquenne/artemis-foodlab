import { JournalOverrideInput } from "../domain/journal";
import { ApiJournalOverride } from "../logic/journal/journalApiMapper";
import { apiFetchJson } from "./apiClient";

export async function saveJournalOverride(
  planningSlotItemId: string,
  profileId: string,
  input: JournalOverrideInput,
): Promise<ApiJournalOverride> {
  return apiFetchJson<ApiJournalOverride>("/journal-overrides", {
    method: "POST",
    body: {
      planningSlotItemId,
      profileId,
      portionsOverride: input.portionsOverride,
      gramsOverride: input.gramsOverride,
      ingredientOverrides: Object.entries(input.ingredientOverrides).map(([recipeIngredientId, gramsOverride]) => ({
        recipeIngredientId,
        gramsOverride,
      })),
    },
  });
}
