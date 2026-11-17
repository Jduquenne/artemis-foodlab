import { COOKING_LIMITS, COOKING_METHODS, COOKING_METHOD_LABELS, CookingMethod, FoodCooking, FoodCookingInput } from "../../domain/cooking";
import { roundTo } from "../../utils/numberUtils";
import { RecapEntry, diffEntry } from "../dashboard/recapLogic";
import { acceptsTemperature, compareCookingMethods, formatCookingSummary, isRawMethod } from "./cookingLogic";

export type CookingDraft = FoodCookingInput;

export type CookingDraftsResult = { inputs: FoodCookingInput[] } | { error: string; method?: CookingMethod };

export function emptyCookingDraft(method: CookingMethod): CookingDraft {
  return { method, minMinutes: null, maxMinutes: null, temperatureC: null, cookedRatio: null, note: null };
}

export function cookingToDraft({ method, minMinutes, maxMinutes, temperatureC, cookedRatio, note }: FoodCooking): CookingDraft {
  return { method, minMinutes, maxMinutes, temperatureC, cookedRatio, note };
}

export function availableCookingMethods(drafts: readonly CookingDraft[]): CookingMethod[] {
  return COOKING_METHODS.filter((method) => !drafts.some((draft) => draft.method === method));
}

export function sortCookingDrafts(drafts: readonly CookingDraft[]): CookingDraft[] {
  return [...drafts].sort((a, b) => compareCookingMethods(a.method, b.method));
}

function minutesError(value: number | null, label: string): string | null {
  if (value === null) return null;
  if (!Number.isInteger(value)) return `${label} doit être un nombre entier de minutes.`;
  if (value < COOKING_LIMITS.minMinutes) return `${label} doit être d'au moins 1 minute.`;
  if (value > COOKING_LIMITS.maxMinutes) return `${label} ne doit pas dépasser ${COOKING_LIMITS.maxMinutes} minutes.`;
  return null;
}

function temperatureError(value: number | null): string | null {
  if (value === null) return null;
  if (!Number.isInteger(value)) return "La température doit être un nombre entier de degrés Celsius.";
  if (value < COOKING_LIMITS.minTemperature) return `La température doit être d'au moins ${COOKING_LIMITS.minTemperature} °C.`;
  if (value > COOKING_LIMITS.maxTemperature) return `La température ne doit pas dépasser ${COOKING_LIMITS.maxTemperature} °C.`;
  return null;
}

function ratioError(value: number | null): string | null {
  if (value === null) return null;
  if (value <= 0) return "Le ratio cru → cuit doit être strictement positif.";
  if (value > COOKING_LIMITS.maxRatio) return `Le ratio cru → cuit ne doit pas dépasser ${COOKING_LIMITS.maxRatio}.`;
  if (roundTo(value, COOKING_LIMITS.ratioDecimals) !== value) {
    return `Le ratio cru → cuit ne peut avoir que ${COOKING_LIMITS.ratioDecimals} décimales au maximum.`;
  }
  return null;
}

export function validateCookingDraft(draft: CookingDraft): { input: FoodCookingInput } | { error: string } {
  const note = draft.note?.trim() ?? "";
  if (note.length > COOKING_LIMITS.maxNoteLength) return { error: `La note ne doit pas dépasser ${COOKING_LIMITS.maxNoteLength} caractères.` };
  const noteValue = note === "" ? null : note;
  if (isRawMethod(draft.method)) {
    return { input: { method: draft.method, minMinutes: null, maxMinutes: null, temperatureC: null, cookedRatio: null, note: noteValue } };
  }

  const temperatureC = acceptsTemperature(draft.method) ? draft.temperatureC : null;
  const fieldError =
    minutesError(draft.minMinutes, "La durée minimale")
    ?? minutesError(draft.maxMinutes, "La durée maximale")
    ?? temperatureError(temperatureC)
    ?? ratioError(draft.cookedRatio);
  if (fieldError) return { error: fieldError };

  const { minMinutes, maxMinutes, cookedRatio } = draft;
  if (maxMinutes !== null && minMinutes === null) return { error: "La durée maximale demande une durée minimale." };
  if (maxMinutes !== null && minMinutes !== null && maxMinutes < minMinutes) {
    return { error: "La durée maximale doit être supérieure ou égale à la durée minimale." };
  }
  if (minMinutes === null && cookedRatio === null) {
    return { error: `La fiche ${COOKING_METHOD_LABELS[draft.method]} doit avoir au moins une durée ou un ratio cru → cuit.` };
  }

  return { input: { method: draft.method, minMinutes, maxMinutes, temperatureC, cookedRatio, note: noteValue } };
}

export function validateCookingDrafts(drafts: readonly CookingDraft[]): CookingDraftsResult {
  if (drafts.length > COOKING_LIMITS.maxSheets) {
    return { error: `Un aliment ne peut pas avoir plus de ${COOKING_LIMITS.maxSheets} fiches de cuisson.` };
  }
  const inputs: FoodCookingInput[] = [];
  for (const draft of sortCookingDrafts(drafts)) {
    if (inputs.some((input) => input.method === draft.method)) {
      return { error: `Le mode de cuisson ${COOKING_METHOD_LABELS[draft.method]} apparaît plusieurs fois.`, method: draft.method };
    }
    const result = validateCookingDraft(draft);
    if ("error" in result) return { error: `${COOKING_METHOD_LABELS[draft.method]} : ${result.error}`, method: draft.method };
    inputs.push(result.input);
  }
  return { inputs };
}

export function buildCookingRecap(original: readonly FoodCooking[], inputs: readonly FoodCookingInput[]): RecapEntry[] {
  const summaryOf = (method: CookingMethod, list: readonly FoodCookingInput[]) => {
    const sheet = list.find((entry) => entry.method === method);
    return sheet ? formatCookingSummary(sheet) : "—";
  };
  return COOKING_METHODS
    .map((method) => diffEntry(COOKING_METHOD_LABELS[method], summaryOf(method, original), summaryOf(method, inputs)))
    .filter((entry): entry is RecapEntry => entry !== null);
}
