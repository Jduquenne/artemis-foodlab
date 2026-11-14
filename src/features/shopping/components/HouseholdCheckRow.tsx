import { HouseholdItem } from '../../../core/domain/household';
import { usePendingKey } from '../../../shared/hooks/usePendingKey';
import { CheckToggleIcon } from '../../../shared/components/ui/CheckToggleIcon';

export interface HouseholdCheckRowProps {
  item: HouseholdItem;
  isChecked: boolean;
  onToggle: (key: string) => void;
}

export const HouseholdCheckRow = ({ item, isChecked, onToggle }: HouseholdCheckRowProps) => {
  const key = `household::${item.id}`;
  const pending = usePendingKey(`shopping-check:${key}`);

  return (
    <button
      type="button"
      onClick={() => !pending && onToggle(key)}
      aria-pressed={isChecked}
      className={`flex items-center gap-3 w-full px-3 py-2 min-h-13 border-t border-slate-200 first:border-t-0 text-left hover:bg-subtle-tint transition-colors lg:min-h-10 lg:py-1.5 ${isChecked ? 'opacity-50' : ''}`}
    >
      <CheckToggleIcon checked={isChecked} pending={pending} className="w-5 h-5" checkedClassName="text-orange-500" />
      <span className={`text-[15px] font-semibold text-slate-900 truncate lg:text-sm ${isChecked ? 'line-through' : ''}`}>
        {item.name}
      </span>
    </button>
  );
};
