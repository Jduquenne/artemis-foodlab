import { OutdoorEntry } from "../domain/recipe";

export const typedOutdoorDb: Record<string, OutdoorEntry> = {};

export function replaceOutdoorDb(next: Record<string, OutdoorEntry>): void {
  for (const key of Object.keys(typedOutdoorDb)) delete typedOutdoorDb[key];
  Object.assign(typedOutdoorDb, next);
}
