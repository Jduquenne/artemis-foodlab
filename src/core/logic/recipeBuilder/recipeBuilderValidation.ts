import { Category, RecipeKind } from "../../domain/recipe";
import { MEAL_TYPE_LABELS, RECIPE_KIND_LABELS } from "../../domain/recipeLabels";
import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";
import { getIdByCode } from "../../catalogue/recipeIdMap";
import { buildRecipeDbId } from "./recipeCodeLogic";

export function summarizeBuilderState(state: RecipeBuilderState, categories: Category[]): { label: string; value: string }[] {
  const isBase = state.kind === RecipeKind.BASE;
  const rows: { label: string; value: string }[] = [
    { label: "Identifiant", value: buildRecipeDbId(state.categoryId, state.recipeNumber) },
    { label: "Nom", value: state.name.trim() || "—" },
    { label: "Catégorie", value: categories.find((c) => c.id === state.categoryId)?.name ?? state.categoryId },
    { label: "Type", value: RECIPE_KIND_LABELS[state.kind] },
    { label: "Portions", value: String(state.defaultPortions) },
  ];
  if (!isBase) {
    rows.push({
      label: "Repas",
      value: state.mealTypes.map((t) => MEAL_TYPE_LABELS[t]).join(", ") || "—",
    });
  }
  const options = [
    !isBase && state.isDessert ? "Dessert" : null,
    state.batchCooking ? "Batch cooking" : null,
    state.isFromBook ? `Livre${state.bookPage ? ` p.${state.bookPage}` : ""}` : null,
  ].filter(Boolean) as string[];
  if (options.length) rows.push({ label: "Options", value: options.join(", ") });
  rows.push({
    label: "Ingrédients",
    value: String(state.ingredients.filter((ing) => ing.name.trim()).length),
  });
  return rows;
}

export function validateBuilderState(state: RecipeBuilderState): string[] {
  const errors: string[] = [];
  if (!state.name.trim()) errors.push("Le nom est obligatoire.");
  if (!state.recipeNumber.trim()) errors.push("Le numéro de recette est obligatoire.");
  if (!state.categoryId) errors.push("La catégorie est obligatoire.");
  if (state.defaultPortions <= 0) errors.push("Le nombre de portions doit être supérieur à 0.");
  if (state.kind !== RecipeKind.BASE && state.mealTypes.length === 0) {
    errors.push("Sélectionne au moins un type de repas.");
  }
  if (state.isFromBook && (state.bookPage == null || state.bookPage <= 0)) {
    errors.push("Indique la page du livre.");
  }
  const named = state.ingredients.filter((ing) => ing.name.trim());
  if (named.length === 0) errors.push("Ajoute au moins un ingrédient.");
  if (named.some((ing) => !getIngredientCategoryId(ing.category))) {
    errors.push("Un ingrédient a une catégorie inconnue de l'API — resynchronise le catalogue.");
  }
  if (named.some((ing) => ing.ingredientType === "base" && ing.baseId && !getIdByCode(ing.baseId))) {
    errors.push("Une sous-recette (base) est introuvable dans le catalogue.");
  }
  return errors;
}
