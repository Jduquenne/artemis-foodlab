export interface SheetRow {
  rowNumber: number;
  record: Record<string, string>;
}

export function toSheetRows(rows: string[][]): SheetRow[] {
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((row, i) => {
    const record: Record<string, string> = {};
    header.forEach((key, colIndex) => {
      if (!key) return;
      record[key] = (row[colIndex] ?? "").trim();
    });
    return { rowNumber: i + 2, record };
  });
}

export function field(record: Record<string, string>, name: string): string {
  return record[name.toLowerCase()] ?? "";
}

export function buildRowFromRecord(
  header: string[],
  values: Record<string, unknown>,
): unknown[] {
  return header.map((rawKey) => {
    const key = rawKey.trim().toLowerCase();
    const value = values[key];
    return value === undefined || value === null ? "" : value;
  });
}
