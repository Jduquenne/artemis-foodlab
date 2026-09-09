import { apiFetch, apiFetchJson } from "./apiClient";
import { ApiOutdoorActivity, ApiRecipe, ApiRecipeInput } from "../logic/recipe/recipeApiMapper";
import { Food, RecipeAssetKey } from "../domain/types";

export interface OutdoorActivityInput {
  code: string;
  name: string;
  categoryId: string;
}

export interface FoodInput {
  id: string;
  name: string;
  categoryId: string;
  unit: string | null;
  unitWeight: number | null;
  isFreezable: boolean;
  macros: { kcal: number; proteins: number; lipids: number; carbohydrates: number; fibers: number };
}

export function createFood(body: FoodInput): Promise<Food> {
  return apiFetchJson<Food>("/foods", { method: "POST", body });
}

export function updateFood(id: string, body: FoodInput): Promise<Food> {
  return apiFetchJson<Food>(`/foods/${id}`, { method: "PUT", body });
}

export async function deleteFood(id: string): Promise<void> {
  await apiFetch(`/foods/${id}`, { method: "DELETE" });
}

export function createRecipe(body: ApiRecipeInput): Promise<ApiRecipe> {
  return apiFetchJson<ApiRecipe>("/recipes", { method: "POST", body });
}

export function updateRecipe(uuid: string, body: ApiRecipeInput): Promise<ApiRecipe> {
  return apiFetchJson<ApiRecipe>(`/recipes/${uuid}`, { method: "PUT", body });
}

export async function deleteRecipe(uuid: string): Promise<void> {
  await apiFetch(`/recipes/${uuid}`, { method: "DELETE" });
}

export function createOutdoorActivity(body: OutdoorActivityInput): Promise<ApiOutdoorActivity> {
  return apiFetchJson<ApiOutdoorActivity>("/outdoor-activities", { method: "POST", body });
}

export function updateOutdoorActivity(
  uuid: string,
  body: OutdoorActivityInput,
): Promise<ApiOutdoorActivity> {
  return apiFetchJson<ApiOutdoorActivity>(`/outdoor-activities/${uuid}`, { method: "PUT", body });
}

export async function deleteOutdoorActivity(uuid: string): Promise<void> {
  await apiFetch(`/outdoor-activities/${uuid}`, { method: "DELETE" });
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
