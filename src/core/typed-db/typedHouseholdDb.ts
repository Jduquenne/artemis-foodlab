import { HouseholdItem } from "../domain/household";
import { replaceRecordInPlace } from "./replaceInPlace";

export const typedHouseholdDb: Record<string, HouseholdItem> = {};

export function replaceHouseholdDb(next: Record<string, HouseholdItem>): void {
  replaceRecordInPlace(typedHouseholdDb, next);
}
