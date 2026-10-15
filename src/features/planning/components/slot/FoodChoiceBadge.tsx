import { Shuffle } from 'lucide-react';
import { FoodChoiceStatus } from '../../../../core/logic/foodGroup/foodChoiceLogic';

export interface FoodChoiceBadgeProps {
    status: FoodChoiceStatus;
    onOpen: () => void;
}

const STATUS_CLASS: Record<FoodChoiceStatus, string> = {
    none: 'bg-amber-400 text-white',
    partial: 'bg-amber-400 text-white',
    complete: 'bg-orange-500 text-white',
};

export const FoodChoiceBadge = ({ status, onOpen }: FoodChoiceBadgeProps) => (
    <button
        aria-label="Choisir les ingrédients au choix"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className={`absolute bottom-1 left-1 z-20 flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow ${STATUS_CLASS[status]}`}
    >
        <Shuffle size={10} />
        {status !== 'complete' && <span>à préciser</span>}
    </button>
);
