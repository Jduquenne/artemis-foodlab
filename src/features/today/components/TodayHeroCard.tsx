import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatMealTime, isMealOver } from '../../../core/logic/planning/mealTimeLogic';
import { useMealTimesStore } from '../../../shared/store/useMealTimesStore';
import { MealTimesSheet } from './MealTimesSheet';
import { SLOT_LABELS } from '../../../core/domain/slotLabels';
import { TodayMeal } from '../../../core/logic/planning/todayLogic';
import { buildRecipeDetailUrl } from '../../../core/logic/recipe/recipeScalingLogic';
import { plannedPortions } from '../../../core/logic/recipe/portionsPerPersonLogic';
import { plannableRecipe } from '../../../core/domain/recipePredicates';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { AsyncImage } from '../../../shared/components/ui/AsyncImage';

export interface TodayHeroCardProps {
    meals: TodayMeal[];
    now: Date;
}

export const TodayHeroCard = ({ meals, now }: TodayHeroCardProps) => {
    const navigate = useNavigate();
    const items = usePlannableSnapshot();
    const times = useMealTimesStore((s) => s.times);
    const setTimes = useMealTimesStore((s) => s.setTimes);
    const [editingTimes, setEditingTimes] = useState(false);

    return (
        <section className="bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 md:min-h-0 md:h-full">
            <span className="flex items-center justify-between gap-2 shrink-0">
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-600">Au menu aujourd'hui</h2>
                <button type="button" onClick={() => setEditingTimes(true)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-orange-600">
                    <Clock className="w-3.5 h-3.5" />
                    Horaires
                </button>
            </span>
            {meals.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Rien de prévu aujourd'hui.</p>
            ) : (
                <div className={`grid gap-3 grid-cols-2 auto-rows-[8rem] sm:auto-rows-[10rem] md:flex-1 md:min-h-0 md:auto-rows-auto ${meals.length > 2 ? 'md:grid-rows-2' : 'md:grid-rows-1'}`}>
                    {meals.map((meal) => {
                        const main = meal.entries.find((entry) => !entry.isDessert) ?? meal.entries[0];
                        if (!main) return null;
                        const desserts = meal.entries.filter((entry) => entry.isDessert);
                        const over = isMealOver(times[meal.slot], now);
                        const open = () => navigate(buildRecipeDetailUrl(main.code, plannedPortions(main.persons, plannableRecipe(items[main.code])), { day: meal.day, slot: meal.slot, persons: main.persons ?? null }));
                        return (
                            <button
                                key={meal.slot}
                                type="button"
                                onClick={open}
                                className={`relative min-h-0 rounded-2xl overflow-hidden bg-muted text-left group transition-opacity ${over ? 'opacity-45 grayscale' : ''}`}
                            >
                                <AsyncImage asset={items[main.code]?.assets?.mealPhoto} alt={main.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2 sm:p-3 bg-black/55 text-white">
                                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-orange-300 truncate">
                                        {SLOT_LABELS[meal.slot]} · {formatMealTime(times[meal.slot])}{main.persons !== undefined && ` · ${main.persons} pers.`}{over && ' · terminé'}
                                    </span>
                                    <span className="text-sm sm:text-base font-black leading-tight line-clamp-2">
                                        {meal.entries.filter((entry) => !entry.isDessert).map((entry) => entry.name).join(', ') || main.name}
                                    </span>
                                    {desserts.length > 0 && (
                                        <span className="text-xs text-white/80 truncate">+ {desserts.map((entry) => entry.name).join(', ')}</span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            {editingTimes && <MealTimesSheet times={times} onSave={setTimes} onClose={() => setEditingTimes(false)} />}
        </section>
    );
};
