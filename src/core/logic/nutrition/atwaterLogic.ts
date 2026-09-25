import { Macronutrients } from "../../domain/nutrition";

const ATWATER_FACTORS: Record<"proteins" | "lipids" | "carbohydrates" | "fibers", number> = {
  proteins: 4,
  carbohydrates: 4,
  lipids: 9,
  fibers: 2,
};

export function atwaterKcal(macros: Pick<Macronutrients, "proteins" | "lipids" | "carbohydrates" | "fibers">): number {
  return Math.round(
    macros.proteins * ATWATER_FACTORS.proteins +
      macros.lipids * ATWATER_FACTORS.lipids +
      macros.carbohydrates * ATWATER_FACTORS.carbohydrates +
      macros.fibers * ATWATER_FACTORS.fibers,
  );
}
