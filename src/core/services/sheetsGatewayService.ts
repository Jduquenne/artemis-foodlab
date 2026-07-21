import { RecipeDetails } from "../domain/types";

const GATEWAY_URL = import.meta.env.VITE_SHEETS_GATEWAY_URL as string | undefined;

export async function saveRecipe(recipe: RecipeDetails & { id: string }, token: string): Promise<void> {
  if (!GATEWAY_URL) throw new Error("Sheets gateway non configuré (VITE_SHEETS_GATEWAY_URL manquant)");
  const response = await fetch(`${GATEWAY_URL}/recipes/${recipe.id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) throw new Error(`Échec de l'enregistrement (${response.status})`);
}
