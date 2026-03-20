import { GripVertical, RefreshCw, Trash2 } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

type DndListeners = ReturnType<typeof useDraggable>['listeners'];
type DndAttributes = ReturnType<typeof useDraggable>['attributes'];

export interface SlotActionsProps {
    listeners: DndListeners;
    attributes: DndAttributes;
    onModify?: () => void;
    onDelete?: () => void;
}

export const SlotActions = ({
    listeners,
    attributes,
    onModify,
    onDelete,
}: SlotActionsProps) => (
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

        <button
            aria-label="Changer le repas"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onModify?.(); }}
            className={`absolute bottom-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-blue-600 rounded-lg shadow-md border border-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
            <RefreshCw size={14} />
        </button>

        <button
            aria-label="Supprimer le repas"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className={`absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
            <Trash2 size={14} />
        </button>
    </>
);
