import { Macronutrients } from "./nutrition";

export interface PredefinedFilterDefinition {
  id: string;
  macro: keyof Macronutrients;
  comparison: "below" | "above";
  threshold: number;
  dynamic?: boolean;
  title: string;
}

export const MACRO_REFERENCE_EXCLUDED_CATEGORY_IDS: readonly string[] = ["cereal-products", "pastries"];

export const PREDEFINED_FILTER_DEFINITIONS: readonly PredefinedFilterDefinition[] = [
  { id: "low-kcal", macro: "kcal", comparison: "below", threshold: 450, title: "" },
  { id: "extra-low-kcal", macro: "kcal", comparison: "below", threshold: 350, title: "" },
  { id: "high-protein", macro: "proteins", comparison: "above", threshold: 30, dynamic: true, title: "Riche en protéines" },
  { id: "low-carb", macro: "carbohydrates", comparison: "below", threshold: 40, dynamic: true, title: "Pauvre en glucides" },
  { id: "low-lipid", macro: "lipids", comparison: "below", threshold: 19, dynamic: true, title: "Pauvre en lipides" },
  { id: "high-fiber", macro: "fibers", comparison: "above", threshold: 10, dynamic: true, title: "Riche en fibres" },
];
