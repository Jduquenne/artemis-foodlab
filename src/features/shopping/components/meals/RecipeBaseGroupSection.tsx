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
    onOpenDetail: (key: string) => void;
}

export const RecipeBaseGroupSection = ({ base, sourceChecked, onToggleSource, onToggleBatch, onOpenDetail }: RecipeBaseGroupSectionProps) => {
    const allBaseChecked = base.ingredients.length > 0 && base.ingredients.every(ing => isIngChecked(ing, sourceChecked));
    const pending = useAnyPendingKey(
        base.ingredients.flatMap(ing => ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`))
    );

    const handleToggleBase = () => {
        if (pending) return;
        onToggleBatch(base.ingredients.map(ing => ({ ingredientKey: ing.ingredientKey, sources: ing.sources })), !allBaseChecked);
    };

    return (
        <div className="mx-2.5 my-2 border border-slate-200 rounded-xl overflow-hidden">
            <button
                type="button"
                aria-pressed={allBaseChecked}
                onClick={handleToggleBase}
                className="flex items-center gap-3 w-full px-3 py-2 bg-subtle text-left hover:bg-muted transition-colors"
            >
                <CheckToggleIcon checked={allBaseChecked} pending={pending} className="w-5 h-5" checkedClassName="text-orange-500" />
                <span className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate ${allBaseChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>{base.baseName}</span>
                    <span className="text-xs text-slate-400">
                        Base · {allBaseChecked ? 'toute la base est prise' : 'touche pour cocher toute la base'}
                    </span>
                </span>
            </button>
            {!allBaseChecked && base.ingredients.map(ing => (
                <IngredientRow
                    key={ing.ingredientKey}
                    ing={ing}
                    sourceChecked={sourceChecked}
                    onToggleSource={onToggleSource}
                    onOpenDetail={onOpenDetail}
                />
            ))}
        </div>
    );
};
