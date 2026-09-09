export type DataSectionId = "foods" | "recipes";

export interface DataSection {
  id: DataSectionId;
  label: string;
}

export const DATA_SECTIONS: DataSection[] = [
  { id: "foods", label: "Aliments" },
  { id: "recipes", label: "Recettes" },
];
