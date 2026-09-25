import { HouseholdItem } from "../../../core/domain/household";
import { usePendingKey } from "../../../shared/hooks/usePendingKey";
import { CheckToggleIcon } from "../../../shared/components/ui/CheckToggleIcon";

export interface HouseholdItemRowProps {
  item: HouseholdItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export const HouseholdItemRow = ({ item, isChecked, onToggle }: HouseholdItemRowProps) => {
  const pending = usePendingKey(`household-check:${item.id}`);

  return (
    <div
      onClick={() => !pending && onToggle(item.id)}
      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors select-none cursor-pointer ${
        isChecked
          ? "bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20"
          : "hover:bg-slate-50 dark:hover:bg-slate-200/40"
      }`}
    >
      <CheckToggleIcon checked={isChecked} pending={pending} checkedClassName="text-orange-500" />
      <span className={`text-xs font-medium truncate ${isChecked ? "text-orange-700 dark:text-orange-400" : "text-slate-800"}`}>
        {item.name}
      </span>
    </div>
  );
};
