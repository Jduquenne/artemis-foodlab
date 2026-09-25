import { IngredientSource, RecipeCardIngredient, RecipeBaseGroup } from '../../../../core/domain/shopping';
import { buildSourceCheckKey, isIngChecked } from '../../../../core/logic/shopping/shoppingChecks';
import { IngredientRow } from './IngredientRow';
import { RecipeBaseGroupSection } from './RecipeBaseGroupSection';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export type { RecipeCardIngredient, RecipeBaseGroup };

export interface RecipeShoppingCardProps {
    recipeId: string;
    recipeName: string;
    directIngredients: RecipeCardIngredient[];
    baseGroups: RecipeBaseGroup[];
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onToggleBatch: (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, checked: boolean) => void;
}

export const RecipeShoppingCard = ({
    recipeName,
    directIngredients,
    baseGroups,
    sourceChecked,
    onToggleSource,
    onToggleBatch,
}: RecipeShoppingCardProps) => {
    const allIngs = [...directIngredients, ...baseGroups.flatMap(b => b.ingredients)];
    const totalCount = allIngs.length;
    const checkedCount = allIngs.filter(ing => isIngChecked(ing, sourceChecked)).length;
    const allCardChecked = totalCount > 0 && checkedCount === totalCount;
    const pending = useAnyPendingKey(
        allIngs.flatMap(ing => ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`))
    );

    const handleToggleAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pending) return;
        onToggleBatch(allIngs.map(ing => ({ ingredientKey: ing.ingredientKey, sources: ing.sources })), !allCardChecked);
    };

    return (
        <div className="bg-white dark:bg-slate-100 border border-slate-200 rounded-xl p-2 shadow-sm">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs truncate">{recipeName}</h2>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {checkedCount > 0 && (
                        <span className="text-xs text-slate-400 font-medium">{checkedCount}/{totalCount}</span>
                    )}
                    <button
                        onClick={handleToggleAll}
                        className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                    >
                        <CheckToggleIcon
                            checked={allCardChecked}
                            pending={pending}
                            className="w-4 h-4"
                            uncheckedClassName="text-slate-300 hover:text-orange-400"
                        />
                    </button>
                </div>
            </div>
            <div className="space-y-0.5">
                {directIngredients.map(ing => (
                    <IngredientRow key={ing.ingredientKey} ing={ing} sourceChecked={sourceChecked} onToggleSource={onToggleSource} />
                ))}
                {baseGroups.map(base => (
                    <RecipeBaseGroupSection
                        key={base.baseId}
                        base={base}
                        sourceChecked={sourceChecked}
                        onToggleSource={onToggleSource}
                        onToggleBatch={onToggleBatch}
                    />
                ))}
            </div>
        </div>
    );
};
