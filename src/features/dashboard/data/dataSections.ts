export type DataSectionId = "foods" | "recipes" | "outdoor" | "users";

export interface DataSection {
  id: DataSectionId;
  label: string;
}

export const DATA_SECTIONS: DataSection[] = [
  { id: "foods", label: "Aliments" },
  { id: "recipes", label: "Recettes" },
  { id: "outdoor", label: "Activités" },
  { id: "users", label: "Utilisateurs" },
];
