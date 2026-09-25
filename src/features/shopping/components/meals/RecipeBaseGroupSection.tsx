import { IngredientSource, RecipeBaseGroup } from '../../../../core/domain/shopping';
import { buildSourceCheckKey, isIngChecked } from '../../../../core/logic/shopping/shoppingChecks';
import { IngredientRow } from './IngredientRow';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface RecipeBaseGroupSectionProps {
    base: RecipeBaseGroup;
    sourceChecked: Set<string>;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onToggleBatch: (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, checked: boolean) => void;
}

export const RecipeBaseGroupSection = ({ base, sourceChecked, onToggleSource, onToggleBatch }: RecipeBaseGroupSectionProps) => {
    const allBaseChecked = base.ingredients.length > 0 && base.ingredients.every(ing => isIngChecked(ing, sourceChecked));
    const pending = useAnyPendingKey(
        base.ingredients.flatMap(ing => ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`))
    );

    const handleToggleBase = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pending) return;
        onToggleBatch(base.ingredients.map(ing => ({ ingredientKey: ing.ingredientKey, sources: ing.sources })), !allBaseChecked);
    };

    return (
        <div className="mt-1 pl-2 border-l-2 border-orange-200">
            <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">{base.baseName}</p>
                <button
                    onClick={handleToggleBase}
                    className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors shrink-0"
                >
                    <CheckToggleIcon
                        checked={allBaseChecked}
                        pending={pending}
                        className="w-3.5 h-3.5"
                        uncheckedClassName="text-slate-300 hover:text-orange-400"
                    />
                </button>
            </div>
            <div className="space-y-0.5">
                {base.ingredients.map(ing => (
                    <IngredientRow key={ing.ingredientKey} ing={ing} sourceChecked={sourceChecked} onToggleSource={onToggleSource} />
                ))}
            </div>
        </div>
    );
};
