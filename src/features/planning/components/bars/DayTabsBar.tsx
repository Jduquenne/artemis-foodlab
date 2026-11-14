import { addDays } from 'date-fns';
import { CostEstimate } from '../../../../core/logic/price/priceLogic';
import { PlanningCostLabel } from '../PlanningCostLabel';

export interface DayTabsBarProps {
    days: readonly string[];
    selectedDay: string;
    monday: Date;
    dayKcal: Record<string, number>;
    dayCost?: Record<string, CostEstimate> | null;
    isSelectionMode: boolean;
    isDraft: (day: string) => boolean;
    isConfirmed: (day: string) => boolean;
    hasMeals: (day: string) => boolean;
    atMax: boolean;
    onSelectDay: (day: string) => void;
    onToggleDraft: (day: string) => void;
}

export const DayTabsBar = ({
    days, selectedDay, monday, dayKcal, dayCost, isSelectionMode,
    isDraft, isConfirmed, hasMeals,
    atMax, onSelectDay, onToggleDraft,
}: DayTabsBarProps) => (
    <div className="sm:hidden grid grid-cols-7 gap-0.5 shrink-0 bg-surface border border-slate-200 rounded-2xl p-1 shadow-sm">
        {days.map((day, i) => {
            const isActive = !isSelectionMode && selectedDay === day;
            const draft = isDraft(day);
            const confirmed = !isSelectionMode && isConfirmed(day);
            const meals = hasMeals(day);
            const blocked = isSelectionMode && !draft && atMax;
            const dayNum = addDays(monday, i).getDate();
            const kcal = dayKcal[day] ?? 0;
            const cost = dayCost?.[day];

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
                        !isActive && !draft ? 'text-slate-400 hover:bg-muted' : '',
                        blocked ? 'opacity-30' : '',
                    ].join(' ')}
                >
                    <span className="text-[9px] font-black uppercase tracking-tight leading-none">
                        {day.slice(0, 3)} <span className="font-semibold normal-case tracking-normal opacity-70">{dayNum}</span>
                    </span>
                    {kcal > 0 && (
                        <span className="text-[8px] font-semibold leading-none mt-0.5 opacity-60">{kcal}</span>
                    )}
                    {cost && cost.total > 0 && (
                        <PlanningCostLabel estimate={cost} compact className={`text-[8px] font-semibold leading-none mt-0.5 ${isActive || draft ? 'text-white! opacity-80' : 'opacity-70'}`} />
                    )}
                    <span className={[
                        'w-1 h-1 rounded-full mt-0.5',
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
