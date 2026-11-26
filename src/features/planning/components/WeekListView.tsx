import { addDays } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { MealSlot } from '../../../core/domain/planning';
import { SLOT_SHORT_LABELS } from '../../../core/domain/slotLabels';
import { weekListDays } from '../../../core/logic/planning/weekListLogic';
import { formatDateShort } from '../../../core/utils/weekUtils';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';

export interface WeekListViewProps {
    days: readonly string[];
    monday: Date;
    slots: MealSlot[];
    dayKcal: Record<string, number>;
    selectedDay: string;
    onOpenDay: (day: string) => void;
}

export const WeekListView = ({ days, monday, slots, dayKcal, selectedDay, onOpenDay }: WeekListViewProps) => {
    const items = usePlannableSnapshot();
    const rows = weekListDays(days, slots, items);

    return (
        <div className="sm:hidden h-full overflow-y-auto flex flex-col gap-2 pb-2">
            {rows.map((row, index) => {
                const kcal = Math.round(dayKcal[row.day] ?? 0);
                return (
                    <button
                        key={row.day}
                        type="button"
                        onClick={() => onOpenDay(row.day)}
                        className={`w-full text-left rounded-xl border px-3 py-2 bg-surface transition-colors hover:border-orange-300 ${row.day === selectedDay ? 'border-orange-300' : 'border-slate-200'}`}
                    >
                        <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-black text-slate-800">
                                {row.day} <span className="font-bold text-slate-400">{formatDateShort(addDays(monday, index))}</span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 tabular-nums">
                                {kcal > 0 && `${kcal} kcal`}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </span>
                        {row.isEmpty ? (
                            <span className="block text-xs text-slate-400 italic mt-0.5">Rien de prévu</span>
                        ) : (
                            <span className="mt-1 flex flex-col gap-0.5">
                                {row.meals.filter((meal) => meal.names.length > 0 || meal.dessertCount > 0).map((meal) => (
                                    <span key={meal.slot} className="flex gap-2 text-xs min-w-0">
                                        <span className="w-16 shrink-0 font-bold text-slate-400">{SLOT_SHORT_LABELS[meal.slot]}</span>
                                        <span className="min-w-0 truncate text-slate-700">
                                            {meal.names.join(', ') || '—'}
                                            {meal.dessertCount > 0 && <span className="text-slate-400"> + {meal.dessertCount} dessert{meal.dessertCount > 1 ? 's' : ''}</span>}
                                        </span>
                                    </span>
                                ))}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
