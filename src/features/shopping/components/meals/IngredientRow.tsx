import { ChevronRight } from 'lucide-react';
import { IngredientSource, RecipeCardIngredient } from '../../../../core/domain/shopping';
import { buildSourceCheckKey, isIngChecked } from '../../../../core/logic/shopping/shoppingChecks';
import { formatShoppingQuantity } from '../../../../core/logic/shopping/shoppingRowLabel';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface IngredientRowProps {
    ing: RecipeCardIngredient;
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onOpenDetail: (key: string) => void;
}

export const IngredientRow = ({ ing, sourceChecked, onToggleSource, onOpenDetail }: IngredientRowProps) => {
    const allChecked = isIngChecked(ing, sourceChecked);
    const pending = useAnyPendingKey(
        ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`)
    );

    return (
        <div className={`flex items-stretch border-t border-slate-200 ${allChecked ? 'opacity-50' : ''}`}>
            <button
                type="button"
                aria-pressed={allChecked}
                onClick={() => !pending && onToggleSource(ing.ingredientKey, ing.sources, !allChecked)}
                className="flex-1 min-w-0 flex items-center gap-3 pl-3 pr-1.5 py-2 min-h-13 text-left hover:bg-subtle-tint transition-colors lg:min-h-10 lg:py-1.5"
            >
                <CheckToggleIcon checked={allChecked} pending={pending} className="w-5 h-5" checkedClassName="text-orange-500" />
                <span className={`flex-1 min-w-0 text-[15px] font-semibold text-slate-900 truncate lg:text-sm ${allChecked ? 'line-through' : ''}`}>
                    {ing.name}
                </span>
                {ing.quantity > 0 && (
                    <span className="shrink-0 text-[15px] font-bold text-slate-900 tabular-nums lg:text-sm">
                        {formatShoppingQuantity(ing.quantity, ing.unit)}
                    </span>
                )}
            </button>
            <button
                type="button"
                onClick={() => onOpenDetail(ing.ingredientKey)}
                aria-label={`Détail — ${ing.name}`}
                className="w-10 shrink-0 grid place-items-center text-slate-400 hover:text-orange-500 hover:bg-subtle-tint transition-colors"
            >
                <ChevronRight className="w-4.5 h-4.5" />
            </button>
        </div>
    );
};
