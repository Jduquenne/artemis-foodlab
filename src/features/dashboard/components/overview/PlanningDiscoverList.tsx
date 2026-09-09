import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { CATEGORIES } from "../../../../core/domain/categories";
import { typedFoodDb } from "../../../../core/typed-db/typedFoodDb";
import {
  DishUsage,
  EMPTY_REVIEW_FILTERS,
  ReviewFilters,
  filterReviewDishes,
  getReviewFilterOptions,
} from "../../../../core/logic/dashboard/planningUsage";
import { formatWeeksAgo, weeksSinceIsoWeek } from "../../../../shared/utils/weekUtils";
import { AsyncImage } from "../../../../shared/components/ui/AsyncImage";

export interface PlanningDiscoverListProps {
  dishes: DishUsage[];
}

const badge = (dish: DishUsage): string => {
  if (dish.plannedCount === 0) return "Jamais";
  const ago = dish.lastWeek ? formatWeeksAgo(weeksSinceIsoWeek(dish.lastWeek)) : "";
  return ago ? `1 fois · ${ago}` : "1 fois";
};

const SELECT_CLASS =
  "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-orange-400";

const PREVIEW_COUNT = 6;

export const PlanningDiscoverList = ({ dishes }: PlanningDiscoverListProps) => {
  const [filters, setFilters] = useState<ReviewFilters>(EMPTY_REVIEW_FILTERS);
  const [showAll, setShowAll] = useState(false);

  const options = useMemo(
    () => getReviewFilterOptions(dishes, typedFoodDb, CATEGORIES),
    [dishes],
  );
  const filtered = useMemo(() => filterReviewDishes(dishes, filters), [dishes, filters]);

  const isFiltered = filters.categoryId !== "" || filters.foodId !== "";
  const visible = isFiltered || showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-slate-500">
        À découvrir{" "}
        <span className="text-slate-400">
          · {isFiltered ? `${filtered.length} / ${dishes.length}` : dishes.length}
        </span>
      </span>

      {dishes.length === 0 ? (
        <p className="text-xs text-slate-400">Tous tes plats ont été planifiés au moins deux fois.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="">Toutes catégories</option>
              {options.categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.count})
                </option>
              ))}
            </select>
            <select
              value={filters.foodId}
              onChange={(e) => setFilters((f) => ({ ...f, foodId: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="">Tous aliments</option>
              {options.foods.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.count})
                </option>
              ))}
            </select>
          </div>

          {visible.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun plat à découvrir avec ce filtre.</p>
          ) : (
            <ul className={`flex flex-col gap-1.5 ${visible.length > PREVIEW_COUNT ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
              {visible.map((dish) => (
                <li key={dish.code} className="flex items-center gap-2.5">
                  <AsyncImage
                    src={dish.photoUrl}
                    alt={dish.name}
                    wrapperClassName="w-9 h-9 rounded-lg shrink-0"
                    className="object-cover"
                  />
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-700">{dish.name}</span>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      dish.plannedCount === 0 ? "text-slate-400" : "text-amber-600"
                    }`}
                  >
                    {badge(dish)}
                  </span>
                  {dish.photoUrl && (
                    <a
                      href={`#/recipes/detail/${dish.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ouvrir ${dish.name} dans un nouvel onglet`}
                      className="shrink-0 rounded p-0.5 text-slate-300 hover:text-orange-500 transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isFiltered && filtered.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1 self-start text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors"
            >
              {showAll ? "Réduire" : `Voir les ${filtered.length - PREVIEW_COUNT} autres`}
              <ChevronDown size={13} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
