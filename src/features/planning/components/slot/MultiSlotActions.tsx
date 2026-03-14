import { GripVertical, X, Copy, Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

type DndListeners = ReturnType<typeof useDraggable>['listeners'];
type DndAttributes = ReturnType<typeof useDraggable>['attributes'];

export interface MultiSlotActionsProps {
    recipeIds: string[];
    canAddMore: boolean;
    listeners: DndListeners;
    attributes: DndAttributes;
    onCopyRecipe?: (id: string) => void;
    onRemoveRecipe: (id: string) => void;
    onAdd: () => void;
}

export const MultiSlotActions = ({
    recipeIds,
    canAddMore,
    listeners,
    attributes,
    onCopyRecipe,
    onRemoveRecipe,
    onAdd,
}: MultiSlotActionsProps) => (
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
                aria-label="Retirer le repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onRemoveRecipe(recipeIds[0]); }}
                className={`absolute bottom-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <X size={14} />
            </button>
        )}

        {recipeIds.length === 1 && onCopyRecipe && (
            <button
                aria-label="Copier ce repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onCopyRecipe(recipeIds[0]); }}
                className={`absolute top-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-violet-500 rounded-lg shadow-md border border-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <Copy size={14} />
            </button>
        )}

        {recipeIds.length === 1 && canAddMore && (
            <button
                aria-label="Ajouter un repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className={`absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-orange-500 rounded-lg shadow-md border border-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <Plus size={14} />
            </button>
        )}
    </>
);
