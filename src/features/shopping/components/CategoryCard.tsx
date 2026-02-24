import { CheckCircle2, Circle } from 'lucide-react';
import { ConsolidatedIngredient } from '../../../core/utils/shoppingLogic';
import { IngredientTooltip } from './IngredientTooltip';

export interface CategoryCardProps {
    label: string;
    items: ConsolidatedIngredient[];
    checked: Set<string>;
    onToggle: (key: string) => void;
}

export const CategoryCard = ({ label, items, checked, onToggle }: CategoryCardProps) => {
    const checkedCount = items.filter(i => checked.has(i.key)).length;

    return (
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">
                    {label}
                </h2>
                {checkedCount > 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                        {checkedCount}/{items.length}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                {items.map(item => {
                    const isChecked = checked.has(item.key);
                    return (
                        <div
                            key={item.key}
                            onClick={() => onToggle(item.key)}
                            className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl transition-all cursor-pointer select-none
                                ${isChecked
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {isChecked
                                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                                }
                                <span className={`font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                <span className="text-slate-500 font-bold text-sm bg-slate-100 dark:bg-slate-200 px-2 py-0.5 rounded-lg">
                                    {item.totalQuantity % 1 === 0 ? item.totalQuantity : item.totalQuantity.toFixed(1)} {item.unit}
                                </span>
                                <IngredientTooltip sources={item.sources} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
