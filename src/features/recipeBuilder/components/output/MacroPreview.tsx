import { useMemo, useState } from "react";
import { Macronutrients } from "../../../../core/domain/types";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { computeDraftTotal } from "../../../../core/logic/recipeBuilder/recipeBuilderLogic";

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
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Macros estimées</span>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 shrink-0">
          {(["portion", "total"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                mode === m
                  ? "bg-orange-500 text-white"
                  : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
              }`}
            >
              {m === "portion" ? "Portion" : `Total ×${portions}`}
            </button>
          ))}
        </div>
      </div>

      {!hasIngredients ? (
        <p className="text-xs text-slate-400 py-1.5">Aucun ingrédient ajouté</p>
      ) : (
        <div className="flex justify-between gap-2">
          {MACRO_LABELS.map(({ key, label, unit }) => (
            <div
              key={key}
              className="flex-1 flex flex-col items-center gap-0.5 bg-slate-100 dark:bg-slate-200 rounded-xl px-1 py-1.5"
            >
              <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide leading-none">{label}</span>
              <span className="text-base font-bold text-slate-800 leading-none tabular-nums">
                {Math.round(displayed[key])}
                {unit}
              </span>
            </div>
          ))}
        </div>
      )}

      {missing > 0 && hasIngredients && (
        <p className="text-[10px] text-slate-400">
          {missing} ingrédient{missing > 1 ? "s" : ""} sans données
        </p>
      )}
    </div>
  );
};
