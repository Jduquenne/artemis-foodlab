import { X, Copy, Loader2, Plus } from 'lucide-react';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { DragHandle, DndAttributes, DndListeners } from './DragHandle';

export interface MultiSlotActionsProps {
    recipeIds: string[];
    canAddMore: boolean;
    listeners: DndListeners;
    attributes: DndAttributes;
    onCopyRecipe?: (id: string) => void;
    onRemoveRecipe: (id: string) => void;
    onAdd: () => void;
    removePending?: boolean;
}

export const MultiSlotActions = ({
    recipeIds,
    canAddMore,
    listeners,
    attributes,
    onCopyRecipe,
    onRemoveRecipe,
    onAdd,
    removePending,
}: MultiSlotActionsProps) => (
    <>
        <DragHandle listeners={listeners} attributes={attributes} />

        {recipeIds.length === 1 && canAddMore && (
            <button
                aria-label="Retirer le repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (!removePending) onRemoveRecipe(recipeIds[0]); }}
                disabled={removePending}
                className={`absolute bottom-1 left-1 p-1.5 bg-surface-raised/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 transition-opacity disabled:opacity-60 ${IS_TOUCH || removePending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                {removePending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            </button>
        )}

        {recipeIds.length === 1 && onCopyRecipe && (
            <button
                aria-label="Copier ce repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onCopyRecipe(recipeIds[0]); }}
                className={`absolute top-1 left-1 p-1.5 bg-surface-raised/90 text-violet-500 rounded-lg shadow-md border border-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <Copy size={14} />
            </button>
        )}

        {recipeIds.length === 1 && canAddMore && (
            <button
                aria-label="Ajouter un repas"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className={`absolute bottom-1 right-1 p-1.5 bg-surface-raised/90 text-orange-500 rounded-lg shadow-md border border-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <Plus size={14} />
            </button>
        )}
    </>
);
