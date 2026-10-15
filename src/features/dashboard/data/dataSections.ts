export type DataSectionId = "foods" | "foodGroups" | "recipes" | "outdoor" | "users";

export interface DataSection {
  id: DataSectionId;
  label: string;
}

export const DATA_SECTIONS: DataSection[] = [
  { id: "foods", label: "Aliments" },
  { id: "foodGroups", label: "Familles" },
  { id: "recipes", label: "Recettes" },
  { id: "outdoor", label: "Activités" },
  { id: "users", label: "Utilisateurs" },
];
