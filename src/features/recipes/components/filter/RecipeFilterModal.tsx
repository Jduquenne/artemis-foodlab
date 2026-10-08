import { useMemo, useState } from 'react';
import { X, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { EMPTY_RECIPE_FILTER, FILTER_TYPE_DEFINITIONS, FilterCandidate, RecipeFilter, RecipeFilterType } from '../../../../core/domain/recipeFilter';
import { MACRO_DISPLAYS } from '../../../../core/domain/nutrition';
import {
  filterRecipesByFilter,
  isRecipeFilterActive,
  setFilterType,
  setFilterMacro,
} from '../../../../core/logic/recipe/recipeFilterLogic';
import { getFilterTypeLabel, matchesFilterType } from '../../../../core/logic/recipe/recipeFilterTypeLogic';
import { useTypeMedians } from '../../../../shared/hooks/useTypeMedians';
import { useRecipesSnapshot, useRecipeMetricsSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';
import { FilterTypeSelector } from './FilterTypeSelector';
import { MacroMedianRow } from './MacroMedianRow';

export interface RecipeFilterModalProps {
  filter: RecipeFilter;
  candidates: FilterCandidate[];
  onSubmit: (filter: RecipeFilter) => void;
  onClose: () => void;
}

export const RecipeFilterModal = ({ filter, candidates, onSubmit, onClose }: RecipeFilterModalProps) => {
  const [draft, setDraft] = useState<RecipeFilter>(filter);
  const [isClosing, setIsClosing] = useState(false);
  const recipes = useRecipesSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  const medians = useTypeMedians();

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  const typeCounts = useMemo(() => {
    const counts = { [RecipeFilterType.DISH]: 0, [RecipeFilterType.BREAKFAST]: 0, [RecipeFilterType.SNACK]: 0 };
    for (const candidate of candidates) {
      const recipe = recipes[candidate.recipeId ?? candidate.id];
      if (!recipe) continue;
      for (const { type } of FILTER_TYPE_DEFINITIONS) {
        if (matchesFilterType(recipe, type)) counts[type] += 1;
      }
    }
    return counts;
  }, [candidates, recipes]);

  const matchCount = useMemo(
    () => filterRecipesByFilter(candidates, recipes, macros, draft, medians).length,
    [candidates, recipes, macros, draft, medians],
  );

  const active = isRecipeFilterActive(draft);
  const typeMedians = draft.type === null ? null : medians[draft.type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className={`w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh] ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>

        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Filtres</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDraft(EMPTY_RECIPE_FILTER)}
              disabled={!active}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
            <button
              aria-label="Fermer"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
          <section className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Type de recette</h3>
            <FilterTypeSelector
              value={draft.type}
              counts={typeCounts}
              onChange={(type) => setDraft(setFilterType(draft, type))}
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Macros par portion</h3>
            {typeMedians === null || draft.type === null ? (
              <p className="px-4 py-6 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
                Choisis un type de recette pour comparer ses macros à la médiane.
              </p>
            ) : (
              <>
                <p className="text-[11px] text-slate-400">
                  Comparé à la médiane du catalogue pour : {getFilterTypeLabel(draft.type)}.
                </p>
                <div className="space-y-2">
                  {MACRO_DISPLAYS.map((display) => (
                    <MacroMedianRow
                      key={display.key}
                      display={display}
                      median={typeMedians[display.key]}
                      value={draft.macros[display.key]}
                      onChange={(comparison) => setDraft(setFilterMacro(draft, display.key, comparison))}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-200 bg-white dark:bg-slate-100 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleClose}
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit(draft)}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            {active ? `Voir ${matchCount} résultat${matchCount > 1 ? 's' : ''}` : 'Appliquer'}
          </button>
        </div>
      </div>
    </div>
  );
};
