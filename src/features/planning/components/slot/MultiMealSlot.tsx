import { Plus, Check } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { plannableDb } from '../../../../core/utils/plannableDb';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { hasRecipes as slotHasRecipes, isSlotFull } from '../../../../core/domain/recipePredicates';
import { MultiRecipeGrid } from './MultiRecipeGrid';
import { MultiSlotActions } from './MultiSlotActions';

const data = plannableDb;

interface MultiMealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeIds: string[];
    onAdd: () => void;
    onRemoveRecipe: (recipeId: string) => void;
    onNavigateToRecipe: (recipeId: string) => void;
    isAddMode?: boolean;
    onAddToSlot?: () => void;
    onCopyRecipe?: (recipeId: string) => void;
    copyTargetState?: 'source' | 'selectable' | 'selected';
    onSelectAsTarget?: () => void;
}

export const MultiMealSlot = ({
    label,
    icon,
    slotId,
    recipeIds,
    onAdd,
    onRemoveRecipe,
    onNavigateToRecipe,
    isAddMode,
    onAddToSlot,
    onCopyRecipe,
    copyTargetState,
    onSelectAsTarget,
}: MultiMealSlotProps) => {
    const firstRecipe = recipeIds.length === 1 ? data[recipeIds[0]] : undefined;
    const singlePhotoUrl = firstRecipe?.assets?.photo?.url;
    const singleHasRecipesPage = Boolean(firstRecipe?.assets?.instructionsPhoto?.url);

    const hasRecipes = slotHasRecipes({ recipeIds });
    const isFull = isSlotFull({ recipeIds });
    const canAddMore = !isFull;
    const isTargetMode = copyTargetState === 'selectable' || copyTargetState === 'selected';

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: !hasRecipes || IS_TOUCH || !!isAddMode || !!copyTargetState,
    });

    const setRef = (el: HTMLDivElement | null) => {
        setDropRef(el);
        setDragRef(el);
    };

    const borderClass = copyTargetState === 'selected'
        ? 'ring-2 ring-violet-500 border-violet-400 cursor-pointer'
        : copyTargetState === 'selectable'
            ? 'ring-2 ring-violet-300 border-violet-300 cursor-pointer'
            : copyTargetState === 'source'
                ? 'border-amber-300 ring-2 ring-amber-300'
                : isAddMode
                    ? isFull ? 'border-slate-200 opacity-50' : 'ring-2 ring-orange-400 border-orange-300 cursor-pointer'
                    : isDragging
                        ? 'opacity-30 border-slate-200'
                        : isOver
                            ? 'border-orange-400 bg-orange-50/40'
                            : hasRecipes
                                ? 'border-slate-200 shadow-sm hover:border-orange-200'
                                : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    const handleClick = isTargetMode
        ? (e: React.MouseEvent) => { e.stopPropagation(); onSelectAsTarget?.(); }
        : isAddMode && !isFull
            ? onAddToSlot
            : undefined;

    return (
        <div
            ref={setRef}
            className={`relative w-full h-full group ${isAddMode && isFull ? 'pointer-events-none' : ''}`}
            onClick={handleClick}
        >
            <div className={`relative w-full h-full rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-slate-100 ${borderClass}`}>

                {!hasRecipes && (
                    <>
                        <button
                            onClick={isTargetMode ? undefined : onAdd}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
                        >
                            <span className="text-lg">{icon}</span>
                            <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                        </button>
                        <div className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-orange-500 rounded-lg border border-slate-200 pointer-events-none">
                            <Plus size={14} />
                        </div>
                    </>
                )}

                {recipeIds.length === 1 && (
                    <button
                        onClick={!isTargetMode && singleHasRecipesPage ? () => onNavigateToRecipe(recipeIds[0]) : undefined}
                        className={`w-full h-full ${!singleHasRecipesPage || isTargetMode ? 'cursor-default' : ''}`}
                    >
                        {singlePhotoUrl && (
                            <img src={singlePhotoUrl} loading="lazy" decoding="async" className="w-full h-full object-contain" alt={firstRecipe!.name} />
                        )}
                    </button>
                )}

                {recipeIds.length >= 2 && (
                    <MultiRecipeGrid
                        recipeIds={recipeIds}
                        canAddMore={canAddMore}
                        isTargetMode={isTargetMode}
                        isAddMode={isAddMode}
                        copyTargetState={copyTargetState}
                        onNavigateToRecipe={onNavigateToRecipe}
                        onRemoveRecipe={onRemoveRecipe}
                        onCopyRecipe={onCopyRecipe}
                        onAdd={onAdd}
                    />
                )}

                {copyTargetState === 'selected' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-violet-500/10 pointer-events-none">
                        <div className="bg-violet-500 rounded-full p-1.5 shadow-lg">
                            <Check size={14} className="text-white" />
                        </div>
                    </div>
                )}
            </div>

            {hasRecipes && !isDragging && !isAddMode && !copyTargetState && (
                <MultiSlotActions
                    recipeIds={recipeIds}
                    canAddMore={canAddMore}
                    listeners={listeners}
                    attributes={attributes}
                    onCopyRecipe={onCopyRecipe}
                    onRemoveRecipe={onRemoveRecipe}
                    onAdd={onAdd}
                />
            )}
        </div>
    );
};
