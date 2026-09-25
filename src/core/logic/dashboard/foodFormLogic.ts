import { Food, IngredientCategory } from "../../domain/ingredient";
import { Macronutrients, NUTRIENT_DEFINITIONS, NutrientKey } from "../../domain/nutrition";
import { FoodInput } from "../../domain/catalogueInput";
import { getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";
import { RecapEntry, diffEntry, recapBool, recapText } from "./recapLogic";
import { toNumber } from "../../../shared/utils/numberUtils";
import { nextSequentialCode, validateNewCode } from "../../../shared/utils/codeUtils";
import { atwaterKcal } from "../nutrition/atwaterLogic";

export interface FoodFormDraft {
  name: string;
  category: IngredientCategory;
  unit: string;
  unitWeight: string;
  isFreezable: boolean;
  macros: Record<keyof Macronutrients, string>;
}

export const EDITABLE_MACRO_KEYS: NutrientKey[] = NUTRIENT_DEFINITIONS.map((definition) => definition.key);

export function parseEditableMacros(
  raw: Record<keyof Macronutrients, string>,
): Pick<Macronutrients, "proteins" | "lipids" | "carbohydrates" | "fibers"> {
  return {
    proteins: toNumber(raw.proteins),
    lipids: toNumber(raw.lipids),
    carbohydrates: toNumber(raw.carbohydrates),
    fibers: toNumber(raw.fibers),
  };
}

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
  return nextSequentialCode(prefix, siblings.map((food) => food.id));
}

export function validateNewFoodId(id: string, foods: Food[]): string | null {
  return validateNewCode(id, foods.map((food) => food.id), "fv-014");
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
  for (const key of EDITABLE_MACRO_KEYS) {
    const raw = draft.macros[key];
    if (raw.trim() === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
      errors.push("Les valeurs nutritionnelles doivent être des nombres positifs.");
      break;
    }
  }
  return errors;
}

const MACRO_LABELS: Record<NutrientKey, string> = Object.fromEntries(
  NUTRIENT_DEFINITIONS.map((definition) => [definition.key, definition.label]),
) as Record<NutrientKey, string>;

export function buildFoodRecap(original: Food | null, id: string, draft: FoodFormDraft): RecapEntry[] {
  const draftKcal = String(atwaterKcal(parseEditableMacros(draft.macros)));
  if (original === null) {
    return [
      { label: "Identifiant", value: id.trim() },
      { label: "Nom", value: draft.name.trim() },
      { label: "Catégorie", value: draft.category },
      { label: "Unité", value: recapText(draft.unit) },
      { label: "Poids unitaire (g)", value: recapText(draft.unitWeight) },
      { label: "Congelable", value: recapBool(draft.isFreezable) },
      ...EDITABLE_MACRO_KEYS.map((key) => ({ label: MACRO_LABELS[key], value: recapText(draft.macros[key]) })),
      { label: "Kcal (Atwater)", value: draftKcal },
    ];
  }
  const before = foodToDraft(original);
  const changes: RecapEntry[] = [];
  const add = (entry: RecapEntry | null) => { if (entry) changes.push(entry); };
  add(diffEntry("Nom", before.name.trim(), draft.name.trim()));
  add(diffEntry("Catégorie", before.category, draft.category));
  add(diffEntry("Unité", recapText(before.unit), recapText(draft.unit)));
  add(diffEntry("Poids unitaire (g)", recapText(before.unitWeight), recapText(draft.unitWeight)));
  add(diffEntry("Congelable", recapBool(before.isFreezable), recapBool(draft.isFreezable)));
  for (const key of EDITABLE_MACRO_KEYS) {
    add(diffEntry(MACRO_LABELS[key], recapText(before.macros[key]), recapText(draft.macros[key])));
  }
  add(diffEntry("Kcal (Atwater)", recapText(before.macros.kcal), draftKcal));
  return changes;
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
    macros: (() => {
      const editable = parseEditableMacros(draft.macros);
      return { kcal: atwaterKcal(editable), ...editable };
    })(),
  };
}
