import { CheckCircle2, Circle } from "lucide-react";
import { HouseholdItem } from "../../../core/domain/types";

export interface HouseholdItemRowProps {
  item: HouseholdItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export const HouseholdItemRow = ({ item, isChecked, onToggle }: HouseholdItemRowProps) => {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors select-none cursor-pointer ${
        isChecked
          ? "bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20"
          : "hover:bg-slate-50 dark:hover:bg-slate-200/40"
      }`}
    >
      {isChecked
        ? <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
      }
      <span className={`text-xs font-medium truncate ${isChecked ? "text-orange-700 dark:text-orange-400" : "text-slate-800"}`}>
        {item.name}
      </span>
    </div>
  );
};
