import { IngredientSource, buildSourceCheckKey } from '../../../core/logic/shopping/shoppingLogic';
import { SlotType } from '../../../core/domain/planning';
import { pluralizeUnit } from '../../../shared/utils/unitUtils';
import { formatSourceDayFull, formatSourceDayShort } from '../../../shared/utils/dateUtils';
import { SLOT_LABELS } from '../../../shared/utils/slotLabels';
import { useAnyPendingKey } from '../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../shared/components/ui/CheckToggleIcon';

export interface SourceGroupRowProps {
  ingredientKey: string;
  group: IngredientSource[];
  sourceChecked: Set<string>;
  onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
}

export const SourceGroupRow = ({ ingredientKey, group, sourceChecked, onToggleSource }: SourceGroupRowProps) => {
  const allChecked = group.every(s => sourceChecked.has(buildSourceCheckKey(ingredientKey, s)));
  const pending = useAnyPendingKey(group.map(s => `shopping-source:${buildSourceCheckKey(ingredientKey, s)}`));
  const handleClick = () => {
    if (pending) return;
    onToggleSource(ingredientKey, group, !allChecked);
  };

  if (group.length > 1) {
    const sorted = [...group].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    const totalQty = group.reduce((sum, s) => sum + s.quantity, 0);
    const unit = group[0].unit;
    const uniqueSlots = [...new Set(group.map(s => s.slot))];
    const slotLabel = uniqueSlots.length === 1 ? (SLOT_LABELS[uniqueSlots[0] as SlotType] ?? uniqueSlots[0]) : null;

    return (
      <div
        onClick={handleClick}
        className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
          allChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          <CheckToggleIcon checked={allChecked} pending={pending} className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold text-slate-800 leading-tight ${allChecked ? 'line-through' : ''}`}>
              {group[0].recipeName}
            </p>
            <span className="text-xs font-medium text-orange-500 shrink-0">
              {totalQty === 0 ? '—' : `${parseFloat(totalQty.toFixed(2))}\u00a0${pluralizeUnit(unit, totalQty)}`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {sorted.map(s => formatSourceDayShort(s.isoDate)).join(',\u00a0')}
            {slotLabel && <><span className="mx-1 text-slate-300">·</span>{slotLabel}</>}
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-medium text-slate-500">{group.length}×</span>
          </p>
        </div>
      </div>
    );
  }

  const src = group[0];
  const isChecked = sourceChecked.has(buildSourceCheckKey(ingredientKey, src));

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
        isChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <CheckToggleIcon checked={isChecked} pending={pending} className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold text-slate-800 leading-tight ${isChecked ? 'line-through' : ''}`}>
          {src.recipeName}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {formatSourceDayFull(src.isoDate)}
          <span className="mx-1 text-slate-300">·</span>
          {SLOT_LABELS[src.slot as SlotType] ?? src.slot}
          <span className="mx-1 text-slate-300">·</span>
          <span className="text-orange-500 font-medium">
            {src.quantity === 0 ? '—' : `${parseFloat(src.quantity.toFixed(2))}\u00a0${pluralizeUnit(src.unit, src.quantity)}`}
          </span>
          {src.persons !== undefined && src.baseQuantity !== undefined && (
            <>
              <span className="mx-1 text-slate-300">·</span>
              <span className="text-slate-500 font-semibold">×{src.persons}</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className="text-slate-400">
                base&nbsp;{src.baseQuantity === 0 ? '—' : `${parseFloat(src.baseQuantity.toFixed(2))}\u00a0${pluralizeUnit(src.unit, src.baseQuantity)}`}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
