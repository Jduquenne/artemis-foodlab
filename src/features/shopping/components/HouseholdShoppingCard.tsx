import { HouseholdItem } from '../../../core/domain/household';
import { HouseholdCheckRow } from './HouseholdCheckRow';

export interface HouseholdShoppingCardProps {
  items: HouseholdItem[];
  checked: Set<string>;
  onToggle: (key: string) => void;
  onManage: () => void;
}

export const HouseholdShoppingCard = ({ items, checked, onToggle, onManage }: HouseholdShoppingCardProps) => {
  const checkedCount = items.filter(i => checked.has(`household::${i.id}`)).length;

  return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1">
        <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">Articles du quotidien</h2>
        <span className="flex items-baseline gap-2">
          {checkedCount > 0 && <span className="text-xs text-slate-400 font-medium tabular-nums">{checkedCount}/{items.length}</span>}
          <button type="button" onClick={onManage} className="text-xs font-bold text-orange-600 hover:text-orange-700">Gérer</button>
        </span>
      </div>
      {items.map(item => (
        <HouseholdCheckRow
          key={item.id}
          item={item}
          isChecked={checked.has(`household::${item.id}`)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
