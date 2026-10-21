import { RefreshCw, Shuffle, Trash2, Users } from 'lucide-react';
import { DragHandle, DndAttributes, DndListeners } from './DragHandle';
import { ItemAction, ItemActionsMenu } from './ItemActionsMenu';

export interface SlotActionsProps {
    listeners: DndListeners;
    attributes: DndAttributes;
    onModify?: () => void;
    onEditPersons?: () => void;
    onChooseFood?: () => void;
    onDelete?: () => void;
    pending?: boolean;
}

export const SlotActions = ({
    listeners,
    attributes,
    onModify,
    onEditPersons,
    onChooseFood,
    onDelete,
    pending,
}: SlotActionsProps) => {
    const actions: ItemAction[] = [];
    if (onModify) actions.push({ id: 'modify', label: 'Changer le repas', icon: RefreshCw, onSelect: onModify });
    if (onChooseFood) actions.push({ id: 'food-choice', label: 'Choix du repas', icon: Shuffle, onSelect: onChooseFood });
    if (onEditPersons) actions.push({ id: 'persons', label: 'Personnes', icon: Users, onSelect: onEditPersons });
    if (onDelete) actions.push({ id: 'delete', label: 'Supprimer', icon: Trash2, onSelect: onDelete, danger: true });

    return (
        <>
            <DragHandle listeners={listeners} attributes={attributes} />
            <ItemActionsMenu actions={actions} pending={pending} className="bottom-1 right-1" />
        </>
    );
};
