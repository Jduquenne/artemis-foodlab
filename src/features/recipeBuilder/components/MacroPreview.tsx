import { useMemo, useState } from "react";
import { Food, Macronutrients, RecipeDetails, Unit } from "../../../core/domain/types";
import { calculateRecipeMacros } from "../../../core/utils/macroUtils";
import foodDbRaw from "../../../core/data/food-db.json";
import recipesDbRaw from "../../../core/data/recipes-db.json";
import { DraftIngredient } from "../types";

interface MacroPreviewProps {
  ingredients: DraftIngredient[];
  defaultPortions: number;
}

const foodDb = foodDbRaw as unknown as Record<string, Food>;
const recipesDb = recipesDbRaw as unknown as Record<string, RecipeDetails>;

const ZERO: Macronutrients = { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };

function add(a: Macronutrients, b: Macronutrients): Macronutrients {
  return {
    kcal: a.kcal + b.kcal,
    proteins: a.proteins + b.proteins,
    lipids: a.lipids + b.lipids,
    carbohydrates: a.carbohydrates + b.carbohydrates,
    fibers: a.fibers + b.fibers,
  };
}

function scaleM(m: Macronutrients, f: number): Macronutrients {
  return {
    kcal: m.kcal * f,
    proteins: m.proteins * f,
    lipids: m.lipids * f,
    carbohydrates: m.carbohydrates * f,
    fibers: m.fibers * f,
  };
}

function toGrams(qty: number, unit: Unit, unitWeight?: number): number | null {
  switch (unit) {
    case Unit.G: return qty;
    case Unit.KG: return qty * 1000;
    case Unit.ML: return qty;
    case Unit.PIECE:
    case Unit.PORTION:
    case Unit.TRANCHE:
    case Unit.FEUILLE:
    case Unit.SACHET:
      return unitWeight != null ? qty * unitWeight : null;
    default: return null;
  }
}

function computeTotal(ingredients: DraftIngredient[]): { macros: Macronutrients; missing: number } {
  let total = { ...ZERO };
  let missing = 0;

  for (const ing of ingredients) {
    if (ing.quantity == null || ing.quantity === 0) continue;

    if (ing.foodId) {
      const food = foodDb[ing.foodId];
      if (!food) { missing++; continue; }
      const grams = toGrams(ing.quantity, ing.unit, food.unitWeight);
      if (grams == null) { missing++; continue; }
      total = add(total, scaleM(food.macros, grams / 100));
    } else if (ing.baseId) {
      const base = recipesDb[ing.baseId];
      if (!base) { missing++; continue; }
      const basePerPortion = calculateRecipeMacros(base, recipesDb, foodDb);
      total = add(total, scaleM(basePerPortion, ing.quantity));
    } else {
      missing++;
    }
  }

  return { macros: total, missing };
}

const MACRO_LABELS = [
  { key: "kcal" as const, label: "Kcal", unit: "" },
  { key: "proteins" as const, label: "Protéines", unit: "g" },
  { key: "lipids" as const, label: "Lipides", unit: "g" },
  { key: "carbohydrates" as const, label: "Glucides", unit: "g" },
  { key: "fibers" as const, label: "Fibres", unit: "g" },
];

export const MacroPreview = ({ ingredients, defaultPortions }: MacroPreviewProps) => {
  const [mode, setMode] = useState<"portion" | "total">("portion");

  const { macros: total, missing } = useMemo(() => computeTotal(ingredients), [ingredients]);

  const portions = Math.max(defaultPortions, 1);
  const displayed = mode === "portion" ? scaleM(total, 1 / portions) : total;

  const hasIngredients = ingredients.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wide">Macros estimées</h2>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("portion")}
            className={`px-2.5 py-1 text-xs font-bold transition-colors ${
              mode === "portion"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
            }`}
          >
            Par portion
          </button>
          <button
            type="button"
            onClick={() => setMode("total")}
            className={`px-2.5 py-1 text-xs font-bold border-l border-slate-200 transition-colors ${
              mode === "total"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
            }`}
          >
            Total ({portions})
          </button>
        </div>
      </div>

      {!hasIngredients ? (
        <p className="text-xs text-slate-400 text-center py-1">Aucun ingrédient ajouté</p>
      ) : (
        <div className="flex gap-1.5 sm:gap-2">
          {MACRO_LABELS.map(({ key, label, unit }) => (
            <div key={key} className="flex-1 flex flex-col items-center bg-slate-100 dark:bg-slate-200 rounded-xl px-1 sm:px-2 py-1 sm:py-1.5">
              <span className="text-[8px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 leading-none tabular-nums">
                {Math.round(displayed[key])}{unit}
              </span>
            </div>
          ))}
        </div>
      )}

      {missing > 0 && hasIngredients && (
        <p className="text-[10px] text-slate-400">
          {missing} ingrédient{missing > 1 ? "s" : ""} sans données (foodId manquant ou unité non convertible)
        </p>
      )}
    </div>
  );
};
