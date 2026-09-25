import { HouseholdItem } from "../domain/household";
import { replaceRecordInPlace } from "./replaceInPlace";

export const householdCatalogue: Record<string, HouseholdItem> = {};

export function replaceHousehold(next: Record<string, HouseholdItem>): void {
  replaceRecordInPlace(householdCatalogue, next);
}
