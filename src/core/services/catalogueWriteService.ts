import { apiFetch, apiFetchJson } from "./apiClient";
import { ApiRecipe, ApiRecipeInput } from "../logic/recipe/recipeApiMapper";
import { RecipeAssetKey } from "../domain/types";

export function createRecipe(body: ApiRecipeInput): Promise<ApiRecipe> {
  return apiFetchJson<ApiRecipe>("/recipes", { method: "POST", body });
}

export function updateRecipe(uuid: string, body: ApiRecipeInput): Promise<ApiRecipe> {
  return apiFetchJson<ApiRecipe>(`/recipes/${uuid}`, { method: "PUT", body });
}

export async function deleteRecipe(uuid: string): Promise<void> {
  await apiFetch(`/recipes/${uuid}`, { method: "DELETE" });
}

export function uploadRecipePhoto(
  uuid: string,
  file: File,
  kind: Extract<RecipeAssetKey, "mealPhoto" | "bookPhoto">,
): Promise<ApiRecipe> {
  const form = new FormData();
  form.append("photo", file);
  form.append("kind", kind);
  return apiFetchJson<ApiRecipe>(`/recipes/${uuid}/photo`, { method: "POST", body: form });
}
