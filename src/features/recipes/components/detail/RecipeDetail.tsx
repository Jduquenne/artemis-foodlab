import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calculator, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { typedRecipesDb } from '../../../../core/typed-db/typedRecipesDb';
import { typedFoodDb } from '../../../../core/typed-db/typedFoodDb';
import { calculateRecipeMacros } from '../../../../core/utils/macroUtils';
import { getLinkedBases } from '../../../../core/utils/recipeUtils';
import { recipeToBuilderState } from '../../../../core/utils/recipeBuilderUtils';
import { useRecipeBuilderStore } from '../../../../shared/store/useRecipeBuilderStore';
import { MacroColumn } from '../macro/MacroColumn';
import { MacroRow } from '../macro/MacroRow';

export const RecipeDetail = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLeaving, setIsLeaving] = useState(false);

  const recipe = recipeId ? typedRecipesDb[recipeId] : undefined;
  const recipeUrl = recipe?.assets?.instructionsPhoto?.url;
  const categoryId = searchParams.get('category');
  const loadFromRecipe = useRecipeBuilderStore(s => s.loadFromRecipe);

  const categoryRecipeIds = useMemo(() => {
    if (!categoryId) return [];
    return Object.entries(typedRecipesDb)
      .filter(([, r]) => r.categoryId === categoryId && r.assets?.instructionsPhoto)
      .map(([id]) => id);
  }, [categoryId]);

  const currentIndex = categoryRecipeIds.indexOf(recipeId ?? '');
  const prevId = currentIndex > 0 ? categoryRecipeIds[currentIndex - 1] : null;
  const nextId = currentIndex !== -1 && currentIndex < categoryRecipeIds.length - 1 ? categoryRecipeIds[currentIndex + 1] : null;

  const macros = useMemo(() => {
    if (!recipe) return null;
    try {
      return calculateRecipeMacros(recipe, typedRecipesDb, typedFoodDb);
    } catch {
      return null;
    }
  }, [recipe]);

  const linkedBases = useMemo(() => (recipe ? getLinkedBases(recipe) : []), [recipe]);

  if (!recipe || !recipeUrl) return null;

  const handleEditInBuilder = () => {
    loadFromRecipe(recipeToBuilderState(recipeId!, recipe));
    navigate('/recipe-builder');
  };

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate(-1), 280);
  };

  const navigateTo = (id: string) => {
    navigate(`/recipes/detail/${id}?category=${categoryId}`, { replace: true });
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-50 flex flex-col p-4 md:p-6 ${isLeaving ? 'modal-center-exit' : 'modal-center-enter'}`}>

      <div className="flex items-center gap-3 shrink-0 mb-4">
        <button
          aria-label="Retour"
          onClick={handleBack}
          className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-xl tablet:text-2xl font-black text-slate-900 leading-snug">
          {recipe.name}
        </h1>
        <button
          aria-label="Modifier dans le créateur"
          onClick={handleEditInBuilder}
          className="ml-auto p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          aria-label="Calculateur nutritionnel"
          onClick={() => navigate(`/recipes/detail/${recipeId}/macros`)}
          className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <Calculator className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center gap-2">

        {categoryId && (
          <button
            aria-label="Recette précédente"
            onClick={() => prevId && navigateTo(prevId)}
            disabled={!prevId}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {linkedBases.length > 0 && (
          <div className="hidden sm:flex flex-1 min-h-0 items-center justify-end pr-3">
            <div className="flex flex-col items-center gap-3">
              {linkedBases.map(({ id, name, photoUrl }) => (
                <a
                  key={id}
                  href={`#/recipes/detail/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <img
                    src={photoUrl}
                    alt={name}
                    className="h-28 md:h-32 rounded-2xl shadow-md ring-1 ring-slate-200 dark:ring-slate-300 group-hover:opacity-75 group-hover:ring-orange-300 transition-all"
                  />
                  <span className="text-xs font-semibold text-slate-500 text-center w-20 leading-tight line-clamp-2">{name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <img
          src={recipeUrl}
          alt={recipe.name}
          className="flex-[3] min-w-0 max-h-full object-contain rounded-2xl shadow-sm"
        />

        <div className="hidden sm:flex flex-1 min-h-0 items-center justify-start pl-3">
          {macros && <MacroColumn macros={macros} />}
        </div>

        {categoryId && (
          <button
            aria-label="Recette suivante"
            onClick={() => nextId && navigateTo(nextId)}
            disabled={!nextId}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

      </div>

      {(macros || linkedBases.length > 0) && (
        <div className="flex sm:hidden shrink-0 pt-3 items-center gap-4">
          {macros && <MacroRow macros={macros} />}
          {linkedBases.length > 0 && (
            <div className="flex gap-3 items-center">
              {linkedBases.map(({ id, name, photoUrl }) => (
                <a
                  key={id}
                  href={`#/recipes/detail/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <img
                    src={photoUrl}
                    alt={name}
                    className="h-14 rounded-xl shadow-md ring-1 ring-slate-200 dark:ring-slate-300 group-hover:opacity-75 group-hover:ring-orange-300 transition-all"
                  />
                  <span className="text-[10px] font-semibold text-slate-500 text-center w-14 leading-tight line-clamp-2">{name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
