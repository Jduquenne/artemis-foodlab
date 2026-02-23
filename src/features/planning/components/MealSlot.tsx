import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/services/db';
import { Plus, RefreshCw, Trash2, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface MealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeIds: string[];
    onClick: () => void;
    onModify?: () => void;
    onDelete?: () => void;
}

export const MealSlot = ({ label, icon, slotId, recipeIds, onClick, onModify, onDelete }: MealSlotProps) => {
    const recipe = useLiveQuery(
        async () => {
            const firstId = recipeIds[0];
            if (!firstId) return undefined;
            return await db.recipes.where({ recipeId: firstId, type: 'photo' }).first();
        },
        [recipeIds[0]]
    );

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: recipeIds.length === 0,
    });

    const setRef = (el: HTMLDivElement | null) => {
        setDropRef(el);
        setDragRef(el);
    };

    const borderClass = isDragging
        ? 'opacity-30 border-slate-200'
        : isOver
            ? 'border-orange-400 bg-orange-50/40'
            : recipe
                ? 'border-slate-200 shadow-sm hover:border-orange-200'
                : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    return (
        <div ref={setRef} className="relative w-full h-full group">
            <button
                onClick={onClick}
                className={`relative w-full h-full rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-slate-100 ${borderClass}`}
            >
                {recipe ? (
                    <img src={recipe.url} className="w-full h-full object-contain" alt={recipe.name} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-40">
                        <span className="text-2xl">{icon}</span>
                        <span className="text-[12px] font-black uppercase tracking-tighter">{label}</span>
                        <Plus size={20} className="absolute bottom-1 right-1" />
                    </div>
                )}
            </button>

            {recipe && !isDragging && (
                <>
                    <div
                        {...listeners}
                        {...attributes}
                        className="absolute top-1 left-4 -translate-x-1/2 p-0.5 bg-white/90 dark:bg-slate-200/90 rounded-md cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200"
                    >
                        <GripVertical size={14} className="text-slate-400" />
                    </div>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onModify?.(); }}
                        className="absolute bottom-1 left-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-blue-600 rounded-lg shadow-md border border-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <RefreshCw size={14} />
                    </button>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-200/90 text-red-500 rounded-lg shadow-md border border-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </div>
    );
};
