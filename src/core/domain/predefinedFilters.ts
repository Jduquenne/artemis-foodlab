import { PredefinedFilter } from "./types";

export const PREDEFINED_FILTERS: PredefinedFilter[] = [
  {
    id: "low-kcal",
    label: "Moins de 500 kcal",
    check: (m) => m.KCAL < 500,
  },
  {
    id: "extra-low-kcal",
    label: "Moins de 400 kcal",
    check: (m) => m.KCAL < 400,
  },
  {
    id: "high-protein",
    label: "Riche en protéines (> 30g)",
    check: (m) => m.proteins > 30,
  },
  {
    id: "low-carb",
    label: "Pauvre en glucides (< 40g)",
    check: (m) => m.carbohydrate < 40,
  },
  {
    id: "low-lipid",
    label: "Pauvre en lipides (< 19g)",
    check: (m) => m.lipids < 19,
  },
  {
    id: "high-fiber",
    label: "Riche en fibres (> 10g)",
    check: (m) => m.fibers > 10,
  },
];
