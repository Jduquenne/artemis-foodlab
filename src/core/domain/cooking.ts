export type CookingMethod = "oven" | "steam" | "air_fryer" | "boiled" | "pan" | "microwave" | "pressure_cooker" | "raw";

export const COOKING_METHODS: readonly CookingMethod[] = [
  "oven",
  "steam",
  "air_fryer",
  "boiled",
  "pan",
  "microwave",
  "pressure_cooker",
  "raw",
];

export const COOKING_METHOD_LABELS: Record<CookingMethod, string> = {
  oven: "Four",
  steam: "Vapeur",
  air_fryer: "Airfryer",
  boiled: "À l'eau",
  pan: "Poêle",
  microwave: "Micro-ondes",
  pressure_cooker: "Cocotte-minute",
  raw: "Cru",
};

export const TEMPERATURE_COOKING_METHODS: readonly CookingMethod[] = ["oven", "air_fryer"];

export interface FoodCooking {
  foodId: string;
  method: CookingMethod;
  minMinutes: number | null;
  maxMinutes: number | null;
  temperatureC: number | null;
  cookedRatio: number | null;
  note: string | null;
  updatedAt: string;
}

export type FoodCookingInput = Omit<FoodCooking, "foodId" | "updatedAt">;

export const COOKING_LIMITS = {
  maxSheets: 8,
  minMinutes: 1,
  maxMinutes: 1440,
  minTemperature: 30,
  maxTemperature: 300,
  maxRatio: 10,
  ratioDecimals: 3,
  maxNoteLength: 120,
} as const;
