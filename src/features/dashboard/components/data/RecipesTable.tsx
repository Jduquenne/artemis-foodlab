import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { RecipeDetails } from "../../../../core/domain/types";
import {
  RECIPE_KIND_FILTERS,
  RecipeKindFilter,
  filterRecipes,
} from "../../../../core/logic/dashboard/recipeTableLogic";
import { recipeToBuilderState } from "../../../../core/logic/recipeBuilder/recipeBuilderLogic";
import { useRecipeBuilderStore } from "../../../../shared/store/useRecipeBuilderStore";
import { useCatalogueRecipes } from "../../../../shared/hooks/useCatalogueRecipes";
import { RecipeRow } from "./RecipeRow";
import { ConfirmDeleteRecipeModal } from "./ConfirmDeleteRecipeModal";

export const RecipesTable = () => {
  const { recipes, remove } = useCatalogueRecipes();
  const navigate = useNavigate();
  const loadFromRecipe = useRecipeBuilderStore((s) => s.loadFromRecipe);
  const reset = useRecipeBuilderStore((s) => s.reset);
  const patch = useRecipeBuilderStore((s) => s.patch);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RecipeKindFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<RecipeDetails | null>(null);

  const filtered = useMemo(
    () => filterRecipes(recipes, query, kind),
    [recipes, query, kind],
  );

  const editInBuilder = (recipe: RecipeDetails) => {
    loadFromRecipe(recipeToBuilderState(recipe.code, recipe));
    navigate("/recipe-builder");
  };

  const createInBuilder = () => {
    reset();
    if (kind !== "all") patch({ kind });
    navigate("/recipe-builder");
  };

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-500 shrink-0">
          Recettes <span className="text-slate-400">· {filtered.length}</span>
        </h2>

        <div className="flex gap-1">
          {RECIPE_KIND_FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setKind(entry.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                kind === entry.id
                  ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                  : "text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-40 max-w-xs ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-100 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <button
          type="button"
          onClick={createInBuilder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shrink-0"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </header>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-slate-400">Aucune recette ne correspond.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((recipe) => (
            <RecipeRow
              key={recipe.code}
              recipe={recipe}
              onEdit={editInBuilder}
              onAskDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteRecipeModal
          recipe={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
};
