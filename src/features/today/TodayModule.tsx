import { useMemo } from 'react';
import { addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { weekKeyOf } from '../../core/logic/planning/nextMealLogic';
import { plannedMealsOn, slotsOfDay } from '../../core/logic/planning/todayLogic';
import { thawReminders } from '../../core/logic/freezer/thawLogic';
import { usePlannedWeek } from '../../shared/hooks/usePlannedWeek';
import { usePlannableSnapshot, useRecipesSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { useFreezerCategories } from '../../shared/hooks/useFreezerCategories';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { PageHeading } from '../../shared/components/layout/PageHeading';
import { TodayHeroCard } from './components/TodayHeroCard';
import { TodayMealsCard } from './components/TodayMealsCard';
import { TodayThawCard } from './components/TodayThawCard';

const formatToday = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export const TodayModule = () => {
    const navigate = useNavigate();
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const todayKey = weekKeyOf(now);
    const tomorrowKey = weekKeyOf(tomorrow);
    const thisWeek = usePlannedWeek(todayKey.year, todayKey.week);
    const nextWeek = usePlannedWeek(tomorrowKey.year, tomorrowKey.week);
    const items = usePlannableSnapshot();
    const recipes = useRecipesSnapshot();
    const freezer = useFreezerCategories();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);

    const allSlots = useMemo(() => [...thisWeek, ...nextWeek], [thisWeek, nextWeek]);
    const todayMeals = plannedMealsOn(now, allSlots, items);
    const tomorrowMeals = plannedMealsOn(tomorrow, allSlots, items);
    const reminders = thawReminders(slotsOfDay(tomorrow, allSlots), recipes, freezer);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="shrink-0">
                <PageHeading title="Aujourd'hui" subtitle={<span className="first-letter:uppercase inline-block">{formatToday(now)}</span>} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:grid-rows-[minmax(0,3fr)_minmax(0,2fr)] tablet:grid-cols-2 tablet:grid-rows-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,3fr)]">
                <div className="shrink-0 md:shrink md:min-h-0 md:col-span-2">
                    <TodayHeroCard meals={todayMeals} />
                </div>

                <div className="shrink-0 md:shrink md:min-h-0 flex flex-col gap-4 tablet:col-span-2 tablet:grid tablet:grid-cols-2">
                    <TodayThawCard reminders={reminders} />
                    <button
                        type="button"
                        onClick={() => navigate('/shopping')}
                        className="shrink-0 bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3 text-left hover:border-orange-300 transition-colors tablet:self-start"
                    >
                        <ShoppingCart className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="flex-1 min-w-0 text-sm font-semibold text-slate-700">
                            {shoppingDays.length > 0
                                ? `Liste de courses · ${shoppingDays.length} jour${shoppingDays.length > 1 ? 's' : ''} sélectionné${shoppingDays.length > 1 ? 's' : ''}`
                                : 'Aucune liste de courses en cours'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    </button>
                </div>

                <div className="shrink-0 md:shrink md:min-h-0 md:col-span-3 md:overflow-y-auto tablet:col-span-2">
                    <TodayMealsCard title="Demain" meals={tomorrowMeals} emptyText="Rien de prévu demain." />
                </div>
            </div>
        </div>
    );
};
