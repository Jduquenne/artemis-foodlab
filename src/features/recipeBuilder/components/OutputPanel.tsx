import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { RecipeBuilderState, buildRecipeId } from "../types";

interface OutputPanelProps {
  state: RecipeBuilderState;
}

function formatMealTypes(mealTypes: RecipeBuilderState["mealTypes"]): string {
  return mealTypes;
}

function generateOutput(state: RecipeBuilderState): string {
  const cells: string[] = [
    buildRecipeId(state.categoryId, state.recipeNumber),
    state.name,
    String(state.defaultPortions),
    formatMealTypes(state.mealTypes),
    state.kind,
    state.batchCooking ? "TRUE" : "FALSE",
  ];

  for (const ing of state.ingredients) {
    cells.push(ing.name);
    const qtyUnit =
      ing.quantity != null
        ? `${ing.quantity}${ing.unit ? " " + ing.unit : ""}`.trim()
        : "";
    cells.push(qtyUnit);
  }

  return cells.join("\t");
}

export const OutputPanel = ({ state }: OutputPanelProps) => {
  const [copied, setCopied] = useState(false);

  const output = generateOutput(state);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wide">Sortie générée</h2>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            copied
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
      <textarea
        readOnly
        value={output}
        className="w-full h-28 px-3 py-2.5 bg-slate-100 dark:bg-slate-200 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono resize-none focus:outline-none"
      />
    </div>
  );
};
