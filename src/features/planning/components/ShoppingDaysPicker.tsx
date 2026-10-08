import { Check } from 'lucide-react';

export interface ShoppingDaysPickerProps {
    days: readonly string[];
    isDraft: (day: string) => boolean;
    mealCount: (day: string) => number;
    atMax: boolean;
    onToggle: (day: string) => void;
}

export const ShoppingDaysPicker = ({ days, isDraft, mealCount, atMax, onToggle }: ShoppingDaysPickerProps) => (
    <div className="sm:hidden h-full flex flex-col justify-center gap-5 px-1">
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            Jours de courses
        </p>
        <div className="grid grid-cols-7 gap-1.5">
            {days.map(day => {
                const draft = isDraft(day);
                const blocked = !draft && atMax;
                const count = mealCount(day);
                return (
                    <button
                        key={day}
                        onClick={() => !blocked && onToggle(day)}
                        className={[
                            'flex flex-col items-center gap-1 py-3 rounded-2xl transition-all',
                            draft ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30' : 'bg-white dark:bg-slate-100 border border-slate-200 text-slate-500',
                            blocked ? 'opacity-25 pointer-events-none' : '',
                        ].join(' ')}
                    >
                        <span className="text-[10px] font-black uppercase tracking-tight">{day.slice(0, 3)}</span>
                        {draft
                            ? <Check className="w-3 h-3" />
                            : <span className={`text-[9px] font-bold ${count > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                                {count > 0 ? count : '—'}
                            </span>
                        }
                    </button>
                );
            })}
        </div>
    </div>
);
