import { Accompaniment, AccompanimentInput, AccompanimentOptionKind } from "../../domain/accompaniment";
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

export function mapAccompaniment(api: ApiAccompaniment): Accompaniment {
  return {
    id: api.id,
    name: api.name,
    recipeCodes: api.recipeIds.map(toCode),
    options: api.options.map((option) => ({
      id: option.id,
      kind: option.kind,
      recipeCode: option.recipeId ? toCode(option.recipeId) : null,
      portionsPerPerson: option.portionsPerPerson,
      foodId: option.foodId,
      quantityPerPerson: option.quantityPerPerson,
      unit: option.unit,
    })),
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
        return {
          ...common,
          ...(option.recipeCode ? { recipeId: toId(option.recipeCode) } : {}),
          ...(option.portionsPerPerson !== null ? { portionsPerPerson: option.portionsPerPerson } : {}),
        };
      }
      return {
        ...common,
        ...(option.foodId ? { foodId: option.foodId } : {}),
        ...(option.quantityPerPerson !== null ? { quantityPerPerson: option.quantityPerPerson } : {}),
        ...(option.unit ? { unit: option.unit } : {}),
      };
    }),
  };
}
