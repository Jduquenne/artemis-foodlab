import { useSortable } from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { IngredientCategory } from '../../../../core/domain/ingredient';

export interface SortableCategoryRowProps {
    category: IngredientCategory;
    position: number;
    isFirst: boolean;
    isLast: boolean;
    disabled: boolean;
    onMove: (delta: -1 | 1) => void;
}

export const SortableCategoryRow = ({ category, position, isFirst, isLast, disabled, onMove }: SortableCategoryRowProps) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: category, disabled });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border bg-surface ${isDragging ? 'relative z-10 border-orange-300 shadow-lg' : 'border-slate-200'}`}
        >
            <button
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                type="button"
                aria-label={`Déplacer ${category}`}
                disabled={disabled}
                className="p-1 rounded-lg text-slate-400 hover:text-orange-500 cursor-grab active:cursor-grabbing touch-none disabled:opacity-40"
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <span className="w-5 text-xs font-bold text-slate-400 tabular-nums text-right">{position}</span>
            <span className="flex-1 min-w-0 truncate text-sm font-semibold text-slate-800">{category}</span>
            <button
                type="button"
                aria-label={`Monter ${category}`}
                disabled={disabled || isFirst}
                onClick={() => onMove(-1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted disabled:opacity-30"
            >
                <ChevronUp className="w-4 h-4" />
            </button>
            <button
                type="button"
                aria-label={`Descendre ${category}`}
                disabled={disabled || isLast}
                onClick={() => onMove(1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted disabled:opacity-30"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
        </li>
    );
};
