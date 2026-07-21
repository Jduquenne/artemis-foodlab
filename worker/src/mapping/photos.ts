import { field, SheetRow } from "./sheetRecords";

export interface RawPhotoRow {
  id: string;
  mealImage: string;
  bookPhoto: string;
}

export function parsePhotoRow(sheetRow: SheetRow): RawPhotoRow | null {
  const { record } = sheetRow;
  const id = field(record, "id");
  if (!id) return null;

  return {
    id,
    mealImage: field(record, "mealImage"),
    bookPhoto: field(record, "bookPhoto"),
  };
}
