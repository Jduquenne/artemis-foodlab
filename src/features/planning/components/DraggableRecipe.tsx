import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const DraggableRecipe = ({ recipe, slotId }: { recipe: any, slotId: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `draggable-${slotId}`,
        data: { recipe, fromSlot: slotId }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-grab active:cursor-grabbing"
        >
            <img src={recipe.image} className="h-16 w-full object-cover" alt="" />
            <div className="p-2 text-[11px] font-bold truncate">{recipe.name}</div>
        </div>
    );
};