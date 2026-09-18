import { IngredientSource, RecipeCardIngredient, buildSourceCheckKey, isIngChecked } from '../../../../core/logic/shopping/shoppingLogic';
import { pluralizeUnit, formatQty } from '../../../../shared/utils/unitUtils';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface IngredientRowProps {
    ing: RecipeCardIngredient;
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
}

export const IngredientRow = ({ ing, sourceChecked, onToggleSource }: IngredientRowProps) => {
    const allChecked = isIngChecked(ing, sourceChecked);
    const pending = useAnyPendingKey(
        ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`)
    );
    return (
        <div
            onClick={() => !pending && onToggleSource(ing.ingredientKey, ing.sources, !allChecked)}
            className={`flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                allChecked
                    ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'
            }`}
        >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <CheckToggleIcon checked={allChecked} pending={pending} />
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
