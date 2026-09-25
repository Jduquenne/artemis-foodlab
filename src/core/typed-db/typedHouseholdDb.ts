import { HouseholdItem } from "../domain/household";

export const typedHouseholdDb: Record<string, HouseholdItem> = {};

export function replaceHouseholdDb(next: Record<string, HouseholdItem>): void {
  for (const key of Object.keys(typedHouseholdDb)) delete typedHouseholdDb[key];
  Object.assign(typedHouseholdDb, next);
}
