import { Macronutrients } from "./types";

export interface PredefinedFilterDefinition {
  id: string;
  macro: keyof Macronutrients;
  comparison: "below" | "above";
  threshold: number;
  title: string;
}

export const PREDEFINED_FILTER_DEFINITIONS: readonly PredefinedFilterDefinition[] = [
  { id: "low-kcal", macro: "kcal", comparison: "below", threshold: 500, title: "" },
  { id: "extra-low-kcal", macro: "kcal", comparison: "below", threshold: 400, title: "" },
  { id: "high-protein", macro: "proteins", comparison: "above", threshold: 30, title: "Riche en protéines" },
  { id: "low-carb", macro: "carbohydrates", comparison: "below", threshold: 40, title: "Pauvre en glucides" },
  { id: "low-lipid", macro: "lipids", comparison: "below", threshold: 19, title: "Pauvre en lipides" },
  { id: "high-fiber", macro: "fibers", comparison: "above", threshold: 10, title: "Riche en fibres" },
];
