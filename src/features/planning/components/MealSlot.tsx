import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/services/db';
import { Plus, RefreshCw, Trash2, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface MealSlotProps {
    label: string;
    icon: string;
    slotId: string;
    recipeId?: string;
    onClick: () => void;
    onModify?: () => void;
    onDelete?: () => void;
}

export const MealSlot = ({ label, icon, slotId, recipeId, onClick, onModify, onDelete }: MealSlotProps) => {
    const recipe = useLiveQuery(
        async () => {
            if (!recipeId) return undefined;
            return await db.recipes.where({ recipeId, type: 'photo' }).first();
        },
        [recipeId]
    );

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: slotId });
    const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
        id: slotId,
        disabled: !recipeId,
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
        ? 'border-slate-100 shadow-sm hover:border-orange-200'
        : 'border-dashed border-slate-200 hover:bg-orange-50/30';

    return (
        <div ref={setRef} className="relative w-full h-full group">
            <button
                onClick={onClick}
                className={`relative w-full h-full rounded-xl border-2 transition-all flex flex-col overflow-hidden bg-white ${borderClass}`}
            >
                {recipe ? (
                    <div className="flex flex-col h-full w-full">
                        <div className="flex-1 min-h-0 w-full p-1 bg-slate-50">
                            <img src={recipe.url} className="w-full h-full object-contain" alt={recipe.name} />
                        </div>
                        <div className="h-6 bg-white border-t border-slate-50 flex items-center px-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase truncate">
                                {recipe.name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-40">
                        <span className="text-lg">{icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
                        <Plus size={12} className="absolute bottom-1 right-1" />
                    </div>
                )}
            </button>

            {recipe && !isDragging && (
                <>
                    <div
                        {...listeners}
                        {...attributes}
                        className="absolute top-1 left-1/2 -translate-x-1/2 p-0.5 bg-white/90 rounded-md cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100"
                    >
                        <GripVertical size={12} className="text-slate-400" />
                    </div>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onModify?.(); }}
                        className="absolute bottom-7 left-1 p-1.5 bg-white/90 text-blue-600 rounded-lg shadow-md border border-slate-100 hover:bg-blue-50 z-20"
                    >
                        <RefreshCw size={14} />
                    </button>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="absolute bottom-7 right-1 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-md border border-slate-100 hover:bg-red-50 z-20"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </div>
    );
};
