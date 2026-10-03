import { MacroComparison } from '../../../../core/domain/recipeFilter';
import { MacroDisplay } from '../../../../core/domain/nutrition';
import { formatMacroValue } from '../../../../core/logic/recipe/recipeFilterLogic';

export interface MacroMedianRowProps {
  display: MacroDisplay;
  median: number | undefined;
  value: MacroComparison | undefined;
  onChange: (comparison: MacroComparison | null) => void;
}

const OPTIONS: { comparison: MacroComparison; label: string }[] = [
  { comparison: 'below', label: 'Moins' },
  { comparison: 'above', label: 'Plus' },
];

export const MacroMedianRow = ({ display, median, value, onChange }: MacroMedianRowProps) => {
  const disabled = median === undefined;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-100 border border-slate-200">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700 leading-tight">{display.label}</p>
        <p className="text-[11px] text-slate-400 tabular-nums">
          {median === undefined ? 'Aucune donnée' : `médiane ${formatMacroValue(display, median)}`}
        </p>
      </div>
      <div role="group" aria-label={display.label} className="flex shrink-0 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-200">
        {OPTIONS.map(({ comparison, label }) => {
          const selected = value === comparison;
          return (
            <button
              key={comparison}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : comparison)}
              className={[
                'min-w-16 px-3 py-2 rounded-[10px] text-xs font-bold transition-colors disabled:opacity-40',
                selected ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
