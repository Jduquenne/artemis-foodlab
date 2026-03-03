import { Info } from 'lucide-react';
import { IngredientSource } from '../../../core/utils/shoppingLogic';

export interface IngredientTooltipProps {
    sources: IngredientSource[];
    onOpen: (sources: IngredientSource[]) => void;
}

export const IngredientTooltip = ({ sources, onOpen }: IngredientTooltipProps) => (
    <button
        onClick={(e) => { e.stopPropagation(); onOpen(sources); }}
        className="flex items-center justify-center w-6 h-6 rounded-full text-slate-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors shrink-0"
        tabIndex={-1}
    >
        <Info className="w-3.5 h-3.5" />
    </button>
);
