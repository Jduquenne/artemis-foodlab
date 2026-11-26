import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SLOT_LABELS } from '../../../core/domain/slotLabels';
import { TodayMeal } from '../../../core/logic/planning/todayLogic';
import { buildRecipeDetailUrl } from '../../../core/logic/recipe/recipeScalingLogic';
import { plannedPortions } from '../../../core/logic/recipe/portionsPerPersonLogic';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { plannableRecipe } from '../../../core/domain/recipePredicates';

export interface TodayMealsCardProps {
    title: string;
    meals: TodayMeal[];
    emptyText: string;
}

export const TodayMealsCard = ({ title, meals, emptyText }: TodayMealsCardProps) => {
    const navigate = useNavigate();
    const items = usePlannableSnapshot();

    return (
        <section className="bg-surface border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 min-h-0">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-600 shrink-0">{title}</h2>
            {meals.length === 0 ? (
                <p className="text-sm text-slate-400 italic">{emptyText}</p>
            ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-4 md:min-h-0">
            {meals.map((meal) => (
                <div key={meal.slot} className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{SLOT_LABELS[meal.slot]}</span>
                    {meal.entries.map((entry) => (
                        <button
                            key={`${entry.isDessert ? 'd' : 'r'}-${entry.code}`}
                            type="button"
                            onClick={() => navigate(buildRecipeDetailUrl(entry.code, plannedPortions(entry.persons, plannableRecipe(items[entry.code])), { day: meal.day, slot: meal.slot, persons: entry.persons ?? null }))}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-left hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                        >
                            <span className="flex-1 min-w-0 truncate text-sm font-semibold text-slate-800">
                                {entry.isDessert && <span className="text-slate-400 font-medium">Dessert · </span>}
                                {entry.name}
                            </span>
                            {entry.persons !== undefined && <span className="text-xs font-bold text-slate-400 shrink-0">{entry.persons} pers.</span>}
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                    ))}
                </div>
            ))}
            </div>
            )}
        </section>
    );
};
