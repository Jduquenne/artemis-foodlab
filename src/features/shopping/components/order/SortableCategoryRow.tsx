import { useSortable } from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp, GripVertical, Loader2, Trash2 } from 'lucide-react';
import { ShoppingAisle } from '../../../../core/domain/shopping';
import { useInlineRename } from '../../../../shared/hooks/useInlineRename';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface SortableCategoryRowProps {
    aisle: ShoppingAisle;
    position: number;
    isFirst: boolean;
    isLast: boolean;
    disabled: boolean;
    onMove: (delta: -1 | 1) => void;
    onRename?: (label: string) => Promise<unknown>;
    onAskDelete?: () => void;
}

export const SortableCategoryRow = ({ aisle, position, isFirst, isLast, disabled, onMove, onRename, onAskDelete }: SortableCategoryRowProps) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: aisle.id, disabled });
    const rename = useInlineRename(aisle.label, `shopping-aisle-rename:${aisle.id}`, (label) => onRename ? onRename(label) : Promise.resolve());
    const deletePending = usePendingKey(`shopping-aisle-delete:${aisle.id}`);
    const isCustom = aisle.kind === 'custom';
    const rowDisabled = disabled || rename.pending || deletePending;

    return (
        <li
            ref={setNodeRef}
            style={{ transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border bg-surface ${isDragging ? 'relative z-10 border-orange-300 shadow-lg' : 'border-slate-200'}`}
        >
            <button
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                type="button"
                aria-label={`Déplacer ${aisle.label}`}
                disabled={rowDisabled}
                className="p-1 rounded-lg text-slate-400 hover:text-orange-500 cursor-grab active:cursor-grabbing touch-none disabled:opacity-40"
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <span className="w-5 text-xs font-bold text-slate-400 tabular-nums text-right">{position}</span>

            {isCustom && rename.editing ? (
                <input
                    autoFocus
                    value={rename.value}
                    maxLength={50}
                    disabled={rename.pending}
                    onChange={(e) => rename.setValue(e.target.value)}
                    onBlur={rename.confirm}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') rename.confirm();
                        if (e.key === 'Escape') rename.cancel();
                    }}
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-orange-300 bg-surface text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
            ) : isCustom ? (
                <button
                    type="button"
                    onClick={rename.start}
                    disabled={rowDisabled}
                    title="Renommer"
                    className="flex-1 min-w-0 flex items-center gap-1.5 text-left"
                >
                    <span className="truncate text-sm font-semibold text-slate-800">{aisle.label}</span>
                    <span className="shrink-0 text-[9px] font-bold uppercase text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1 py-0.5 rounded">perso</span>
                </button>
            ) : (
                <span className="flex-1 min-w-0 truncate text-sm font-semibold text-slate-800">{aisle.label}</span>
            )}

            {isCustom && onAskDelete && (
                <button
                    type="button"
                    aria-label={`Supprimer ${aisle.label}`}
                    disabled={rowDisabled}
                    onClick={onAskDelete}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-30"
                >
                    {deletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
            )}
            <button
                type="button"
                aria-label={`Monter ${aisle.label}`}
                disabled={rowDisabled || isFirst}
                onClick={() => onMove(-1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted disabled:opacity-30"
            >
                <ChevronUp className="w-4 h-4" />
            </button>
            <button
                type="button"
                aria-label={`Descendre ${aisle.label}`}
                disabled={rowDisabled || isLast}
                onClick={() => onMove(1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-muted disabled:opacity-30"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
        </li>
    );
};
