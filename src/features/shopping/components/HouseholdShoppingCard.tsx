import { HouseholdItem } from '../../../core/domain/household';
import { ConsolidatedIngredient, ShoppingMode } from '../../../core/domain/shopping';
import { sortCheckedLast } from '../../../core/logic/shopping/shoppingGrouping';
import { HouseholdCheckRow } from './HouseholdCheckRow';
import { ShoppingItemRow } from './ingredients/ShoppingItemRow';

export interface HouseholdShoppingCardProps {
  items: HouseholdItem[];
  extras: ConsolidatedIngredient[];
  mode: ShoppingMode;
  checked: Set<string>;
  sourceChecked: Set<string>;
  onToggle: (key: string) => void;
  onOpenDetail: (key: string) => void;
  onManage: () => void;
}

export const HouseholdShoppingCard = ({ items, extras, mode, checked, sourceChecked, onToggle, onOpenDetail, onManage }: HouseholdShoppingCardProps) => {
  const total = items.length + extras.length;
  const checkedCount = items.filter(i => checked.has(`household::${i.id}`)).length + extras.filter(e => checked.has(e.key)).length;
  const shownExtras = mode === 'store' ? sortCheckedLast(extras, checked) : extras;

  return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1">
        <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">Articles du quotidien</h2>
        <span className="flex items-baseline gap-2">
          {checkedCount > 0 && <span className="text-xs text-slate-400 font-medium tabular-nums">{checkedCount}/{total}</span>}
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
      {shownExtras.map(extra => (
        <ShoppingItemRow
          key={extra.key}
          item={extra}
          mode={mode}
          isChecked={checked.has(extra.key)}
          stock={0}
          sourceChecked={sourceChecked}
          onToggle={onToggle}
          onOpenStock={onToggle}
          onQuickStock={onToggle}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
};
