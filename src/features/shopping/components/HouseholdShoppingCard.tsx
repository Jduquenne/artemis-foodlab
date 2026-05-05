import { CheckCircle2, Circle } from 'lucide-react';
import { HouseholdItem } from '../../../core/domain/types';

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
        {items.map(item => {
          const isChecked = checked.has(`household::${item.id}`);
          return (
            <div
              key={item.id}
              onClick={() => onToggle(`household::${item.id}`)}
              className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none
                ${isChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
            >
              {isChecked
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              }
              <span className={`text-xs font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
