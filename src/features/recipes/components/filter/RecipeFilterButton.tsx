import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterCandidate, RecipeFilter } from '../../../../core/domain/recipeFilter';
import { countFilterCriteria } from '../../../../core/logic/recipe/recipeFilterLogic';
import { RecipeFilterModal } from './RecipeFilterModal';

export interface RecipeFilterButtonProps {
  filter: RecipeFilter;
  candidates: FilterCandidate[];
  onApply: (filter: RecipeFilter) => void;
}

export const RecipeFilterButton = ({ filter, candidates, onApply }: RecipeFilterButtonProps) => {
  const [open, setOpen] = useState(false);
  const criteriaCount = countFilterCriteria(filter);
  const active = criteriaCount > 0;

  return (
    <>
      <button
        aria-label="Filtres"
        onClick={() => setOpen(true)}
        className={[
          'relative flex items-center gap-1.5 px-3 py-2.5 rounded-2xl shadow-sm border font-bold text-sm transition-colors shrink-0',
          active
            ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
            : 'bg-surface border-slate-200 text-slate-500 hover:bg-muted',
        ].join(' ')}
      >
        <SlidersHorizontal size={16} />
        {active && <span className="text-xs tabular-nums">{criteriaCount}</span>}
      </button>

      {open && (
        <RecipeFilterModal
          filter={filter}
          candidates={candidates}
          onSubmit={(next) => { onApply(next); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
