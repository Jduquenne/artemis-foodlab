import { useNavigate } from 'react-router-dom';
import { SLOT_LABELS } from '../../../core/domain/slotLabels';
import { TodayMeal } from '../../../core/logic/planning/todayLogic';
import { buildRecipeDetailUrl } from '../../../core/logic/recipe/recipeScalingLogic';
import { plannedPortions } from '../../../core/logic/recipe/portionsPerPersonLogic';
import { plannableRecipe } from '../../../core/domain/recipePredicates';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { AsyncImage } from '../../../shared/components/ui/AsyncImage';

export interface TodayHeroCardProps {
    meals: TodayMeal[];
}

export const TodayHeroCard = ({ meals }: TodayHeroCardProps) => {
    const navigate = useNavigate();
    const items = usePlannableSnapshot();

    return (
        <section className="bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 min-h-0 md:h-full">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-600 shrink-0">Au menu aujourd'hui</h2>
            {meals.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Rien de prévu aujourd'hui.</p>
            ) : (
                <div className={`grid gap-3 flex-1 min-h-0 grid-cols-1 sm:grid-cols-2 auto-rows-[10rem] md:auto-rows-auto ${meals.length > 2 ? 'md:grid-rows-2' : 'md:grid-rows-1'}`}>
                    {meals.map((meal) => {
                        const main = meal.entries.find((entry) => !entry.isDessert) ?? meal.entries[0];
                        if (!main) return null;
                        const desserts = meal.entries.filter((entry) => entry.isDessert);
                        const open = () => navigate(buildRecipeDetailUrl(main.code, plannedPortions(main.persons, plannableRecipe(items[main.code])), { day: meal.day, slot: meal.slot, persons: main.persons ?? null }));
                        return (
                            <button
                                key={meal.slot}
                                type="button"
                                onClick={open}
                                className="relative min-h-0 rounded-2xl overflow-hidden bg-muted text-left group"
                            >
                                <AsyncImage asset={items[main.code]?.assets?.mealPhoto} alt={main.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3 bg-black/55 text-white">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-orange-300">
                                        {SLOT_LABELS[meal.slot]}{main.persons !== undefined && ` · ${main.persons} pers.`}
                                    </span>
                                    <span className="text-base font-black leading-tight line-clamp-2">
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
        </section>
    );
};
