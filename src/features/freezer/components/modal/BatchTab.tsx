import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { isBatchCookable } from "../../../../core/domain/recipePredicates";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";

export interface BatchTabProps {
  selectedRecipeId: string | null;
  portions: number;
  onSelectRecipe: (id: string | null, name?: string) => void;
  onPortionsChange: (p: number) => void;
}

export const BatchTab = ({ selectedRecipeId, portions, onSelectRecipe, onPortionsChange }: BatchTabProps) => {
  const [search, setSearch] = useState("");

  const recipes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return Object.entries(typedRecipesDb)
      .filter(([, r]) => r.assets?.photo && (!q || r.name.toLowerCase().includes(q)))
      .sort(([, a], [, b]) => {
        const aBatch = isBatchCookable(a);
        const bBatch = isBatchCookable(b);
        if (aBatch && !bBatch) return -1;
        if (!aBatch && bBatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 30)
      .map(([id, r]) => ({ id, name: r.name, isBatch: isBatchCookable(r) }));
  }, [search]);

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); onSelectRecipe(null, undefined); }}
          placeholder="Chercher une recette..."
          className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {recipes.map(r => (
          <button
            key={r.id}
            onClick={() => onSelectRecipe(r.id, r.name)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-colors ${
              selectedRecipeId === r.id
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-slate-100 text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-200"
            }`}
          >
            <span className="text-sm font-semibold truncate">{r.name}</span>
            {r.isBatch && (
              <span className={`shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedRecipeId === r.id ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
              }`}>
                BATCH
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedRecipeId && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre de repas</label>
          <div className="flex items-center gap-4">
            <button
              aria-label="Diminuer"
              onClick={() => onPortionsChange(Math.max(1, portions - 1))}
              className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              −
            </button>
            <span className="text-2xl font-black text-slate-900 w-8 text-center">{portions}</span>
            <button
              aria-label="Augmenter"
              onClick={() => onPortionsChange(portions + 1)}
              className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}
    </>
  );
};
