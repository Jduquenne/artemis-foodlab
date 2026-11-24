import { Accompaniment, AccompanimentInput, AccompanimentOption, AccompanimentOptionKind } from "../../domain/accompaniment";
import { getCodeById, getIdByCode } from "../../catalogue/recipeIdMap";

export interface ApiAccompanimentOption {
  id: string;
  kind: AccompanimentOptionKind;
  recipeId: string | null;
  portionsPerPerson: number | null;
  foodId: string | null;
  quantityPerPerson: number | null;
  unit: string | null;
}

export interface ApiAccompaniment {
  id: string;
  name: string;
  recipeIds: string[];
  options: ApiAccompanimentOption[];
  defaultOptionId: string | null;
}

export interface ApiAccompanimentOptionPayload {
  id?: string;
  kind: AccompanimentOptionKind;
  recipeId?: string;
  portionsPerPerson?: number;
  foodId?: string;
  quantityPerPerson?: number;
  unit?: string;
  isDefault: boolean;
}

export interface ApiAccompanimentPayload {
  name: string;
  recipeIds: string[];
  options: ApiAccompanimentOptionPayload[];
}

const toCode = (id: string): string => getCodeById(id) ?? id;
const toId = (code: string): string => getIdByCode(code) ?? code;

function mapAccompanimentOption(option: ApiAccompanimentOption): AccompanimentOption[] {
  if (option.kind === "recipe") {
    if (option.recipeId === null) return [];
    return [{ id: option.id, kind: "recipe", recipeCode: toCode(option.recipeId), portionsPerPerson: option.portionsPerPerson ?? 1 }];
  }
  if (option.foodId === null || option.quantityPerPerson === null || option.unit === null) return [];
  return [{ id: option.id, kind: "food", foodId: option.foodId, quantityPerPerson: option.quantityPerPerson, unit: option.unit }];
}

export function mapAccompaniment(api: ApiAccompaniment): Accompaniment {
  return {
    id: api.id,
    name: api.name,
    recipeCodes: api.recipeIds.map(toCode),
    options: api.options.flatMap(mapAccompanimentOption),
    defaultOptionId: api.defaultOptionId,
  };
}

export function mapAccompaniments(api: readonly ApiAccompaniment[]): Accompaniment[] {
  return api.map(mapAccompaniment);
}

export function buildAccompanimentPayload(input: AccompanimentInput): ApiAccompanimentPayload {
  return {
    name: input.name.trim(),
    recipeIds: input.recipeCodes.map(toId),
    options: input.options.map((option) => {
      const common = { ...(option.id ? { id: option.id } : {}), kind: option.kind, isDefault: option.isDefault };
      if (option.kind === "recipe") {
        return { ...common, recipeId: toId(option.recipeCode), portionsPerPerson: option.portionsPerPerson };
      }
      return {
        ...common,
        foodId: option.foodId,
        quantityPerPerson: option.quantityPerPerson,
        ...(option.unit ? { unit: option.unit } : {}),
      };
    }),
  };
}
