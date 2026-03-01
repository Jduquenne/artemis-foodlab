import { HouseholdItem } from "../../../core/domain/types";
import { HouseholdItemRow } from "./HouseholdItemRow";

interface HouseholdCategoryCardProps {
  label: string;
  items: HouseholdItem[];
  checkedIds: Set<string>;
  onVerify: (id: string) => void;
}

export const HouseholdCategoryCard = ({ label, items, checkedIds, onVerify }: HouseholdCategoryCardProps) => {
  return (
    <div className="break-inside-avoid mb-4">
      <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-3 shadow-sm">
        <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs mb-2">
          {label}
        </h2>
        <div className="space-y-0.5">
          {items.map(item => (
            <HouseholdItemRow
              key={item.id}
              item={item}
              isChecked={checkedIds.has(item.id)}
              onVerify={onVerify}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
