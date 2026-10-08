import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';
import { DragHandle, DndAttributes, DndListeners } from './DragHandle';

export interface SlotActionsProps {
    listeners: DndListeners;
    attributes: DndAttributes;
    onModify?: () => void;
    onDelete?: () => void;
    pending?: boolean;
}

export const SlotActions = ({
    listeners,
    attributes,
    onModify,
    onDelete,
    pending,
}: SlotActionsProps) => (
    <>
        <DragHandle listeners={listeners} attributes={attributes} />

        <button
            aria-label="Changer le repas"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onModify?.(); }}
            className={`absolute bottom-1 left-1 p-1.5 bg-surface-raised/90 text-blue-600 rounded-lg shadow-md border border-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 z-20 transition-opacity ${IS_TOUCH ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
            <RefreshCw size={14} />
        </button>

        <button
            aria-label="Supprimer le repas"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (!pending) onDelete?.(); }}
            disabled={pending}
            className={`absolute bottom-1 right-1 p-1.5 bg-surface-raised/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 transition-opacity disabled:opacity-60 ${IS_TOUCH || pending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
    </>
);
