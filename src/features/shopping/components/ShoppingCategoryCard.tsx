import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { ConsolidatedIngredient } from '../../../core/utils/shoppingLogic';
import { IngredientTooltip } from './IngredientTooltip';
import { pluralizeUnit } from '../../../core/utils/unitUtils';

export interface ShoppingCategoryCardProps {
    label: string;
    items: ConsolidatedIngredient[];
    checked: Set<string>;
    stocks: Record<string, number>;
    onToggle: (key: string) => void;
    onSetStock: (key: string, value: number) => void;
}

export const ShoppingCategoryCard = ({ label, items, checked, stocks, onToggle, onSetStock }: ShoppingCategoryCardProps) => {
    const checkedCount = items.filter(i => checked.has(i.key)).length;
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (key: string, currentStock: number) => {
        setEditingKey(key);
        setEditValue(currentStock > 0 ? String(currentStock) : '');
    };

    const commitEdit = (key: string) => {
        const val = parseFloat(editValue);
        onSetStock(key, isNaN(val) ? 0 : val);
        setEditingKey(null);
    };

    return (
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">
                    {label}
                </h2>
                {checkedCount > 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                        {checkedCount}/{items.length}
                    </span>
                )}
            </div>
            <div className="space-y-0.5">
                {items.map(item => {
                    const isChecked = checked.has(item.key);
                    const stock = stocks[item.key] ?? 0;
                    const needed = item.totalQuantity === 0 ? 0 : Math.max(0, item.totalQuantity - stock);
                    const hasStock = item.totalQuantity > 0 && stock > 0;
                    const isEditing = editingKey === item.key;
                    const canEditStock = item.totalQuantity > 0;

                    const formatQty = (n: number) =>
                        n % 1 === 0 ? String(n) : n.toFixed(1);

                    return (
                        <div
                            key={item.key}
                            onClick={() => { if (!isEditing) onToggle(item.key); }}
                            className={`flex items-center justify-between gap-2 px-2 py-2.5 rounded-xl transition-all cursor-pointer select-none
                                ${isChecked
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {isChecked
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                }
                                <span className={`text-sm font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                                    {item.name}
                                    {item.preparation && (
                                        <span className="font-normal text-slate-400 ml-1">· {item.preparation}</span>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-400">j'en ai :</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onBlur={() => commitEdit(item.key)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') e.currentTarget.blur();
                                                if (e.key === 'Escape') setEditingKey(null);
                                            }}
                                            className="w-16 text-sm text-center bg-slate-100 dark:bg-slate-200 border border-orange-300 focus:outline-none focus:border-orange-500 rounded-lg px-1 py-0.5"
                                            autoFocus
                                        />
                                        <span className="text-xs text-slate-400">{pluralizeUnit(item.unit, parseFloat(editValue) || 0)}</span>
                                    </div>
                                ) : (
                                    <>
                                        {hasStock && (
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md">
                                                {formatQty(stock)} dispo
                                            </span>
                                        )}
                                        <button
                                            onClick={() => canEditStock && startEditing(item.key, stock)}
                                            className={`font-bold text-sm px-2 py-0.5 rounded-lg transition-colors ${
                                                !canEditStock
                                                    ? 'bg-slate-100 dark:bg-slate-200 text-slate-400 cursor-default'
                                                    : needed === 0
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 cursor-pointer'
                                                        : 'bg-slate-100 dark:bg-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600 cursor-pointer'
                                            }`}
                                        >
                                            {item.totalQuantity === 0
                                                ? '—'
                                                : needed === 0
                                                    ? '✓'
                                                    : `${formatQty(needed)} ${pluralizeUnit(item.unit, needed)}`}
                                        </button>
                                    </>
                                )}
                                <IngredientTooltip sources={item.sources} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
