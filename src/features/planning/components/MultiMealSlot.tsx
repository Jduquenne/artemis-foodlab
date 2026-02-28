import { Plus, X, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { RecipeDetails } from '../../../core/domain/types';
import recipesDb from '../../../core/data/recipes-db.json';

const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const data = recipesDb as unknown as Record<string, RecipeDetails>;

interface MultiMealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeIds: string[];
    onAdd: () => void;
    onRemoveRecipe: (recipeId: string) => void;
    onNavigateToRecipe: (recipeId: string) => void;
}

const RecipeCell = ({
    recipeId,
    onNavigate,
    onRemove,
}: {
    recipeId: string;
    onNavigate: () => void;
    onRemove: () => void;
}) => {
    const recipe = data[recipeId];
    const photoUrl = recipe?.assets?.photo?.url;
    const hasRecipesPage = Boolean(recipe?.assets?.recipes?.url);

    return (
        <div className="relative group/cell w-full h-full min-h-0 flex-1 min-w-0">
            <button
                onClick={hasRecipesPage ? onNavigate : undefined}
                className={`w-full h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-200 ${!hasRecipesPage ? 'cursor-default' : ''}`}
            >
                {photoUrl && <img src={photoUrl} className="w-full h-full object-cover sm:object-contain" alt={recipe.name} />}
            </button>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-0.5 right-0.5 p-0.5 bg-white/90 dark:bg-slate-100/90 text-red-400 rounded opacity-0 group-hover/cell:opacity-100 transition-opacity z-10 shadow-sm"
            >
                <X size={9} />
            </button>
        </div>
    );
};

export const MultiMealSlot = ({
    label,
    icon,
    slotId,
    recipeIds,
    onAdd,
    onRemoveRecipe,
    onNavigateToRecipe,
}: MultiMealSlotProps) => {
    const firstRecipe = recipeIds.length === 1 ? data[recipeIds[0]] : undefined;
    const singlePhotoUrl = firstRecipe?.assets?.photo?.url;
    const singleHasRecipesPage = Boolean(firstRecipe?.assets?.recipes?.url);

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: recipeIds.length === 0 || IS_TOUCH,
    });

    const setRef = (el: HTMLDivElement | null) => {
        setDropRef(el);
        setDragRef(el);
    };

    const hasRecipes = recipeIds.length > 0;
    const canAddMore = recipeIds.length < 4;

    const borderClass = isDragging
        ? 'opacity-30 border-slate-200'
        : isOver
            ? 'border-orange-400 bg-orange-50/40'
            : hasRecipes
                ? 'border-slate-200 shadow-sm hover:border-orange-200'
                : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    return (
        <div ref={setRef} className="relative w-full h-full group">
            <div className={`relative w-full h-full rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-slate-100 ${borderClass}`}>

                {!hasRecipes && (
                    <button
                        onClick={onAdd}
                        className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
                    >
                        <span className="text-lg">{icon}</span>
                        <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                        <Plus size={20} className="absolute bottom-1 right-1" />
                    </button>
                )}

                {recipeIds.length === 1 && (
                    <button
                        onClick={singleHasRecipesPage ? () => onNavigateToRecipe(recipeIds[0]) : undefined}
                        className={`w-full h-full ${!singleHasRecipesPage ? 'cursor-default' : ''}`}
                    >
                        {singlePhotoUrl && (
                            <img src={singlePhotoUrl} className="w-full h-full object-contain" alt={firstRecipe!.name} />
                        )}
                    </button>
                )}

                {recipeIds.length >= 2 && (
                    <div className="w-full h-full flex flex-row sm:grid sm:grid-cols-2 sm:grid-rows-2 gap-0.5 p-0.5">
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const rid = recipeIds[idx];
                            if (rid) {
                                return (
                                    <RecipeCell
                                        key={rid}
                                        recipeId={rid}
                                        onNavigate={() => onNavigateToRecipe(rid)}
                                        onRemove={() => onRemoveRecipe(rid)}
                                    />
                                );
                            }
                            if (idx === recipeIds.length && canAddMore) {
                                return (
                                    <button
                                        key={`add-${idx}`}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                        className="flex-1 min-w-0 rounded-lg bg-slate-100 dark:bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                    >
                                        <Plus size={10} className="text-slate-400" />
                                    </button>
                                );
                            }
                            return <div key={`ph-${idx}`} className="flex-1 min-w-0 rounded-lg bg-slate-100/40 dark:bg-slate-200/20" />;
                        })}
                    </div>
                )}
            </div>

            {hasRecipes && !isDragging && (
                <>
                    {!IS_TOUCH && (
                        <div
                            {...listeners}
                            {...attributes}
                            className="absolute top-1 left-4 -translate-x-1/2 p-0.5 bg-white/90 dark:bg-slate-200/90 rounded-md cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200"
                        >
                            <GripVertical size={14} className="text-slate-400" />
                        </div>
                    )}

                    {recipeIds.length === 1 && canAddMore && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onRemoveRecipe(recipeIds[0]); }}
                            className="absolute bottom-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {recipeIds.length === 1 && canAddMore && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onAdd(); }}
                            className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-orange-500 rounded-lg shadow-md border border-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Plus size={14} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
