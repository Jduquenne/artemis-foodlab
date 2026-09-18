import { HouseholdItem } from '../../../core/domain/types';
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
    <div
      onClick={() => !pending && onToggle(key)}
      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none
        ${isChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
    >
      <CheckToggleIcon checked={isChecked} pending={pending} />
      <span className={`text-xs font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
        {item.name}
      </span>
    </div>
  );
};
