import { useState } from "react";
import { RotateCcw, FolderOpen } from "lucide-react";
import { useRecipeBuilderStore } from "../../shared/store/useRecipeBuilderStore";
import { RecipeMetaForm } from "./components/meta/RecipeMetaForm";
import { IngredientBuilderList } from "./components/ingredients/IngredientBuilderList";
import { OutputPanel } from "./components/output/OutputPanel";
import { MacroPreview } from "./components/output/MacroPreview";
import { LoadRecipeModal } from "./components/LoadRecipeModal";

export const RecipeBuilderModule = () => {
  const { draft, patch, patchIngredients, reset, loadFromRecipe } = useRecipeBuilderStore();
  const [loadModalOpen, setLoadModalOpen] = useState(false);

  const handleReset = () => {
    if (!draft.name && draft.ingredients.length === 0) return;
    reset();
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-800">Créateur de recette</h1>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">Compose ta recette, puis copie la sortie dans ton tableur.</p>
        </div>
        <div className="flex items-center gap-1">
          <OutputPanel state={draft} />
          <button
            type="button"
            onClick={() => setLoadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Charger</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Nouvelle recette"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvelle recette</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 overflow-hidden">
        <div className="shrink-0 lg:w-80 xl:w-96 flex flex-col gap-3 overflow-y-auto lg:overflow-y-visible">
          <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-3 sm:p-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2 sm:mb-3">Métadonnées</h2>
            <RecipeMetaForm state={draft} onChange={patch} />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
          <div className="shrink-0 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-4">
            <MacroPreview ingredients={draft.ingredients} defaultPortions={draft.defaultPortions} />
          </div>

          <div className="flex-1 min-h-0 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-4 overflow-hidden flex flex-col">
            <IngredientBuilderList
              ingredients={draft.ingredients}
              onChange={patchIngredients}
            />
          </div>
        </div>
      </div>

      {loadModalOpen && (
        <LoadRecipeModal
          onLoad={loadFromRecipe}
          onClose={() => setLoadModalOpen(false)}
        />
      )}
    </div>
  );
};
