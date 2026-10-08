import { GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

export type DndListeners = ReturnType<typeof useDraggable>['listeners'];
export type DndAttributes = ReturnType<typeof useDraggable>['attributes'];

export interface DragHandleProps {
    listeners: DndListeners;
    attributes: DndAttributes;
}

export const DragHandle = ({ listeners, attributes }: DragHandleProps) => {
    if (IS_TOUCH) return null;
    return (
        <div
            {...listeners}
            {...attributes}
            className="absolute top-1 left-4 -translate-x-1/2 p-0.5 bg-white/90 dark:bg-slate-200/90 rounded-md cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200"
        >
            <GripVertical size={14} className="text-slate-400" />
        </div>
    );
};
