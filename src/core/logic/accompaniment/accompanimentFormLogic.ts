import {
  Accompaniment,
  AccompanimentDefault,
  AccompanimentInput,
  AccompanimentOption,
  AccompanimentOptionKind,
} from "../../domain/accompaniment";
import { Food, Unit } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { formatQty } from "../unit/unitFormatLogic";
import { parseUnit } from "../unit/unitLogic";
import { foldText, normalizeQuery, rankByQuery } from "../../utils/textUtils";

export const MAX_ACCOMPANIMENTS = 30;
export const MAX_ACCOMPANIMENT_OPTIONS = 10;
export const MAX_ACCOMPANIMENT_NAME = 50;
const MAX_OPTION_RECIPE_SUGGESTIONS = 8;

export interface AccompanimentOptionDraft {
  key: string;
  id?: string;
  kind: AccompanimentOptionKind;
  recipeCode: string | null;
  portionsPerPerson: number | null;
  foodId: string | null;
  quantityPerPerson: number | null;
  unit: Unit;
}

export interface AccompanimentDraft {
  id: string | null;
  name: string;
  recipeCodes: string[];
  options: AccompanimentOptionDraft[];
  defaultKey: string | null;
}

export function emptyAccompanimentDraft(): AccompanimentDraft {
  return { id: null, name: "", recipeCodes: [], options: [], defaultKey: null };
}

export function emptyOptionDraft(key: string, kind: AccompanimentOptionKind): AccompanimentOptionDraft {
  return kind === "recipe"
    ? { key, kind, recipeCode: null, portionsPerPerson: 1, foodId: null, quantityPerPerson: null, unit: Unit.G }
    : { key, kind, recipeCode: null, portionsPerPerson: null, foodId: null, quantityPerPerson: null, unit: Unit.G };
}

export function draftFromAccompaniment(accompaniment: Accompaniment): AccompanimentDraft {
  return {
    id: accompaniment.id,
    name: accompaniment.name,
    recipeCodes: [...accompaniment.recipeCodes],
    options: accompaniment.options.map((option) => ({
      key: option.id,
      id: option.id,
      kind: option.kind,
      recipeCode: option.recipeCode,
      portionsPerPerson: option.portionsPerPerson,
      foodId: option.foodId,
      quantityPerPerson: option.quantityPerPerson,
      unit: option.unit ? parseUnit(option.unit) : Unit.G,
    })),
    defaultKey: accompaniment.defaultOptionId,
  };
}

export function draftToInput(draft: AccompanimentDraft): AccompanimentInput {
  return {
    name: draft.name.trim(),
    recipeCodes: draft.recipeCodes,
    options: draft.options.map((option) => ({
      ...(option.id ? { id: option.id } : {}),
      kind: option.kind,
      recipeCode: option.kind === "recipe" ? option.recipeCode : null,
      portionsPerPerson: option.kind === "recipe" ? option.portionsPerPerson : null,
      foodId: option.kind === "food" ? option.foodId : null,
      quantityPerPerson: option.kind === "food" ? option.quantityPerPerson : null,
      unit: option.kind === "food" ? option.unit : null,
      isDefault: option.key === draft.defaultKey,
    })),
  };
}

export function removeOptionDraft(draft: AccompanimentDraft, key: string): AccompanimentDraft {
  return {
    ...draft,
    options: draft.options.filter((option) => option.key !== key),
    defaultKey: draft.defaultKey === key ? null : draft.defaultKey,
  };
}

export function updateOptionDraft(draft: AccompanimentDraft, next: AccompanimentOptionDraft): AccompanimentDraft {
  return { ...draft, options: draft.options.map((option) => (option.key === next.key ? next : option)) };
}

function validateOption(option: AccompanimentOptionDraft, index: number): string | null {
  const label = `Option ${index + 1}`;
  if (option.kind === "recipe") {
    if (!option.recipeCode) return `${label} : choisis une recette.`;
    if (option.portionsPerPerson === null || option.portionsPerPerson <= 0 || option.portionsPerPerson > 100) {
      return `${label} : indique un nombre de portions par personne entre 0 et 100.`;
    }
    return null;
  }
  if (!option.foodId) return `${label} : choisis un aliment.`;
  if (option.quantityPerPerson === null || option.quantityPerPerson <= 0) return `${label} : indique une quantité par personne.`;
  return null;
}

