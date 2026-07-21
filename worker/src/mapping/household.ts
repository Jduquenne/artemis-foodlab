import { field, SheetRow } from "./sheetRecords";
import { HouseholdCategory, HouseholdItem } from "../types";

export interface RawHouseholdRow {
  name: string;
  categoryRaw: string;
}

export function parseRawHouseholdRow(sheetRow: SheetRow): RawHouseholdRow | null {
  const { record } = sheetRow;
  const name = field(record, "name");
  if (!name) return null;
  return { name, categoryRaw: field(record, "category") };
}

export function assignHouseholdIds(rawRows: RawHouseholdRow[]): HouseholdItem[] {
  return rawRows.map((raw, i) => ({
    id: `hh-${String(i + 1).padStart(3, "0")}`,
    name: raw.name,
    category: raw.categoryRaw as HouseholdCategory,
  }));
}

export function buildHouseholdRowValues(item: HouseholdItem): Record<string, unknown> {
  return { name: item.name, category: item.category };
}
