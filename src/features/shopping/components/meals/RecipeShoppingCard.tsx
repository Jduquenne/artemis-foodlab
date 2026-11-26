import { MapPin, UtensilsCrossed } from 'lucide-react';
import { recipeCardMealLabel } from '../../../../core/logic/shopping/shoppingRecipeCards';
import { SLOT_LABELS } from '../../../../core/domain/slotLabels';
import { AsyncImage } from '../../../../shared/components/ui/AsyncImage';
import { usePlannableSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';
import { IngredientSource, RecipeCardIngredient, RecipeBaseGroup } from '../../../../core/domain/shopping';
import { allKeysAtPlace } from '../../../../core/logic/shopping/shoppingPlaceLogic';
import { buildSourceCheckKey, checkableCardIngredients, isIngChecked } from '../../../../core/logic/shopping/shoppingChecks';
import { IngredientRow } from './IngredientRow';
import { RecipeBaseGroupSection } from './RecipeBaseGroupSection';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface RecipeShoppingCardProps {
    recipeId: string;
    recipeName: string;
    directIngredients: RecipeCardIngredient[];
    baseGroups: RecipeBaseGroup[];
    sourceChecked: Set<string>;
    checkableKeys: ReadonlySet<string>;
    placeName: string | null;
    atPlace: Set<string>;
    onToggleAllAtPlace: (keys: string[], value: boolean) => void;
    onToggleSource: (ingredientKey: string, sources: IngredientSource[], checked: boolean) => void;
    onToggleBatch: (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, checked: boolean) => void;
    onOpenDetail: (key: string) => void;
}

export const RecipeShoppingCard = ({
    recipeId,
    recipeName,
    directIngredients,
    baseGroups,
    sourceChecked,
    checkableKeys,
    placeName,
    atPlace,
    onToggleAllAtPlace,
    onToggleSource,
    onToggleBatch,
    onOpenDetail,
}: RecipeShoppingCardProps) => {
    const plannable = usePlannableSnapshot();
    const mealLabel = recipeCardMealLabel({ directIngredients, baseGroups }, SLOT_LABELS);
    const allIngs = [...directIngredients, ...baseGroups.flatMap(b => b.ingredients)];
    const checkable = checkableCardIngredients(allIngs, checkableKeys);
    const totalCount = checkable.length;
    const checkedCount = checkable.filter(ing => isIngChecked(ing, sourceChecked)).length;
    const allCardChecked = totalCount > 0 && checkedCount === totalCount;
    const pending = useAnyPendingKey(
        checkable.flatMap(ing => ing.sources.map(s => `shopping-source:${buildSourceCheckKey(ing.ingredientKey, s)}`))
    );

    const placeKeys = allIngs.map(ing => ing.ingredientKey);
    const allAtPlace = allKeysAtPlace(placeKeys, atPlace);
    const placePending = useAnyPendingKey(placeKeys.map(key => `shopping-place:${key}`));
    const placeLabel = allAtPlace ? `Ne plus tout prendre à ${placeName}` : `Tout à prendre à ${placeName}`;

    const handleToggleAll = () => {
        if (pending) return;
        onToggleBatch(checkable.map(ing => ({ ingredientKey: ing.ingredientKey, sources: ing.sources })), !allCardChecked);
    };


    return (
        <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className={`flex items-stretch bg-orange-50 dark:bg-orange-950/30 ${allCardChecked ? '' : 'border-b border-orange-100 dark:border-orange-900/40'}`}>
                <div className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5">
                    <span className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-orange-100 dark:bg-orange-900/40 grid place-items-center">
                        {plannable[recipeId]?.assets?.mealPhoto
                            ? <AsyncImage asset={plannable[recipeId]?.assets?.mealPhoto} alt={recipeName} fill className="object-cover" />
                            : <UtensilsCrossed className="w-5 h-5 text-orange-400" />}
                    </span>
                    <span className="flex flex-col min-w-0">
                        {mealLabel && <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 truncate">{mealLabel}</span>}
                        <span className={`text-base font-black leading-tight truncate ${allCardChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>{recipeName}</span>
                    </span>
                </div>
                <button
                    type="button"
                    aria-pressed={allCardChecked}
                    onClick={handleToggleAll}
                    disabled={totalCount === 0}
                    title={allCardChecked ? 'Tout décocher' : 'Tout cocher'}
                    aria-label={allCardChecked ? `Tout décocher — ${recipeName}` : `Tout cocher — ${recipeName}`}
                    className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-40"
                >
                    <CheckToggleIcon checked={allCardChecked} pending={pending} className="w-5 h-5" checkedClassName="text-orange-500" />
                    <span className="text-[10px] font-bold tabular-nums">{checkedCount}/{totalCount}</span>
                </button>
                {placeName && allIngs.length > 0 && (
                    <button
                        type="button"
                        onClick={() => !placePending && onToggleAllAtPlace(placeKeys, !allAtPlace)}
                        disabled={placePending}
                        title={placeLabel}
                        aria-label={placeLabel}
                        aria-pressed={allAtPlace}
                        className={`w-11 shrink-0 grid place-items-center transition-colors disabled:opacity-60 ${allAtPlace ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-300 hover:text-orange-500'}`}
                    >
                        <MapPin className={`w-4.5 h-4.5 ${placePending ? 'animate-pulse' : ''}`} />
                    </button>
                )}
            </div>
            {!allCardChecked && (
                <>
                    {directIngredients.map(ing => (
                        <IngredientRow key={ing.ingredientKey} ing={ing} checkable={checkableKeys.has(ing.ingredientKey)} sourceChecked={sourceChecked} onToggleSource={onToggleSource} onOpenDetail={onOpenDetail} />
                    ))}
                    {baseGroups.map(base => (
                        <RecipeBaseGroupSection
                            key={base.baseId}
                            base={base}
                            sourceChecked={sourceChecked}
                            checkableKeys={checkableKeys}
                            onToggleSource={onToggleSource}
                            onToggleBatch={onToggleBatch}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                </>
            )}
        </div>
    );
};
