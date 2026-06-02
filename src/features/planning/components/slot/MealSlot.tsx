import { Plus, Snowflake } from 'lucide-react';
import { PersonsEditor } from './PersonsEditor';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { plannableDb } from '../../../../core/typed-db/plannableDb';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { isOutdoor } from '../../../../core/domain/recipePredicates';
import { SlotPersonsBadge } from './SlotPersonsBadge';
import { SlotActions } from './SlotActions';
import { DessertColumn } from './DessertColumn';

export interface MealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeIds: string[];
    persons?: number;
    isEditingPersons: boolean;
    isAnyEditing: boolean;
    onNavigate: () => void;
    onOpenPicker: () => void;
    onModify?: () => void;
    onDelete?: () => void;
    onOpenPersonsEditor: () => void;
    onConfirmPersons: (n: number) => void;
    onCancelPersons: () => void;
    isAddMode?: boolean;
    onAddToSlot?: () => void;
    hasDessert?: boolean;
    dessertIds?: string[];
    onAddDessert?: () => void;
    onRemoveDessert?: (recipeId: string) => void;
    onCopyDessert?: (recipeId: string) => void;
    copySourceDessertId?: string;
    dessertCopyTargetState?: 'selectable' | 'selected';
    onSelectDessertAsTarget?: () => void;
    inFreezer?: boolean;
    recipePersons?: Record<string, number>;
    onSetDessertPersons?: (id: string, n: number) => void;
}

export const MealSlot = ({
    label, icon, slotId, recipeIds, persons,
    isEditingPersons, isAnyEditing,
    onNavigate, onOpenPicker, onModify, onDelete,
    onOpenPersonsEditor, onConfirmPersons, onCancelPersons,
    isAddMode, onAddToSlot,
    hasDessert, dessertIds, onAddDessert, onRemoveDessert,
    onCopyDessert, copySourceDessertId, dessertCopyTargetState, onSelectDessertAsTarget,
    inFreezer, recipePersons, onSetDessertPersons,
}: MealSlotProps) => {
    const firstId = recipeIds[0];
    const recipe = firstId ? plannableDb[firstId] : undefined;
    const hasPhoto = Boolean(recipe?.assets?.mealPhoto);
    const hasRecipesPage = Boolean(recipe?.assets?.mealPhoto || recipe?.assets?.instructionsPhoto);
    const defaultPortion = recipe?.defaultPortions;

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: recipeIds.length === 0 || isAnyEditing || IS_TOUCH || !!isAddMode,
    });

    const setRef = (el: HTMLDivElement | null) => {
        setDropRef(el);
        setDragRef(el);
    };

    const handleMainClick = () => {
        if (isAddMode) { onAddToSlot?.(); return; }
        if (isAnyEditing) return;
        if (hasPhoto) {
            if (hasRecipesPage) onNavigate();
        } else {
            onOpenPicker();
        }
    };

    const borderClass = isAddMode
        ? 'ring-2 ring-orange-400 border-orange-300 cursor-pointer'
        : isDragging
            ? 'opacity-30 border-slate-200'
            : isOver
                ? 'border-orange-400 bg-orange-50/40'
                : hasPhoto
                    ? 'border-slate-200 shadow-sm hover:border-orange-200'
                    : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    const displayPersons = persons ?? defaultPortion;
    const isCustom = persons !== undefined;
    const showDessertColumn = hasDessert && !isOutdoor(recipe) && !!hasPhoto;

    const mainContent = (
        <>
            <button
                onClick={handleMainClick}
                className={`relative w-full h-full rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-slate-100 ${borderClass} ${hasPhoto && !hasRecipesPage ? 'cursor-default' : ''}`}
            >
                {hasPhoto ? (
                    <div className="relative w-full h-full">
                        <img src={recipe!.assets.mealPhoto!.url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt={recipe!.name} />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            <span className="bg-black/70 text-white text-[14px] font-bold px-1.5 py-0.5 rounded-md leading-tight line-clamp-4 text-center">{recipe!.name}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-40">
                            <span className="text-2xl">{icon}</span>
                            <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                        </div>
                        <div className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-orange-500 rounded-lg border border-slate-200">
                            <Plus size={14} />
                        </div>
                    </>
                )}
            </button>

            {hasPhoto && !isDragging && !isAddMode && (inFreezer || (!isEditingPersons && displayPersons !== undefined)) && (
                <div className="absolute top-1 left-1 z-20 flex items-center gap-1">
                    {inFreezer && (
                        <div className="p-1 bg-cyan-500/80 text-white rounded-lg shadow-sm pointer-events-none">
                            <Snowflake size={10} />
                        </div>
                    )}
                    {!isEditingPersons && displayPersons !== undefined && (
                        <SlotPersonsBadge
                            persons={displayPersons}
                            isCustom={isCustom}
                            isAnyEditing={isAnyEditing}
                            onEdit={onOpenPersonsEditor}
                        />
                    )}
                </div>
            )}

            {hasPhoto && !isDragging && !isEditingPersons && !isAddMode && (
                <SlotActions
                    listeners={listeners}
                    attributes={attributes}
                    onModify={onModify}
                    onDelete={onDelete}
                />
            )}

            {isEditingPersons && (
                <PersonsEditor
                    initialValue={persons ?? defaultPortion ?? 2}
                    defaultPortion={defaultPortion}
                    onConfirm={onConfirmPersons}
                    onCancel={onCancelPersons}
                />
            )}
        </>
    );

    if (showDessertColumn) {
        return (
            <div ref={setRef} className="relative w-full h-full group flex gap-1">
                <div className="relative flex-2 h-full min-w-0">
                    {mainContent}
                </div>
                <DessertColumn
                    dessertIds={dessertIds ?? []}
                    isAddMode={isAddMode}
                    dessertCopyTargetState={dessertCopyTargetState}
                    copySourceDessertId={copySourceDessertId}
                    onAddDessert={onAddDessert}
                    onRemoveDessert={onRemoveDessert}
                    onCopyDessert={onCopyDessert}
                    onSelectAsTarget={onSelectDessertAsTarget}
                    recipePersons={recipePersons}
                    slotPersons={displayPersons}
                    onSetDessertPersons={onSetDessertPersons}
                />
            </div>
        );
    }

    return (
        <div ref={setRef} className="relative w-full h-full group">
            {mainContent}
        </div>
    );
};
