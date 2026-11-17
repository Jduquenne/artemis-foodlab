import { COOKING_LIMITS, COOKING_METHODS, COOKING_METHOD_LABELS, CookingMethod, FoodCooking, FoodCookingInput } from "../../domain/cooking";
import { parseDecimal, roundTo } from "../../utils/numberUtils";
import { acceptsTemperature, compareCookingMethods, isRawMethod } from "./cookingLogic";

export interface CookingDraft {
  method: CookingMethod;
  minMinutes: string;
  maxMinutes: string;
  temperatureC: string;
  cookedRatio: string;
  note: string;
}

export type CookingDraftsResult = { inputs: FoodCookingInput[] } | { error: string; method?: CookingMethod };

const numberText = (value: number | null) => (value === null ? "" : String(value).replace(".", ","));

export function emptyCookingDraft(method: CookingMethod): CookingDraft {
  return { method, minMinutes: "", maxMinutes: "", temperatureC: "", cookedRatio: "", note: "" };
}

export function cookingToDraft(cooking: FoodCooking): CookingDraft {
  return {
    method: cooking.method,
    minMinutes: numberText(cooking.minMinutes),
    maxMinutes: numberText(cooking.maxMinutes),
    temperatureC: numberText(cooking.temperatureC),
    cookedRatio: numberText(cooking.cookedRatio),
    note: cooking.note ?? "",
  };
}

export function availableCookingMethods(drafts: readonly CookingDraft[]): CookingMethod[] {
  return COOKING_METHODS.filter((method) => !drafts.some((draft) => draft.method === method));
}

export function sortCookingDrafts(drafts: readonly CookingDraft[]): CookingDraft[] {
  return [...drafts].sort((a, b) => compareCookingMethods(a.method, b.method));
}

type FieldResult = { value: number | null } | { error: string };

function parseMinutes(text: string, label: string): FieldResult {
  if (text.trim() === "") return { value: null };
  const value = parseDecimal(text);
  if (value === null || !Number.isInteger(value)) return { error: `${label} doit être un nombre entier de minutes.` };
  if (value < COOKING_LIMITS.minMinutes) return { error: `${label} doit être d'au moins 1 minute.` };
  if (value > COOKING_LIMITS.maxMinutes) return { error: `${label} ne doit pas dépasser ${COOKING_LIMITS.maxMinutes} minutes.` };
  return { value };
}

function parseTemperature(text: string): FieldResult {
  if (text.trim() === "") return { value: null };
  const value = parseDecimal(text);
  if (value === null || !Number.isInteger(value)) return { error: "La température doit être un nombre entier de degrés Celsius." };
  if (value < COOKING_LIMITS.minTemperature) return { error: `La température doit être d'au moins ${COOKING_LIMITS.minTemperature} °C.` };
  if (value > COOKING_LIMITS.maxTemperature) return { error: `La température ne doit pas dépasser ${COOKING_LIMITS.maxTemperature} °C.` };
  return { value };
}

function parseRatio(text: string): FieldResult {
  if (text.trim() === "") return { value: null };
  const value = parseDecimal(text);
  if (value === null) return { error: "Le ratio cru → cuit doit être un nombre." };
  if (value <= 0) return { error: "Le ratio cru → cuit doit être strictement positif." };
  if (value > COOKING_LIMITS.maxRatio) return { error: `Le ratio cru → cuit ne doit pas dépasser ${COOKING_LIMITS.maxRatio}.` };
  if (roundTo(value, COOKING_LIMITS.ratioDecimals) !== value) {
    return { error: `Le ratio cru → cuit ne peut avoir que ${COOKING_LIMITS.ratioDecimals} décimales au maximum.` };
  }
  return { value };
}

export function validateCookingDraft(draft: CookingDraft): { input: FoodCookingInput } | { error: string } {
  const label = COOKING_METHOD_LABELS[draft.method];
  const note = draft.note.trim();
  if (note.length > COOKING_LIMITS.maxNoteLength) return { error: `La note ne doit pas dépasser ${COOKING_LIMITS.maxNoteLength} caractères.` };
  const noteValue = note === "" ? null : note;
  if (isRawMethod(draft.method)) {
    return { input: { method: draft.method, minMinutes: null, maxMinutes: null, temperatureC: null, cookedRatio: null, note: noteValue } };
  }

  const min = parseMinutes(draft.minMinutes, "La durée minimale");
  if ("error" in min) return min;
  const max = parseMinutes(draft.maxMinutes, "La durée maximale");
  if ("error" in max) return max;
  const temperature = acceptsTemperature(draft.method) ? parseTemperature(draft.temperatureC) : { value: null };
  if ("error" in temperature) return temperature;
  const ratio = parseRatio(draft.cookedRatio);
  if ("error" in ratio) return ratio;

  if (max.value !== null && min.value === null) return { error: "La durée maximale demande une durée minimale." };
  if (max.value !== null && min.value !== null && max.value < min.value) {
    return { error: "La durée maximale doit être supérieure ou égale à la durée minimale." };
  }
  if (min.value === null && ratio.value === null) return { error: `La fiche ${label} doit avoir au moins une durée ou un ratio cru → cuit.` };

  return {
    input: {
      method: draft.method,
      minMinutes: min.value,
      maxMinutes: max.value,
      temperatureC: temperature.value,
      cookedRatio: ratio.value,
      note: noteValue,
    },
  };
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
    if ("error" in result) return { error: result.error, method: draft.method };
    inputs.push(result.input);
  }
  return { inputs };
}
