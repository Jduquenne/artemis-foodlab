import { Plus, Check } from 'lucide-react';
import { DessertCell } from './DessertCell';

export interface DessertColumnProps {
    dessertIds: string[];
    isAddMode?: boolean;
    dessertCopyTargetState?: 'selectable' | 'selected';
    copySourceDessertId?: string;
    onAddDessert?: () => void;
    onRemoveDessert?: (id: string) => void;
    onCopyDessert?: (id: string) => void;
    onSelectAsTarget?: () => void;
}

export const DessertColumn = ({
    dessertIds,
    isAddMode,
    dessertCopyTargetState,
    copySourceDessertId,
    onAddDessert,
    onRemoveDessert,
    onCopyDessert,
    onSelectAsTarget,
}: DessertColumnProps) => {
    const isTargetMode = dessertCopyTargetState === 'selectable' || dessertCopyTargetState === 'selected';
    const addButtonShown = dessertIds.length < 3 && !isAddMode && !isTargetMode && !!onAddDessert;
    const placeholderCount = Math.max(0, 3 - dessertIds.length - (addButtonShown ? 1 : 0));

    return (
        <div
            className={`relative flex flex-col gap-1 w-[35%] shrink-0 h-full ${isTargetMode ? 'cursor-pointer' : ''}`}
            onClick={isTargetMode ? (e) => { e.stopPropagation(); onSelectAsTarget?.(); } : undefined}
        >
            {dessertIds.map(rid => (
                <DessertCell
                    key={rid}
                    recipeId={rid}
                    onRemove={() => onRemoveDessert?.(rid)}
                    isAddMode={isAddMode}
                    onCopy={onCopyDessert ? () => onCopyDessert(rid) : undefined}
                    isCopySource={rid === copySourceDessertId}
                    hideActions={isTargetMode}
                />
            ))}
            {addButtonShown && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAddDessert?.(); }}
                    className="flex-1 min-h-0 rounded-lg border border-dashed border-slate-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                    <Plus size={12} className="text-slate-400" />
                </button>
            )}
            {Array.from({ length: placeholderCount }).map((_, i) => (
                <div key={`ph-${i}`} className="flex-1 min-h-0 rounded-lg bg-slate-100/50 dark:bg-slate-200/20" />
            ))}
            {isTargetMode && (
                <div className={`absolute inset-0 rounded-lg pointer-events-none flex items-center justify-center ${dessertCopyTargetState === 'selected'
                    ? 'ring-2 ring-violet-500 bg-violet-500/10'
                    : 'ring-2 ring-violet-300'
                }`}>
                    {dessertCopyTargetState === 'selected' && (
                        <div className="bg-violet-500 rounded-full p-1 shadow-lg">
                            <Check size={10} className="text-white" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
