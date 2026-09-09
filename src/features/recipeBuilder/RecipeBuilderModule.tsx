import { useState } from "react";
import { RotateCcw, FolderOpen } from "lucide-react";
import { useRecipeBuilderStore } from "../../shared/store/useRecipeBuilderStore";
import { suggestNextRecipeNumber } from "../../core/logic/recipeBuilder/recipeBuilderLogic";
import { RecipeMetaForm } from "./components/meta/RecipeMetaForm";
import { IngredientBuilderList } from "./components/ingredients/IngredientBuilderList";
import { SaveRecipePanel } from "./components/output/SaveRecipePanel";
import { MacroPreview } from "./components/output/MacroPreview";
import { PhotoPanel } from "./components/photo/PhotoPanel";
import { LoadRecipeModal } from "./components/LoadRecipeModal";

export const RecipeBuilderModule = () => {
  const { draft, patch, patchIngredients, reset, loadFromRecipe } = useRecipeBuilderStore();
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [mealPhoto, setMealPhoto] = useState<File | null>(null);
  const [bookPhoto, setBookPhoto] = useState<File | null>(null);

  const clearPhotos = () => {
    setMealPhoto(null);
    setBookPhoto(null);
  };

  const handleReset = () => {
    if (!draft.name && draft.ingredients.length === 0) return;
    reset();
    clearPhotos();
    const cat = useRecipeBuilderStore.getState().draft.categoryId;
    patch({ recipeNumber: suggestNextRecipeNumber(cat) });
  };

  const cardClass = "bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl";

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-3 sticky top-0 z-20 -mx-4 tablet:-mx-8 -mt-4 tablet:-mt-8 px-4 tablet:px-8 pt-4 tablet:pt-8 pb-2 bg-slate-50 lg:static lg:z-auto lg:m-0 lg:p-0 lg:pb-0 lg:bg-transparent">
        <h1 className="min-w-0 truncate text-base sm:text-lg font-black text-slate-800">Créateur de recette</h1>
        <div className="flex items-center gap-1 shrink-0">
          <SaveRecipePanel state={draft} mealPhoto={mealPhoto} bookPhoto={bookPhoto} onSaved={clearPhotos} />
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

      <div className="flex flex-col gap-3 lg:flex-1 lg:min-h-0 lg:flex-row">
        <div className="flex flex-col gap-3 lg:w-80 xl:w-96 lg:shrink-0 lg:overflow-y-auto lg:pr-1">
          <div className={`${cardClass} p-3 sm:p-4`}>
            <PhotoPanel
              state={draft}
              mealPhoto={mealPhoto}
              onPickMeal={setMealPhoto}
              bookPhoto={bookPhoto}
              onPickBook={setBookPhoto}
            />
          </div>
          <div className={`${cardClass} p-3 sm:p-4`}>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-3">Métadonnées</h2>
            <RecipeMetaForm state={draft} onChange={patch} />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-1 lg:min-h-0">
          <div className={`${cardClass} shrink-0 px-4 py-3`}>
            <MacroPreview ingredients={draft.ingredients} defaultPortions={draft.defaultPortions} />
          </div>

          <div className={`${cardClass} p-4 flex flex-col min-h-[40vh] lg:min-h-0 lg:flex-1 lg:overflow-hidden`}>
            <IngredientBuilderList ingredients={draft.ingredients} onChange={patchIngredients} />
          </div>
        </div>
      </div>

      {loadModalOpen && (
        <LoadRecipeModal onLoad={loadFromRecipe} onClose={() => setLoadModalOpen(false)} />
      )}
    </div>
  );
};
