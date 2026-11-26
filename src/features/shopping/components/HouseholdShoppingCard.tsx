import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { HouseholdItem } from '../../../core/domain/household';
import { ConsolidatedIngredient, ShoppingView } from '../../../core/domain/shopping';
import { sortDoneLast } from '../../../core/logic/shopping/shoppingGrouping';
import { HouseholdCheckRow } from './HouseholdCheckRow';
import { ShoppingItemRow } from './ingredients/ShoppingItemRow';

export interface HouseholdShoppingCardProps {
  items: HouseholdItem[];
  extras: ConsolidatedIngredient[];
  view: ShoppingView;
  checked: Set<string>;
  sourceChecked: Set<string>;
  onToggle: (key: string) => void;
  onOpenDetail: (key: string) => void;
  onManage: () => void;
}

export const HouseholdShoppingCard = ({ items, extras, view, checked, sourceChecked, onToggle, onOpenDetail, onManage }: HouseholdShoppingCardProps) => {
  const isItemChecked = (item: HouseholdItem) => checked.has(`household::${item.id}`);
  const shownItems = view === 'toBuy' ? items.filter((item) => !isItemChecked(item)) : items;
  const shownExtras = sortDoneLast(extras, (extra) => checked.has(extra.key));
  const total = items.length + extras.length;
  const checkedCount = items.filter(isItemChecked).length + extras.filter((e) => checked.has(e.key)).length;
  const done = total > 0 && checkedCount === total;
  const [toggled, setToggled] = useState(false);
  const [wasDone, setWasDone] = useState(done);
  if (wasDone !== done) {
    setWasDone(done);
    setToggled(false);
  }
  const folded = done !== toggled;
  if (shownItems.length === 0 && shownExtras.length === 0) return null;

  return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`flex items-baseline justify-between gap-2 px-3 ${folded ? "py-2.5" : "pt-2.5 pb-1"}`}>
        <button
          type="button"
          onClick={() => setToggled((t) => !t)}
          aria-expanded={!folded}
          className={`flex items-center gap-1.5 font-black uppercase tracking-widest text-xs ${done ? "text-emerald-600" : "text-orange-600"}`}
        >
          {done && <Check className="w-3.5 h-3.5" />}
          Articles du quotidien
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${folded ? "" : "rotate-180"}`} />
        </button>
        <span className="flex items-baseline gap-2">
          <span className="text-xs text-slate-400 font-medium tabular-nums">{checkedCount}/{total}</span>
          <button type="button" onClick={onManage} className="text-xs font-bold text-orange-600 hover:text-orange-700">Gérer</button>
        </span>
      </div>
      {!folded && shownItems.map(item => (
        <HouseholdCheckRow
          key={item.id}
          item={item}
          isChecked={isItemChecked(item)}
          onToggle={onToggle}
        />
      ))}
      {!folded && shownExtras.map(extra => (
        <ShoppingItemRow
          key={extra.key}
          item={extra}
          isChecked={checked.has(extra.key)}
          isDone={checked.has(extra.key)}
          stock={0}
          sourceChecked={sourceChecked}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
};
