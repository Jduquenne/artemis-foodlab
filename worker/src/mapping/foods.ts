import { canonicalFoodCategory, foodCategoryPrefix } from "./categoryPrefix";
import { field, SheetRow } from "./sheetRecords";
import { Food, IngredientCategory } from "../types";

export interface RawFoodRow {
  name: string;
  isFreezable?: boolean;
  unit?: string;
  unitWeight?: number;
  categoryRaw: string;
  macros: { kcal: number; proteins: number; lipids: number; carbohydrates: number; fibers: number };
}

function toBool(text: string): boolean {
  return text.trim().toUpperCase() === "TRUE";
}

function toNumber(text: string): number {
  const n = Number(text.replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export function parseRawFoodRow(sheetRow: SheetRow): RawFoodRow | null {
  const { record } = sheetRow;
  const name = field(record, "name");
  if (!name) return null;

  const isFreezableRaw = field(record, "isFreezable");
  const unitWeightRaw = field(record, "unitWeight");

  return {
    name,
    isFreezable: isFreezableRaw ? toBool(isFreezableRaw) : undefined,
    unit: field(record, "unit") || undefined,
    unitWeight: unitWeightRaw ? toNumber(unitWeightRaw) : undefined,
    categoryRaw: field(record, "category"),
    macros: {
      kcal: toNumber(field(record, "kcal")),
      proteins: toNumber(field(record, "proteins")),
      lipids: toNumber(field(record, "lipids")),
      carbohydrates: toNumber(field(record, "carbohydrates")),
      fibers: toNumber(field(record, "fibers")),
    },
  };
}

export function assignFoodIds(rawRows: RawFoodRow[]): Food[] {
  const counters = new Map<string, number>();
  return rawRows.map((raw) => {
    const prefix = foodCategoryPrefix(raw.categoryRaw);
    const next = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, next);
    const id = `${prefix}-${String(next).padStart(3, "0")}`;

    return {
      id,
      name: raw.name,
      category: canonicalFoodCategory(raw.categoryRaw) as IngredientCategory,
      macros: raw.macros,
      unit: raw.unit,
      unitWeight: raw.unitWeight,
      isFreezable: raw.isFreezable,
    };
  });
}

export function buildFoodRowValues(food: Food): Record<string, unknown> {
  return {
    name: food.name,
    isfreezable: food.isFreezable ? "TRUE" : "FALSE",
    unit: food.unit ?? "",
    unitweight: food.unitWeight ?? "",
    category: food.category,
    kcal: food.macros.kcal,
    proteins: food.macros.proteins,
    lipids: food.macros.lipids,
    carbohydrates: food.macros.carbohydrates,
    fibers: food.macros.fibers,
  };
}
