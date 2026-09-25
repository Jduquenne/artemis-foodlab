import { FreezerBag } from '../../../core/domain/freezer';
import { pluralizeUnit, formatQty } from '../../../shared/utils/unitUtils';
import { formatBagDate } from '../../../shared/utils/dateUtils';
import { usePendingKey } from '../../../shared/hooks/usePendingKey';
import { CheckToggleIcon } from '../../../shared/components/ui/CheckToggleIcon';
import { bagQuantity } from '../../../core/logic/freezer/freezerLogic';

export interface FreezerBagRowProps {
  bag: FreezerBag;
  isSelected: boolean;
  onToggleBag?: (bagId: string) => void;
}

export const FreezerBagRow = ({ bag, isSelected, onToggleBag }: FreezerBagRowProps) => {
  const pending = usePendingKey(`shopping-bag:${bag.id}`);
  const qty = bagQuantity(bag);

  return (
    <div
      onClick={() => !pending && onToggleBag?.(bag.id)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none transition-all ${
        isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
      }`}
    >
      <div className="shrink-0">
        <CheckToggleIcon checked={isSelected} pending={pending} className="w-4 h-4" checkedClassName="text-cyan-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {formatQty(qty)} {pluralizeUnit(bag.unit, qty)}
        </p>
        <p className="text-xs text-slate-400">
          {formatBagDate(bag.addedDate)}
          {bag.preparation && <><span className="mx-1 text-slate-300">·</span>{bag.preparation}</>}
        </p>
      </div>
    </div>
  );
};
