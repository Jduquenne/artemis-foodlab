import { FILTER_TYPE_DEFINITIONS, RecipeFilterType } from '../../../../core/domain/recipeFilter';

export interface FilterTypeSelectorProps {
  value: RecipeFilterType | null;
  counts: Record<RecipeFilterType, number>;
  onChange: (type: RecipeFilterType | null) => void;
}

export const FilterTypeSelector = ({ value, counts, onChange }: FilterTypeSelectorProps) => (
  <div role="radiogroup" aria-label="Type de recette" className="grid grid-cols-3 gap-2">
    {FILTER_TYPE_DEFINITIONS.map(({ type, label }) => {
      const selected = value === type;
      return (
        <button
          key={type}
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(selected ? null : type)}
          className={[
            'flex flex-col items-center justify-center gap-0.5 px-2 py-3 min-h-14 rounded-2xl border text-sm font-bold text-center leading-tight transition-colors',
            selected
              ? 'bg-orange-500 border-orange-400 text-white shadow-sm'
              : 'bg-surface border-slate-200 text-slate-600 hover:bg-muted',
          ].join(' ')}
        >
          <span>{label}</span>
          <span className={`text-[11px] font-semibold tabular-nums ${selected ? 'text-orange-100' : 'text-slate-400'}`}>
            {counts[type]}
          </span>
        </button>
      );
    })}
  </div>
);