export function validateAccompanimentDraft(draft: AccompanimentDraft, accompaniments: readonly Accompaniment[]): string | null {
  const name = draft.name.trim();
  if (!name) return "Donne un nom à l'accompagnement.";
  if (name.length > MAX_ACCOMPANIMENT_NAME) return `Le nom ne doit pas dépasser ${MAX_ACCOMPANIMENT_NAME} caractères.`;
  if (accompaniments.some((other) => other.id !== draft.id && other.name.trim().toLowerCase() === name.toLowerCase())) {
    return "Un accompagnement porte déjà ce nom.";
  }
  if (draft.id === null && accompaniments.length >= MAX_ACCOMPANIMENTS) {
    return `Tu ne peux pas créer plus de ${MAX_ACCOMPANIMENTS} accompagnements.`;
  }
  if (draft.recipeCodes.length === 0) return "Choisis au moins une recette concernée.";
  if (draft.options.length === 0) return "Ajoute au moins une option.";
  if (draft.options.length > MAX_ACCOMPANIMENT_OPTIONS) return `Pas plus de ${MAX_ACCOMPANIMENT_OPTIONS} options.`;
  for (const [index, option] of draft.options.entries()) {
    const error = validateOption(option, index);
    if (error) return error;
  }
  return null;
}

export function searchOptionRecipes(query: string, recipes: Record<string, RecipeDetails>): RecipeDetails[] {
  return rankByQuery(Object.values(recipes), normalizeQuery(query), (recipe) => recipe.name).slice(0, MAX_OPTION_RECIPE_SUGGESTIONS);
}

export function accompanimentOptionLabel(
  option: Pick<AccompanimentOption, "kind" | "recipeCode" | "portionsPerPerson" | "foodId" | "quantityPerPerson" | "unit">,
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
): string {
  if (option.kind === "recipe") {
    const name = option.recipeCode ? (recipes[option.recipeCode]?.name ?? "Recette supprimée") : "Recette à choisir";
    const portions = option.portionsPerPerson ?? 1;
    return portions === 1 ? name : `${name} × ${formatQty(portions)}`;
  }
  const name = option.foodId ? (foods[option.foodId]?.name ?? "Aliment supprimé") : "Aliment à choisir";
  return option.quantityPerPerson === null ? name : `${name} ${formatQty(option.quantityPerPerson)} ${option.unit ?? ""}`.trim();
}

export const ACCOMPANIMENT_DEFAULT_VALUE = "";
export const ACCOMPANIMENT_NONE_VALUE = "none";

export function accompanimentDefaultValue(defaults: readonly AccompanimentDefault[], accompanimentId: string): string {
  const found = defaults.find((d) => d.accompanimentId === accompanimentId);
  if (!found) return ACCOMPANIMENT_DEFAULT_VALUE;
  return found.optionId ?? ACCOMPANIMENT_NONE_VALUE;
}

export function countAccompanimentDefaults(accompaniments: readonly Accompaniment[], defaults: readonly AccompanimentDefault[]): number {
  return accompaniments.filter((a) => defaults.some((d) => d.accompanimentId === a.id)).length;
}

export function filterAccompaniments(accompaniments: readonly Accompaniment[], query: string): Accompaniment[] {
  const folded = foldText(query);
  return folded ? accompaniments.filter((a) => foldText(a.name).includes(folded)) : [...accompaniments];
}

export function accompanimentSummary(accompaniment: Accompaniment): string {
  const recipes = `${accompaniment.recipeCodes.length} recette${accompaniment.recipeCodes.length > 1 ? "s" : ""}`;
  const options = `${accompaniment.options.length} option${accompaniment.options.length > 1 ? "s" : ""}`;
  return `${recipes} · ${options}`;
}
