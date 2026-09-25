export interface RecapValue {
  label: string;
  value: string;
}

export interface RecapChange {
  label: string;
  from: string;
  to: string;
}

export type RecapEntry = RecapValue | RecapChange;

export function isRecapChange(entry: RecapEntry): entry is RecapChange {
  return "from" in entry;
}

export function recapText(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function recapBool(value: boolean): string {
  return value ? "Oui" : "Non";
}

export function diffEntry(label: string, before: string, after: string): RecapEntry | null {
  if (before === after) return null;
  return { label, from: before, to: after };
}
