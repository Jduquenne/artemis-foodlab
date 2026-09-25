import { useState } from 'react';
import { ConsolidatedIngredient, IngredientSource } from '../../../../core/domain/shopping';
import { FreezerBag } from '../../../../core/domain/freezer';
import { ExtraCheckRow } from './ExtraCheckRow';
import { IngredientCheckRow } from './IngredientCheckRow';

export interface ShoppingCategoryCardProps {
    label: string;
    items: ConsolidatedIngredient[];
    checked: Set<string>;
    stocks: Record<string, number>;
    sourceChecked: Set<string>;
    onToggle: (key: string) => void;
    onSetStock: (key: string, value: number) => void;
    onShowSources: (key: string, sources: IngredientSource[], freezerBags: FreezerBag[]) => void;
    onEditExtra: (extraId: string) => void;
    onDeleteExtra: (extraId: string) => void;
    foodBags?: Map<string, FreezerBag[]>;
}

export const ShoppingCategoryCard = ({ label, items, checked, stocks, sourceChecked, onToggle, onSetStock, onShowSources, onEditExtra, onDeleteExtra, foodBags }: ShoppingCategoryCardProps) => {
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
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-xl p-2 shadow-sm">
            <div className="flex items-center justify-between mb-1">
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

                    if (item.isExtra) {
                        return (
                            <ExtraCheckRow
                                key={item.key}
                                item={item}
                                isChecked={isChecked}
                                onToggle={onToggle}
                                onEditExtra={onEditExtra}
                                onDeleteExtra={onDeleteExtra}
                            />
                        );
                    }

                    const stock = stocks[item.key] ?? 0;
                    const allFreezerBags = item.foodId ? foodBags?.get(item.foodId) : undefined;
                    const inFreezer = (allFreezerBags?.length ?? 0) > 0;
                    const matchingBags = allFreezerBags?.filter(b => b.unit === item.unit) ?? [];

                    return (
                        <IngredientCheckRow
                            key={item.key}
                            item={item}
                            isChecked={isChecked}
                            stock={stock}
                            sourceChecked={sourceChecked}
                            matchingBags={matchingBags}
                            inFreezer={inFreezer}
                            isEditing={editingKey === item.key}
                            editValue={editValue}
                            onToggle={onToggle}
                            onStartEditing={startEditing}
                            onEditValueChange={setEditValue}
                            onCommitEdit={commitEdit}
                            onCancelEdit={() => setEditingKey(null)}
                            onShowSources={onShowSources}
                        />
                    );
                })}
            </div>
        </div>
    );
};
