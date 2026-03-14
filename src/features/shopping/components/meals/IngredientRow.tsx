import { CheckCircle2, Circle } from 'lucide-react';
import { IngredientSource } from '../../../../core/utils/shoppingLogic';
import { pluralizeUnit } from '../../../../core/utils/unitUtils';
import { RecipeCardIngredient, isIngChecked } from './ingredientUtils';

export interface IngredientRowProps {
    ing: RecipeCardIngredient;
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
}

const formatQty = (n: number) => n % 1 === 0 ? String(n) : n.toFixed(1);

export const IngredientRow = ({ ing, sourceChecked, onToggleSource }: IngredientRowProps) => {
    const allChecked = isIngChecked(ing, sourceChecked);
    return (
        <div
            onClick={() => onToggleSource(ing.ingredientKey, ing.sources, !allChecked)}
            className={`flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                allChecked
                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
            }`}
        >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {allChecked
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                }
                <span className={`text-xs font-medium text-slate-800 truncate ${allChecked ? 'line-through' : ''}`}>
                    {ing.name}
                </span>
            </div>
            {ing.quantity > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-200 text-slate-500 shrink-0">
                    {formatQty(ing.quantity)} {pluralizeUnit(ing.unit, ing.quantity)}
                </span>
            )}
        </div>
    );
};
