export enum HouseholdCategory {
  HYGIENE = "Hygiène",
  MAINTENANCE = "Entretien",
  PHARMACY = "Pharmacie",
  PANTRY = "Garde manger",
  PETS = "Animaux",
}

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
