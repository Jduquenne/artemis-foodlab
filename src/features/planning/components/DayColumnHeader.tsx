import { Check, ShoppingCart } from 'lucide-react';
import { formatDayDate } from '../../../shared/utils/dateUtils';

export interface DayColumnHeaderProps {
    day: string;
    dayIndex: number;
    monday: Date;
    kcal: number;
    isSelectionMode: boolean;
    selected: boolean;
    confirmed: boolean;
    blocked: boolean;
    onToggle: () => void;
}

export const DayColumnHeader = ({ day, dayIndex, monday, kcal, isSelectionMode, selected, confirmed, blocked, onToggle }: DayColumnHeaderProps) => (
    <div
        onClick={isSelectionMode && !blocked ? onToggle : undefined}
        className={[
            'flex flex-col items-center justify-center font-black uppercase tracking-widest rounded-lg transition-colors select-none',
            isSelectionMode ? (blocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer') : '',
            selected ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' : '',
            confirmed ? 'text-orange-400' : 'text-slate-400',
            isSelectionMode && !selected && !blocked ? 'hover:bg-slate-100 dark:hover:bg-slate-700/40' : '',
        ].join(' ')}
    >
        <div className="flex items-center gap-1 text-xs tablet:flex-col tablet:gap-0">
            {selected && <Check className="w-3 h-3 shrink-0" />}
            {confirmed && <ShoppingCart className="w-2.5 h-2.5 shrink-0" />}
            <span>{day.slice(0, 3)}</span>
            <span className="font-semibold normal-case tracking-normal opacity-60 text-[10px]">
                {formatDayDate(monday, dayIndex)}
            </span>
        </div>
        {kcal > 0 && (
            <span className="font-semibold normal-case tracking-normal opacity-60 text-[11px]">
                {kcal} kcal
            </span>
        )}
    </div>
);
