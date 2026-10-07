export enum HouseholdCategory {
  HYGIENE = "Hygiène",
  MAINTENANCE = "Entretien",
  PHARMACY = "Pharmacie",
  PANTRY = "Garde manger",
  PETS = "Animaux",
}

export const HOUSEHOLD_CATEGORY_ORDER: HouseholdCategory[] = [
  HouseholdCategory.PANTRY,
  HouseholdCategory.HYGIENE,
  HouseholdCategory.MAINTENANCE,
  HouseholdCategory.PHARMACY,
  HouseholdCategory.PETS,
];

export interface HouseholdItem {
  id: string;
  categoryId: string;
  name: string;
  category: HouseholdCategory;
}

export interface HouseholdRecord {
  id: string;
  lastCheckedAt: string;
}
