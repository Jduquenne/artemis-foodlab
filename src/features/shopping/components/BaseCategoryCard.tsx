import { CheckCircle2, Circle } from 'lucide-react';
import { BaseEntry } from '../../../core/utils/shoppingLogic';
import { pluralizeUnit } from '../../../core/utils/unitUtils';

export interface BaseCategoryCardProps {
    items: BaseEntry[];
    checkedBases: Set<string>;
    onToggle: (baseId: string) => void;
}

export const BaseCategoryCard = ({ items, checkedBases, onToggle }: BaseCategoryCardProps) => {
    const checkedCount = items.filter(b => checkedBases.has(b.baseId)).length;

    const formatQty = (n: number) => n % 1 === 0 ? String(n) : n.toFixed(1);

    return (
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-xl p-2 shadow-sm">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">Bases</h2>
                {checkedCount > 0 && (
                    <span className="text-xs text-slate-400 font-medium">{checkedCount}/{items.length}</span>
                )}
            </div>
            <div className="space-y-0.5">
                {items.map(base => {
                    const isChecked = checkedBases.has(base.baseId);
                    return (
                        <div
                            key={base.baseId}
                            onClick={() => onToggle(base.baseId)}
                            className={`flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                                isChecked
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
                            }`}
                        >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {isChecked
                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                    : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                }
                                <span className={`text-xs font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                                    {base.name}
                                </span>
                            </div>
                            <span className="font-bold text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-200 text-slate-500 shrink-0">
                                {base.totalPortions === 0
                                    ? '—'
                                    : `${formatQty(base.totalPortions)}\u00a0${pluralizeUnit(base.unit, base.totalPortions)}`}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
