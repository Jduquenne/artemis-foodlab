import { useState } from "react";
import { Copy, Check, Expand, X } from "lucide-react";
import { RecipeBuilderState, buildRecipeId } from "../types";

interface OutputPanelProps {
  state: RecipeBuilderState;
}

interface OutputItem {
  key: string;
  label: string;
  value: string;
}

function generateCsv(state: RecipeBuilderState): string {
  const cells: string[] = [
    buildRecipeId(state.categoryId, state.recipeNumber),
    state.name,
    String(state.defaultPortions),
    state.mealTypes,
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

function generateImageName(state: RecipeBuilderState, type: string): string {
  const id = buildRecipeId(state.categoryId, state.recipeNumber);
  const namePart = state.name.trim().replace(/ /g, "_");
  return `${id}_${namePart}_${type}`;
}

export const OutputPanel = ({ state }: OutputPanelProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<OutputItem | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const outputs: OutputItem[] = [
    { key: "csv", label: "CSV", value: generateCsv(state) },
    { key: "photo", label: "Photo", value: generateImageName(state, "Photo") },
    { key: "recette", label: "Recette", value: generateImageName(state, "Recette") },
    { key: "ingredients", label: "Ingrédients", value: generateImageName(state, "Ingrédients") },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wide">Sortie générée</h2>
        <div className="flex flex-col gap-1">
          {outputs.map(({ key, label, value }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-16 shrink-0 text-[11px] font-semibold text-slate-400">{label}</span>
              <span className="flex-1 min-w-0 px-2 py-1.5 bg-slate-100 dark:bg-slate-200 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono truncate">
                {value || <span className="text-slate-400 italic">—</span>}
              </span>
              <button
                type="button"
                onClick={() => copy(value, key)}
                title="Copier"
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                  copiedKey === key
                    ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                    : "text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                }`}
              >
                {copiedKey === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setExpanded({ key, label, value })}
                title="Afficher en grand"
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <Expand className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="bg-white dark:bg-slate-100 rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-3 p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700">{expanded.label}</h3>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              readOnly
              value={expanded.value}
              className="w-full h-32 px-3 py-2.5 bg-slate-100 dark:bg-slate-200 border border-slate-200 rounded-xl text-sm text-slate-700 font-mono resize-none focus:outline-none"
            />
            <button
              type="button"
              onClick={() => copy(expanded.value, expanded.key + "_modal")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                copiedKey === expanded.key + "_modal"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {copiedKey === expanded.key + "_modal" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey === expanded.key + "_modal" ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
