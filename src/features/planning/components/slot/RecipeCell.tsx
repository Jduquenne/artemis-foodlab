import { X, Copy, Users, Snowflake, Scale, Shuffle } from 'lucide-react';
import { useHasMealChoices } from '../../../../shared/hooks/useHasMealChoices';
import { ItemAction, ItemActionsMenu } from './ItemActionsMenu';
import { isDish, isBase } from '../../../../core/domain/recipePredicates';
import { MealPhoto } from './MealPhoto';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { usePlannableSnapshot, useRecipeMetricsSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';

export interface RecipeCellProps {
    slotId: string;
    recipeId: string;
    onNavigate: () => void;
    onRemove: () => void;
    onCopy?: () => void;
    hideRemove?: boolean;
    persons?: number;
    grams?: number;
    onEditMeta?: () => void;
    onChooseFood?: () => void;
    inFreezer?: boolean;
}

export const RecipeCell = ({ slotId, recipeId, onNavigate, onRemove, onCopy, hideRemove, persons, grams, onEditMeta, onChooseFood, inFreezer }: RecipeCellProps) => {
    const plannable = usePlannableSnapshot();
    const { baseGrams } = useRecipeMetricsSnapshot();
    const recipe = plannable[recipeId];
    const hasPhoto = Boolean(recipe?.assets?.mealPhoto);
    const hasRecipesPage = Boolean(recipe?.assets?.mealPhoto || recipe?.assets?.instructionsPhoto);
    const defaultGrams = baseGrams[recipeId] ?? 0;
    const recipeIsDish = isDish(recipe) || isBase(recipe);
    const isCustom = persons !== undefined || (!recipeIsDish && grams !== undefined);
    const removePending = usePendingKey(`planning-recipe-remove:${slotId}:${recipeId}`);
    const hasFoodChoice = useHasMealChoices(recipeId);
    const metaEditable = !!onEditMeta && (recipeIsDish || defaultGrams > 0 || persons !== undefined);

    const actions: ItemAction[] = [];
    if (!hideRemove) {
        if (hasFoodChoice && onChooseFood) actions.push({ id: 'food-choice', label: 'Choix du repas', icon: Shuffle, onSelect: onChooseFood });
        if (metaEditable && onEditMeta) actions.push({ id: 'quantity', label: 'Quantité', icon: Scale, onSelect: onEditMeta });
        if (onCopy) actions.push({ id: 'copy', label: 'Copier', icon: Copy, onSelect: onCopy });
        actions.push({ id: 'remove', label: 'Retirer', icon: X, onSelect: onRemove, danger: true });
    }

    return (
        <div className="relative group/cell w-full h-full min-h-0 flex-1 min-w-0">
            <button
                onClick={hasRecipesPage && !hideRemove ? onNavigate : undefined}
                className={`w-full h-full rounded-lg overflow-hidden bg-muted ${!hasRecipesPage || hideRemove ? 'cursor-default' : ''}`}
            >
                {hasPhoto && recipe && (
                    <div className="relative w-full h-full">
                        <MealPhoto asset={recipe.assets.mealPhoto} name={recipe.name} compact />
                    </div>
                )}
            </button>

            {!hideRemove && metaEditable && onEditMeta && (
                <button
                    aria-label="Modifier la quantité"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEditMeta(); }}
                    className={`absolute bottom-0.5 left-0.5 flex items-center gap-0.5 text-[8px] font-black px-1 py-0.5 rounded z-10 shadow-sm ${isCustom ? 'bg-orange-500 text-white' : 'bg-black/20 text-white'}`}
                >
                    {recipeIsDish ? (
                        <span className="flex items-center gap-0.5"><Users size={7} />{persons !== undefined ? `${persons}p` : ''}</span>
                    ) : (
                        <>
                            {persons !== undefined && <><Users size={7} />{persons} · </>}
                            {defaultGrams > 0 && <span>{grams ?? Math.round(defaultGrams)}g</span>}
                        </>
                    )}
                </button>
            )}

            <ItemActionsMenu actions={actions} pending={removePending} compact hoverScope="cell" className="top-0.5 right-0.5" />
            {inFreezer && (
                <div className="absolute top-0.5 left-0.5 p-0.5 bg-cyan-500/80 text-white rounded z-10 shadow-sm pointer-events-none">
                    <Snowflake size={8} />
                </div>
            )}
        </div>
    );
};
