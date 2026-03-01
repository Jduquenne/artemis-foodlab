import { CheckCircle2, Circle } from "lucide-react";
import { HouseholdItem } from "../../../core/domain/types";

interface HouseholdItemRowProps {
  item: HouseholdItem;
  isChecked: boolean;
  onVerify: (id: string) => void;
}

export const HouseholdItemRow = ({ item, isChecked, onVerify }: HouseholdItemRowProps) => {
  return (
    <div
      onClick={() => { if (!isChecked) onVerify(item.id); }}
      className={`flex items-center gap-2 px-2 py-2.5 rounded-xl transition-colors select-none ${
        isChecked
          ? "opacity-40"
          : "hover:bg-slate-50 dark:hover:bg-slate-200/40 cursor-pointer"
      }`}
    >
      {isChecked
        ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        : <Circle className="w-4 h-4 text-orange-400 shrink-0" />
      }
      <span className={`text-sm font-medium text-slate-800 truncate ${isChecked ? "line-through" : ""}`}>
        {item.name}
      </span>
    </div>
  );
};
