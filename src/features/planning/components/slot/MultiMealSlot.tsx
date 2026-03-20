import { useState } from 'react';
import { Plus, Check, Users, Snowflake } from 'lucide-react';
import { PersonsEditor } from './PersonsEditor';
import { SlotPersonsBadge } from './SlotPersonsBadge';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { plannableDb } from '../../../../core/typed-db/plannableDb';
import { RECIPE_BASE_GRAMS } from '../../../../core/utils/macroUtils';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { hasRecipes as slotHasRecipes, isSlotFull, isDish, isBase } from '../../../../core/domain/recipePredicates';
import { MultiRecipeGrid } from './MultiRecipeGrid';
import { MultiSlotActions } from './MultiSlotActions';
import { RecipeMetaEditor } from './RecipeMetaEditor';

export interface MultiMealSlotProps {
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
    recipePersons?: Record<string, number>;
    recipeQuantities?: Record<string, number>;
    onSaveRecipeMeta?: (recipeId: string, persons: number, grams: number) => void;
    batchRecipeIds?: Set<string>;
    persons?: number;
    isEditingPersons?: boolean;
    onOpenPersonsEditor?: () => void;
    onConfirmPersons?: (n: number) => void;
    onCancelPersons?: () => void;
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
    recipePersons,
    recipeQuantities,
    onSaveRecipeMeta,
    batchRecipeIds,
    persons,
    isEditingPersons,
    onOpenPersonsEditor,
    onConfirmPersons,
    onCancelPersons,
}: MultiMealSlotProps) => {
    const [editingMetaId, setEditingMetaId] = useState<string | null>(null);

    const firstRecipe = recipeIds.length === 1 ? plannableDb[recipeIds[0]] : undefined;
    const singlePhotoUrl = firstRecipe?.assets?.photo?.url;
    const singleHasRecipesPage = Boolean(firstRecipe?.assets?.instructionsPhoto?.url);
    const singleIsDish = isDish(firstRecipe) || isBase(firstRecipe);

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

    const singleRecipeId = recipeIds.length === 1 ? recipeIds[0] : null;
    const singleBaseGrams = singleRecipeId ? (RECIPE_BASE_GRAMS[singleRecipeId] ?? 0) : 0;
    const singleCurrentGrams = singleRecipeId ? recipeQuantities?.[singleRecipeId] : undefined;
    const singleCurrentPersons = singleRecipeId ? recipePersons?.[singleRecipeId] : undefined;
    const singleIsCustom = singleCurrentPersons !== undefined || (!singleIsDish && singleCurrentGrams !== undefined);
    const showSingleBadge = !!singleRecipeId && !isAddMode && !copyTargetState && !!onSaveRecipeMeta && !isEditingPersons && (singleIsDish || singleBaseGrams > 0 || singleCurrentPersons !== undefined);

    const inFreezer = recipeIds.length === 1 && (batchRecipeIds?.has(recipeIds[0]) ?? false);
    const displayPersons = persons ?? (recipeIds.length === 1 ? firstRecipe?.defaultPortions : undefined);
    const isPersonsCustom = persons !== undefined;
    const showPersonsBadge = hasRecipes && !isAddMode && !copyTargetState && !editingMetaId && !isEditingPersons && displayPersons !== undefined && !!onOpenPersonsEditor;

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
                        recipePersons={recipePersons}
                        recipeQuantities={recipeQuantities}
                        onEditMeta={onSaveRecipeMeta ? (rid) => setEditingMetaId(rid) : undefined}
                        batchRecipeIds={batchRecipeIds}
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

            {hasRecipes && !isAddMode && !copyTargetState && !editingMetaId && (inFreezer || showPersonsBadge) && (
                <div className="absolute top-1 left-1 z-20 flex items-center gap-1">
                    {inFreezer && (
                        <div className="p-1 bg-cyan-500/80 text-white rounded-lg shadow-sm pointer-events-none">
                            <Snowflake size={10} />
                        </div>
                    )}
                    {showPersonsBadge && (
                        <SlotPersonsBadge
                            persons={displayPersons!}
                            isCustom={isPersonsCustom}
                            isAnyEditing={false}
                            onEdit={onOpenPersonsEditor!}
                        />
                    )}
                </div>
            )}

            {showSingleBadge && !editingMetaId && (
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setEditingMetaId(singleRecipeId!); }}
                    className={`absolute top-1 right-1 z-30 flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow ${singleIsCustom ? 'bg-orange-500 text-white' : 'bg-black/30 text-white'}`}
                >
                    {singleIsDish ? (
                        <span className="flex items-center gap-0.5"><Users size={9} />{singleCurrentPersons !== undefined ? `${singleCurrentPersons}p` : ''}</span>
                    ) : (
                        <>
                            {singleCurrentPersons !== undefined && (
                                <span className="flex items-center gap-0.5"><Users size={9} />{singleCurrentPersons} ·</span>
                            )}
                            {singleBaseGrams > 0 && <span>{singleCurrentGrams ?? Math.round(singleBaseGrams)}g</span>}
                        </>
                    )}
                </button>
            )}

            {hasRecipes && !isDragging && !isAddMode && !copyTargetState && !editingMetaId && (
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

            {isEditingPersons && onConfirmPersons && onCancelPersons && (
                <PersonsEditor
                    initialValue={persons ?? firstRecipe?.defaultPortions ?? 2}
                    defaultPortion={recipeIds.length === 1 ? firstRecipe?.defaultPortions : undefined}
                    onConfirm={onConfirmPersons}
                    onCancel={onCancelPersons}
                />
            )}

            {editingMetaId && onSaveRecipeMeta && (
                <RecipeMetaEditor
                    initialPersons={recipePersons?.[editingMetaId] ?? (isDish(plannableDb[editingMetaId]) || isBase(plannableDb[editingMetaId]) ? 1 : plannableDb[editingMetaId]?.defaultPortions ?? 1)}
                    defaultPersons={isDish(plannableDb[editingMetaId]) || isBase(plannableDb[editingMetaId]) ? 1 : plannableDb[editingMetaId]?.defaultPortions ?? 1}
                    initialGrams={recipeQuantities?.[editingMetaId] ?? Math.round(RECIPE_BASE_GRAMS[editingMetaId] ?? 0)}
                    defaultGrams={Math.round(RECIPE_BASE_GRAMS[editingMetaId] ?? 0)}
                    isDish={isDish(plannableDb[editingMetaId]) || isBase(plannableDb[editingMetaId])}
                    onConfirm={(persons, grams) => { onSaveRecipeMeta(editingMetaId, persons, grams); setEditingMetaId(null); }}
                    onCancel={() => setEditingMetaId(null)}
                />
            )}
        </div>
    );
};
