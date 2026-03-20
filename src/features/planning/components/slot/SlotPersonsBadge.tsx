import { Users } from 'lucide-react';

export interface SlotPersonsBadgeProps {
    persons: number;
    isCustom: boolean;
    isAnyEditing: boolean;
    onEdit: () => void;
}

export const SlotPersonsBadge = ({ persons, isCustom, isAnyEditing, onEdit }: SlotPersonsBadgeProps) => (
    <button
        aria-label="Modifier le nombre de personnes"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); if (!isAnyEditing) onEdit(); }}
        className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow ${isCustom ? 'bg-orange-500 text-white' : 'bg-black/30 text-white'}`}
    >
        <Users size={9} />
        {persons}
    </button>
);
