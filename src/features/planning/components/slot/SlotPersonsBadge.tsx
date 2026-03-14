import { Users } from 'lucide-react';
import { IS_TOUCH } from '../../../../shared/utils/deviceUtils';

export interface SlotPersonsBadgeProps {
    persons: number;
    isCustom: boolean;
    isAnyEditing: boolean;
    onEdit: () => void;
}

export const SlotPersonsBadge = ({ persons, isCustom, isAnyEditing, onEdit }: SlotPersonsBadgeProps) => {
    const cls = `flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow ${isCustom ? 'bg-orange-500 text-white' : 'bg-black/30 text-white'}`;

    if (IS_TOUCH) {
        return (
            <button
                aria-label="Modifier le nombre de personnes"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (!isAnyEditing) onEdit(); }}
                className={`absolute top-1 right-1 z-20 ${cls}`}
            >
                <Users size={9} />
                {persons}
            </button>
        );
    }

    return (
        <div className="absolute top-1 right-1 z-10 pointer-events-none">
            <span className={cls}>
                <Users size={9} />
                {persons}
            </span>
        </div>
    );
};
