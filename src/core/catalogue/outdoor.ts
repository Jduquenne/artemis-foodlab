import { OutdoorEntry } from "../domain/recipe";
import { replaceRecordInPlace } from "./replaceInPlace";

export const outdoorCatalogue: Record<string, OutdoorEntry> = {};

export function replaceOutdoor(next: Record<string, OutdoorEntry>): void {
  replaceRecordInPlace(outdoorCatalogue, next);
}
