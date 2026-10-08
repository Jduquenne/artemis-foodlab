import { IngredientSource } from '../../../core/domain/shopping';
import { buildSourceCheckKey } from '../../../core/logic/shopping/shoppingChecks';
import { SlotType } from '../../../core/domain/planning';
import { pluralizeUnit } from '../../../core/logic/unit/unitFormatLogic';
import { formatSourceDayFull, formatSourceDayShort } from '../../../core/utils/dateUtils';
import { SLOT_LABELS } from '../../../shared/utils/slotLabels';
import { useAnyPendingKey } from '../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../shared/components/ui/CheckToggleIcon';
import { compareText } from "../../../core/utils/sortUtils";
import { sumBy } from '../../../core/utils/collectionUtils';

const formatSourceQty = (quantity: number, unit: string): string =>
  quantity === 0 ? '—' : `${parseFloat(quantity.toFixed(2))}\u00a0${pluralizeUnit(unit, quantity)}`;

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
    const sorted = [...group].sort((a, b) => compareText(a.isoDate, b.isoDate));
    const totalQty = sumBy(group, s => s.quantity);
    const unit = group[0].unit;
    const uniqueSlots = [...new Set(group.map(s => s.slot))];
    const slotLabel = uniqueSlots.length === 1 ? (SLOT_LABELS[uniqueSlots[0] as SlotType] ?? uniqueSlots[0]) : null;

    return (
      <div
        onClick={handleClick}
        className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
          allChecked ? 'opacity-40 bg-subtle-tint' : 'hover:bg-subtle-tint'
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
              {formatSourceQty(totalQty, unit)}
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
        isChecked ? 'opacity-40 bg-subtle-tint' : 'hover:bg-subtle-tint'
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
            {formatSourceQty(src.quantity, src.unit)}
          </span>
          {src.persons !== undefined && src.baseQuantity !== undefined && (
            <>
              <span className="mx-1 text-slate-300">·</span>
              <span className="text-slate-500 font-semibold">×{src.persons}</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className="text-slate-400">
                base&nbsp;{formatSourceQty(src.baseQuantity, src.unit)}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
