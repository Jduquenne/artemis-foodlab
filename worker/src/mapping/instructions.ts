import { field, SheetRow } from "./sheetRecords";
import { InstructionEntry } from "../types";

export function parseInstructionRow(sheetRow: SheetRow): InstructionEntry | null {
  const { record } = sheetRow;
  const id = field(record, "id");
  if (!id) return null;

  const bookPageRaw = field(record, "bookPage");

  return {
    id,
    fromBook: field(record, "fromBook").trim().toUpperCase() === "TRUE",
    bookPage: bookPageRaw ? Number(bookPageRaw) || undefined : undefined,
    instructions: field(record, "instructions"),
  };
}
