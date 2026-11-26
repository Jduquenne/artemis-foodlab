import { useMemo } from 'react';
import { addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { computeDayMacros } from '../../core/logic/nutrition/macroLogic';
import { weekKeyOf } from '../../core/logic/planning/nextMealLogic';
import { plannedMealsOn, slotsOfDay } from '../../core/logic/planning/todayLogic';
import { usePlannedWeek } from '../../shared/hooks/usePlannedWeek';
import { usePlannableSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { useMacroCatalogue } from '../../shared/hooks/useMacroCatalogue';
import { useActiveJournalOverrides } from '../../shared/hooks/useActiveJournalOverrides';
import { useActiveProfile, useActiveTargets } from '../../shared/hooks/useActiveProfile';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { TodayHeroCard } from './components/TodayHeroCard';
import { TodayMealsCard } from './components/TodayMealsCard';
import { TodayNutritionCard } from './components/TodayNutritionCard';

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
    const catalogue = useMacroCatalogue();
    const activeProfile = useActiveProfile();
    const { kcalTarget, macroTargets } = useActiveTargets();
    const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);

    const allSlots = useMemo(() => [...thisWeek, ...nextWeek], [thisWeek, nextWeek]);
    const todayMeals = plannedMealsOn(now, allSlots, items);
    const tomorrowMeals = plannedMealsOn(tomorrow, allSlots, items);
    const macros = computeDayMacros(catalogue, slotsOfDay(now, allSlots), portionOverrides, gramOverrides, ingredientOverrides, activeProfile);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="shrink-0">
                <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Aujourd'hui</h1>
                <p className="text-slate-500 text-sm mt-0.5 first-letter:uppercase">{formatToday(now)}</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
                <div className="md:col-span-2 min-h-0">
                    <TodayHeroCard meals={todayMeals} />
                </div>

                <div className="flex flex-col gap-4 min-h-0">
                    <TodayNutritionCard
                        profileName={activeProfile?.name ?? null}
                        macros={macros}
                        kcalTarget={kcalTarget}
                        macroTargets={macroTargets}
                        onOpen={() => navigate('/journal')}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/shopping')}
                        className="shrink-0 bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3 text-left hover:border-orange-300 transition-colors"
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

                <div className="md:col-span-3 min-h-0 md:overflow-y-auto">
                    <TodayMealsCard title="Demain" meals={tomorrowMeals} emptyText="Rien de prévu demain." />
                </div>
            </div>
        </div>
    );
};
