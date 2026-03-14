import { CheckCircle2, Circle } from 'lucide-react';
import { IngredientSource } from '../../../../core/utils/shoppingLogic';
import { RecipeCardIngredient, isIngChecked } from './ingredientUtils';
import { IngredientRow } from './IngredientRow';

export type { RecipeCardIngredient };

export interface RecipeBaseGroup {
    baseId: string;
    baseName: string;
    ingredients: RecipeCardIngredient[];
}

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

    const handleToggleAll = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                        {allCardChecked
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Circle className="w-4 h-4 text-slate-300 hover:text-orange-400" />
                        }
                    </button>
                </div>
            </div>
            <div className="space-y-0.5">
                {directIngredients.map(ing => (
                    <IngredientRow key={ing.ingredientKey} ing={ing} sourceChecked={sourceChecked} onToggleSource={onToggleSource} />
                ))}
                {baseGroups.map(base => {
                    const allBaseChecked = base.ingredients.length > 0 && base.ingredients.every(ing => isIngChecked(ing, sourceChecked));
                    const handleToggleBase = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onToggleBatch(base.ingredients.map(ing => ({ ingredientKey: ing.ingredientKey, sources: ing.sources })), !allBaseChecked);
                    };
                    return (
                        <div key={base.baseId} className="mt-1 pl-2 border-l-2 border-orange-200">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">{base.baseName}</p>
                                <button
                                    onClick={handleToggleBase}
                                    className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors shrink-0"
                                >
                                    {allBaseChecked
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        : <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-orange-400" />
                                    }
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {base.ingredients.map(ing => (
                                    <IngredientRow key={ing.ingredientKey} ing={ing} sourceChecked={sourceChecked} onToggleSource={onToggleSource} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
