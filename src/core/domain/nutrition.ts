export interface Macronutrients {
  kcal: number;
  proteins: number;
  lipids: number;
  carbohydrates: number;
  fibers: number;
}

export interface MacroTargets {
  proteins: number;
  lipids: number;
  carbohydrates: number;
  fibers: number;
}

export type NutrientKey = keyof MacroTargets;

export interface NutrientDefinition {
  key: NutrientKey;
  label: string;
  shortLabel: string;
  unit: string;
}

export const NUTRIENT_DEFINITIONS: readonly NutrientDefinition[] = [
  { key: "proteins", label: "Protéines", shortLabel: "Prot.", unit: "g" },
  { key: "lipids", label: "Lipides", shortLabel: "Lip.", unit: "g" },
  { key: "carbohydrates", label: "Glucides", shortLabel: "Gluc.", unit: "g" },
  { key: "fibers", label: "Fibres", shortLabel: "Fib.", unit: "g" },
];

export interface MacroDisplay {
  key: keyof Macronutrients;
  label: string;
  shortLabel: string;
  unit: string;
}

export const KCAL_DISPLAY: MacroDisplay = { key: "kcal", label: "Kcal", shortLabel: "Kcal", unit: "" };

export const MACRO_DISPLAYS: readonly MacroDisplay[] = [KCAL_DISPLAY, ...NUTRIENT_DEFINITIONS];
