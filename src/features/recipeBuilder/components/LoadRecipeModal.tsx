import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { typedRecipesDb } from "../../../core/typed-db/typedRecipesDb";
import { recipeToBuilderState } from "../../../core/utils/recipeBuilderUtils";
import { RecipeBuilderState } from "../../../core/domain/recipeBuilderTypes";

export interface LoadRecipeModalProps {
  onLoad: (state: RecipeBuilderState) => void;
  onClose: () => void;
}

const ALL_RECIPES = Object.entries(typedRecipesDb);

export const LoadRecipeModal = ({ onLoad, onClose }: LoadRecipeModalProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return ALL_RECIPES
      .filter(([, r]) => r.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [query]);

  const handleSelect = (recipeId: string) => {
    const recipe = typedRecipesDb[recipeId];
    if (!recipe) return;
    onLoad(recipeToBuilderState(recipeId, recipe));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-slate-50 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[80dvh] modal-enter sm:modal-center-enter">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-base font-black text-slate-900">Charger une recette existante</h2>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="Rechercher une recette…"
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
          {query.trim().length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Tape le nom d'une recette pour commencer</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucune recette trouvée</p>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map(([id, recipe]) => (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left hover:bg-white dark:hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{id}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                    {recipe.kind}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
