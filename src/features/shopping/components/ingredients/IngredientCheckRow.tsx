import { Snowflake } from 'lucide-react';
import { ConsolidatedIngredient, IngredientSource, buildSourceCheckKey } from '../../../../core/logic/shopping/shoppingLogic';
import { FreezerBag } from '../../../../core/domain/types';
import { IngredientTooltip } from './IngredientTooltip';
import { pluralizeUnit, formatQty } from '../../../../shared/utils/unitUtils';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface IngredientCheckRowProps {
    item: ConsolidatedIngredient;
    isChecked: boolean;
    stock: number;
    sourceChecked: Set<string>;
    matchingBags: FreezerBag[];
    inFreezer: boolean;
    isEditing: boolean;
    editValue: string;
    onToggle: (key: string) => void;
    onStartEditing: (key: string, currentStock: number) => void;
    onEditValueChange: (value: string) => void;
    onCommitEdit: (key: string) => void;
    onCancelEdit: () => void;
    onShowSources: (key: string, sources: IngredientSource[], freezerBags: FreezerBag[]) => void;
}

export const IngredientCheckRow = ({
    item,
    isChecked,
    stock,
    sourceChecked,
    matchingBags,
    inFreezer,
    isEditing,
    editValue,
    onToggle,
    onStartEditing,
    onEditValueChange,
    onCommitEdit,
    onCancelEdit,
    onShowSources,
}: IngredientCheckRowProps) => {
    const pending = usePendingKey(`shopping-check:${item.key}`);

    const checkedSourceQty = item.sources
        .filter(s => sourceChecked.has(buildSourceCheckKey(item.key, s)))
        .reduce((sum, s) => sum + s.quantity, 0);
    const effectiveTotal = Math.max(0, item.totalQuantity - checkedSourceQty);
    const needed = effectiveTotal === 0 ? 0 : Math.max(0, effectiveTotal - stock);
    const hasStock = effectiveTotal > 0 && stock > 0;
    const canEditStock = item.totalQuantity > 0;

    return (
        <div
            onClick={() => { if (!isEditing && !pending) onToggle(item.key); }}
            className={`flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none
                ${isChecked
                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
        >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <CheckToggleIcon checked={isChecked} pending={pending} />
                {!isChecked && !pending && inFreezer && (
                    <Snowflake className="w-3 h-3 text-cyan-500 shrink-0" />
                )}
                <span className={`text-xs font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                    {item.name}
                    {item.preparation && (
                        <span className="font-normal text-slate-400 ml-1">· {item.preparation}</span>
                    )}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">j'en ai :</span>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={editValue}
                            onChange={e => onEditValueChange(e.target.value)}
                            onBlur={() => onCommitEdit(item.key)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') onCancelEdit();
                            }}
                            className="w-14 text-xs text-center bg-slate-100 dark:bg-slate-200 border border-orange-300 focus:outline-none focus:border-orange-500 rounded-md px-1 py-0.5"
                            autoFocus
                        />
                        <span className="text-xs text-slate-400">{pluralizeUnit(item.unit, parseFloat(editValue) || 0)}</span>
                    </div>
                ) : (
                    <>
                        {hasStock && (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                {formatQty(stock)} dispo
                            </span>
                        )}
                        <button
                            onClick={() => canEditStock && onStartEditing(item.key, stock)}
                            className={`font-bold text-xs px-1.5 py-0.5 rounded-md transition-colors ${
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
                <IngredientTooltip sources={item.sources} onOpen={(srcs) => onShowSources(item.key, srcs, matchingBags)} />
            </div>
        </div>
    );
};
