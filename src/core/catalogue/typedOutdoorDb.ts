import { OutdoorEntry } from "../domain/recipe";
import { replaceRecordInPlace } from "./replaceInPlace";

export const typedOutdoorDb: Record<string, OutdoorEntry> = {};

export function replaceOutdoorDb(next: Record<string, OutdoorEntry>): void {
  replaceRecordInPlace(typedOutdoorDb, next);
}
