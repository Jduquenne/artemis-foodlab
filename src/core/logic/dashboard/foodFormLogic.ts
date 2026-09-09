import { Food, IngredientCategory, Macronutrients } from "../../domain/types";
import { FoodInput } from "../../services/catalogueWriteService";
import { getIngredientCategoryId } from "../../typed-db/ingredientCategoryMap";

export interface FoodFormDraft {
  name: string;
  category: IngredientCategory;
  unit: string;
  unitWeight: string;
  isFreezable: boolean;
  macros: Record<keyof Macronutrients, string>;
}

const MACRO_KEYS: (keyof Macronutrients)[] = ["kcal", "proteins", "lipids", "carbohydrates", "fibers"];

export function emptyFoodDraft(): FoodFormDraft {
  return {
    name: "",
    category: IngredientCategory.UNKNOWN,
    unit: "",
    unitWeight: "",
    isFreezable: false,
    macros: { kcal: "", proteins: "", lipids: "", carbohydrates: "", fibers: "" },
  };
}

export function suggestFoodId(category: IngredientCategory, foods: Food[]): string {
  const siblings = foods.filter((food) => food.category === category && /^[a-z]+-\d+$/.test(food.id));
  if (siblings.length === 0) return "";
  const prefix = siblings[0].id.split("-")[0];
  let max = 0;
  let width = 3;
  for (const food of siblings) {
    const [, digits] = food.id.split("-");
    width = Math.max(width, digits.length);
    max = Math.max(max, Number(digits));
  }
  return `${prefix}-${String(max + 1).padStart(width, "0")}`;
}

export function validateNewFoodId(id: string, foods: Food[]): string | null {
  const trimmed = id.trim();
  if (!trimmed) return "L'identifiant est requis.";
  if (!/^[a-z]+-\d+$/.test(trimmed)) return "L'identifiant doit être au format « fv-014 ».";
  if (foods.some((food) => food.id === trimmed)) return "Cet identifiant est déjà utilisé.";
  return null;
}

export function foodToDraft(food: Food): FoodFormDraft {
  return {
    name: food.name,
    category: food.category,
    unit: food.unit ?? "",
    unitWeight: food.unitWeight != null ? String(food.unitWeight) : "",
    isFreezable: Boolean(food.isFreezable),
    macros: {
      kcal: String(food.macros.kcal),
      proteins: String(food.macros.proteins),
      lipids: String(food.macros.lipids),
      carbohydrates: String(food.macros.carbohydrates),
      fibers: String(food.macros.fibers),
    },
  };
}

export function validateFoodForm(draft: FoodFormDraft): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Le nom est requis.");
  if (!getIngredientCategoryId(draft.category)) errors.push("Catégorie inconnue de l'API.");
  if (draft.unitWeight.trim() && !Number.isFinite(Number(draft.unitWeight))) {
    errors.push("Le poids unitaire doit être un nombre.");
  }
  for (const key of MACRO_KEYS) {
    const raw = draft.macros[key];
    if (raw.trim() === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
      errors.push("Les valeurs nutritionnelles doivent être des nombres positifs.");
      break;
    }
  }
  return errors;
}

export function foodFormToBody(id: string, draft: FoodFormDraft): FoodInput {
  const categoryId = getIngredientCategoryId(draft.category);
  if (!categoryId) throw new Error("Catégorie inconnue de l'API.");
  return {
    id,
    name: draft.name.trim(),
    categoryId,
    unit: draft.unit.trim() || null,
    unitWeight: draft.unitWeight.trim() ? Number(draft.unitWeight) : null,
    isFreezable: draft.isFreezable,
    macros: {
      kcal: Number(draft.macros.kcal),
      proteins: Number(draft.macros.proteins),
      lipids: Number(draft.macros.lipids),
      carbohydrates: Number(draft.macros.carbohydrates),
      fibers: Number(draft.macros.fibers),
    },
  };
}
