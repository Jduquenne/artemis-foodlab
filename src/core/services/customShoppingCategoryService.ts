import { CustomShoppingCategory } from "../domain/shopping";
import { apiFetch, apiFetchJson } from "./apiClient";

export function createCustomShoppingCategory(label: string): Promise<CustomShoppingCategory> {
  return apiFetchJson<CustomShoppingCategory>("/custom-shopping-categories", { method: "POST", body: { label } });
}

export function renameCustomShoppingCategory(id: string, label: string): Promise<CustomShoppingCategory> {
  return apiFetchJson<CustomShoppingCategory>(`/custom-shopping-categories/${id}`, { method: "PUT", body: { label } });
}

export async function deleteCustomShoppingCategory(id: string): Promise<void> {
  await apiFetch(`/custom-shopping-categories/${id}`, { method: "DELETE" });
}
