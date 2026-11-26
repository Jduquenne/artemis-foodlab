import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { ConsolidatedIngredient } from '../../../../core/domain/shopping';
import { isLineDone, sortDoneLast } from '../../../../core/logic/shopping/shoppingGrouping';
import { ShoppingItemRow } from './ShoppingItemRow';

export interface ShoppingCategoryCardProps {
    label: string;
    items: ConsolidatedIngredient[];
    checked: Set<string>;
    stocks: Record<string, number>;
    sourceChecked: Set<string>;
    onToggle: (key: string) => void;
    onOpenDetail: (key: string) => void;
}

export const ShoppingCategoryCard = ({
    label,
    items,
    checked,
    stocks,
    sourceChecked,
    onToggle,
    onOpenDetail,
}: ShoppingCategoryCardProps) => {
    const isDone = (item: ConsolidatedIngredient) => isLineDone(item, checked, stocks, sourceChecked);
    const shown = sortDoneLast(items, isDone);
    const doneCount = items.filter(isDone).length;
    const counter = `${doneCount}/${items.length}`;
    const done = items.length > 0 && doneCount === items.length;
    const [unfolded, setUnfolded] = useState(false);
    const [wasDone, setWasDone] = useState(done);
    if (wasDone !== done) {
        setWasDone(done);
        setUnfolded(false);
    }
    const folded = done && !unfolded;

    return (
        <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {done ? (
                <button
                    type="button"
                    onClick={() => setUnfolded((u) => !u)}
                    aria-expanded={!folded}
                    className={`w-full flex items-center justify-between gap-2 px-3 text-left ${folded ? 'py-2.5' : 'pt-2.5 pb-1'}`}
                >
                    <h2 className="flex items-center gap-1.5 text-emerald-600 font-black uppercase tracking-widest text-xs">
                        <Check className="w-3.5 h-3.5" />
                        {label}
                    </h2>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium tabular-nums">
                        {counter}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${folded ? '' : 'rotate-180'}`} />
                    </span>
                </button>
            ) : (
                <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1">
                    <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">{label}</h2>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{counter}</span>
                </div>
            )}
            {!folded && shown.map((item) => (
                <ShoppingItemRow
                    key={item.key}
                    item={item}
                    isChecked={checked.has(item.key)}
                    isDone={isDone(item)}
                    stock={stocks[item.key] ?? 0}
                    sourceChecked={sourceChecked}
                    onToggle={onToggle}
                    onOpenDetail={onOpenDetail}
                />
            ))}
        </div>
    );
};
