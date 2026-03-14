import { Plus } from 'lucide-react';
import { RecipeCell } from './RecipeCell';

export interface MultiRecipeGridProps {
    recipeIds: string[];
    canAddMore: boolean;
    isTargetMode: boolean;
    isAddMode?: boolean;
    copyTargetState?: 'source' | 'selectable' | 'selected';
    onNavigateToRecipe: (id: string) => void;
    onRemoveRecipe: (id: string) => void;
    onCopyRecipe?: (id: string) => void;
    onAdd: () => void;
    recipePersons?: Record<string, number>;
    recipeQuantities?: Record<string, number>;
    onEditMeta?: (recipeId: string) => void;
}

export const MultiRecipeGrid = ({
    recipeIds,
    canAddMore,
    isTargetMode,
    isAddMode,
    copyTargetState,
    onNavigateToRecipe,
    onRemoveRecipe,
    onCopyRecipe,
    onAdd,
    recipePersons,
    recipeQuantities,
    onEditMeta,
}: MultiRecipeGridProps) => (
    <div className={`w-full h-full flex flex-row sm:grid sm:grid-cols-2 sm:grid-rows-2 gap-0.5 p-0.5 ${isTargetMode ? 'pointer-events-none' : ''}`}>
        {Array.from({ length: 4 }).map((_, idx) => {
            const rid = recipeIds[idx];
            if (rid) {
                return (
                    <RecipeCell
                        key={rid}
                        recipeId={rid}
                        onNavigate={() => onNavigateToRecipe(rid)}
                        onRemove={() => onRemoveRecipe(rid)}
                        onCopy={onCopyRecipe ? () => onCopyRecipe(rid) : undefined}
                        hideRemove={isAddMode || !!copyTargetState}
                        persons={recipePersons?.[rid]}
                        grams={recipeQuantities?.[rid]}
                        onEditMeta={onEditMeta && !isAddMode && !copyTargetState ? () => onEditMeta(rid) : undefined}
                    />
                );
            }
            if (idx === recipeIds.length && canAddMore) {
                return (
                    <button
                        key={`add-${idx}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="flex-1 min-w-0 rounded-lg bg-slate-100 dark:bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                        <Plus size={10} className="text-slate-400" />
                    </button>
                );
            }
            return <div key={`ph-${idx}`} className="flex-1 min-w-0 rounded-lg bg-slate-100/40 dark:bg-slate-200/20" />;
        })}
    </div>
);
