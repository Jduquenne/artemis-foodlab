import { HouseholdItem } from '../../../core/domain/household';
import { HouseholdCheckRow } from './HouseholdCheckRow';

export interface HouseholdShoppingCardProps {
  items: HouseholdItem[];
  checked: Set<string>;
  onToggle: (key: string) => void;
}

export const HouseholdShoppingCard = ({ items, checked, onToggle }: HouseholdShoppingCardProps) => {
  const checkedCount = items.filter(i => checked.has(`household::${i.id}`)).length;

  return (
    <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-xl p-2 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">Articles du quotidien</h2>
        {checkedCount > 0 && (
          <span className="text-xs text-slate-400 font-medium">{checkedCount}/{items.length}</span>
        )}
      </div>
      <div className="space-y-0.5">
        {items.map(item => (
          <HouseholdCheckRow
            key={item.id}
            item={item}
            isChecked={checked.has(`household::${item.id}`)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};
