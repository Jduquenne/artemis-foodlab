export interface DayTabsBarProps {
    days: readonly string[];
    selectedDay: string;
    isSelectionMode: boolean;
    isDraft: (day: string) => boolean;
    isConfirmed: (day: string) => boolean;
    hasMeals: (day: string) => boolean;
    atMax: boolean;
    onSelectDay: (day: string) => void;
    onToggleDraft: (day: string) => void;
}

export const DayTabsBar = ({
    days, selectedDay, isSelectionMode,
    isDraft, isConfirmed, hasMeals,
    atMax, onSelectDay, onToggleDraft,
}: DayTabsBarProps) => (
    <div className="sm:hidden grid grid-cols-7 gap-0.5 shrink-0 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-sm">
        {days.map(day => {
            const isActive = !isSelectionMode && selectedDay === day;
            const draft = isDraft(day);
            const confirmed = !isSelectionMode && isConfirmed(day);
            const meals = hasMeals(day);
            const blocked = isSelectionMode && !draft && atMax;

            return (
                <button
                    key={day}
                    onClick={() => isSelectionMode
                        ? (!blocked ? onToggleDraft(day) : undefined)
                        : onSelectDay(day)
                    }
                    className={[
                        'flex flex-col items-center py-1.5 rounded-xl transition-all select-none',
                        isActive ? 'bg-orange-500 text-white shadow-sm' : '',
                        draft ? 'bg-orange-500 text-white shadow-sm' : '',
                        !isActive && !draft ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200' : '',
                        blocked ? 'opacity-30' : '',
                    ].join(' ')}
                >
                    <span className="text-[9px] font-black uppercase tracking-tight leading-none">
                        {day.slice(0, 3)}
                    </span>
                    <span className={[
                        'w-1 h-1 rounded-full mt-1',
                        !meals ? 'bg-transparent' : '',
                        meals && (isActive || draft) ? 'bg-white/60' : '',
                        meals && !isActive && !draft && confirmed ? 'bg-orange-400' : '',
                        meals && !isActive && !draft && !confirmed ? 'bg-slate-300' : '',
                    ].join(' ')} />
                </button>
            );
        })}
    </div>
);
