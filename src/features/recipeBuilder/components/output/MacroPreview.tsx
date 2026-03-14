import { useMemo, useState } from "react";
import { Macronutrients } from "../../../../core/domain/types";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { computeDraftTotal } from "../../../../core/utils/recipeBuilderUtils";

export interface MacroPreviewProps {
  ingredients: DraftIngredient[];
  defaultPortions: number;
}

const MACRO_LABELS: { key: keyof Macronutrients; label: string; unit: string }[] = [
  { key: "kcal", label: "Kcal", unit: "" },
  { key: "proteins", label: "Protéines", unit: "g" },
  { key: "lipids", label: "Lipides", unit: "g" },
  { key: "carbohydrates", label: "Glucides", unit: "g" },
  { key: "fibers", label: "Fibres", unit: "g" },
];

export const MacroPreview = ({ ingredients, defaultPortions }: MacroPreviewProps) => {
  const [mode, setMode] = useState<"portion" | "total">("portion");

  const { macros: total, missing } = useMemo(() => computeDraftTotal(ingredients), [ingredients]);

  const portions = Math.max(defaultPortions, 1);
  const factor = mode === "portion" ? 1 / portions : 1;
  const displayed: Macronutrients = {
    kcal: total.kcal * factor,
    proteins: total.proteins * factor,
    lipids: total.lipids * factor,
    carbohydrates: total.carbohydrates * factor,
    fibers: total.fibers * factor,
  };

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
