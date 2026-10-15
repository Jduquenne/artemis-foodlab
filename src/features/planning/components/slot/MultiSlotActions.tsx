import { Copy, Plus, Scale, X } from 'lucide-react';
import { DragHandle, DndAttributes, DndListeners } from './DragHandle';
import { ItemAction, ItemActionsMenu } from './ItemActionsMenu';

export interface MultiSlotActionsProps {
    recipeIds: string[];
    canAddMore: boolean;
    listeners: DndListeners;
    attributes: DndAttributes;
    onCopyRecipe?: (id: string) => void;
    onRemoveRecipe: (id: string) => void;
    onAdd: () => void;
    onEditQuantity?: () => void;
    removePending?: boolean;
}

export const MultiSlotActions = ({
    recipeIds,
    canAddMore,
    listeners,
    attributes,
    onCopyRecipe,
    onRemoveRecipe,
    onAdd,
    onEditQuantity,
    removePending,
}: MultiSlotActionsProps) => {
    const singleId = recipeIds.length === 1 ? recipeIds[0] : null;
    const actions: ItemAction[] = [];
    if (singleId) {
        if (onEditQuantity) actions.push({ id: 'quantity', label: 'Quantité', icon: Scale, onSelect: onEditQuantity });
        if (onCopyRecipe) actions.push({ id: 'copy', label: 'Copier', icon: Copy, onSelect: () => onCopyRecipe(singleId) });
        if (canAddMore) actions.push({ id: 'add', label: 'Ajouter un repas', icon: Plus, onSelect: onAdd });
        actions.push({ id: 'remove', label: 'Retirer', icon: X, onSelect: () => onRemoveRecipe(singleId), danger: true });
    }

    return (
        <>
            <DragHandle listeners={listeners} attributes={attributes} />
            <ItemActionsMenu actions={actions} pending={removePending} className="bottom-1 right-1" />
        </>
    );
};
