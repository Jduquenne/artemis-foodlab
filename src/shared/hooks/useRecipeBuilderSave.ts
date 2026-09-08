import { useCallback, useState } from "react";
import { RecipeBuilderState } from "../../core/domain/recipeBuilderTypes";
import { builderStateToApiBody, validateBuilderState } from "../../core/logic/recipeBuilder/recipeBuilderLogic";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import {
  createRecipe,
  deleteRecipe,
  updateRecipe,
  uploadRecipePhoto,
} from "../../core/services/catalogueWriteService";
import { removeRecipeFromCatalogue, syncRecipeFromApi } from "../../core/services/catalogueSyncService";

export type RecipeBuilderSaveStatus = "idle" | "saving" | "done" | "error";

export interface RecipeBuilderPhotos {
  mealPhoto?: File | null;
  bookPhoto?: File | null;
}

export function useRecipeBuilderSave() {
  const [status, setStatus] = useState<RecipeBuilderSaveStatus>("idle");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const reset = useCallback(() => {
    setStatus("idle");
    setValidationErrors([]);
  }, []);

  const save = useCallback(async (state: RecipeBuilderState, photos: RecipeBuilderPhotos): Promise<boolean> => {
    const errors = validateBuilderState(state);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setStatus("error");
      return false;
    }
    setValidationErrors([]);
    setStatus("saving");
    try {
      const body = builderStateToApiBody(state);
      const existing = typedRecipesDb[body.code];
      const saved = existing?.apiId ? await updateRecipe(existing.apiId, body) : await createRecipe(body);
      if (photos.mealPhoto) await uploadRecipePhoto(saved.id, photos.mealPhoto, "mealPhoto");
      if (photos.bookPhoto) await uploadRecipePhoto(saved.id, photos.bookPhoto, "bookPhoto");
      await syncRecipeFromApi(saved.id);
      setStatus("done");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  const remove = useCallback(async (code: string): Promise<boolean> => {
    const existing = typedRecipesDb[code];
    if (!existing?.apiId) return false;
    setStatus("saving");
    try {
      await deleteRecipe(existing.apiId);
      await removeRecipeFromCatalogue(code);
      setStatus("done");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  return { status, validationErrors, save, remove, reset };
}
