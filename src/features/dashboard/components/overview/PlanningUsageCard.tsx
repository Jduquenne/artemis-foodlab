import { useMemo } from "react";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { buildPlanningUsageInsights } from "../../../../core/logic/dashboard/planningUsage";
import { usePlanningUsage } from "../../../../shared/hooks/usePlanningUsage";
import { AsyncImage } from "../../../../shared/components/ui/AsyncImage";
import { PlanningDiscoverList } from "./PlanningDiscoverList";

const SEGMENTS = [
  { key: "regular", label: "réguliers", color: "bg-emerald-500" },
  { key: "occasional", label: "occasionnels", color: "bg-sky-400" },
  { key: "once", label: "une fois", color: "bg-amber-400" },
  { key: "never", label: "jamais", color: "bg-slate-300" },
] as const;

export const PlanningUsageCard = () => {
  const { usage, loading, error } = usePlanningUsage();

  const insights = useMemo(
    () => (usage ? buildPlanningUsageInsights(usage, typedRecipesDb) : null),
    [usage],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 p-4 flex flex-col gap-4">
      <h2 className="text-sm text-slate-500">
        Usage du planning <span className="text-xs text-slate-400">· déjeuner &amp; dîner</span>
      </h2>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement de l'usage…</p>
      ) : error || !insights ? (
        <p className="text-sm text-slate-400">Usage du planning indisponible.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
              {SEGMENTS.map((seg) => {
                const value = insights.distribution[seg.key];
                if (value === 0) return null;
                return (
                  <div
                    key={seg.key}
                    className={seg.color}
                    style={{ width: `${(value / insights.totalDishes) * 100}%` }}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {SEGMENTS.map((seg) => (
                <span key={seg.key} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${seg.color}`} />
                  <span className="tabular-nums font-bold text-slate-700">{insights.distribution[seg.key]}</span>
                  {seg.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">Tes valeurs sûres</span>
              {insights.mostPlanned.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun plat encore planifié.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {insights.mostPlanned.map((dish) => (
                    <li key={dish.code} className="flex items-center gap-2.5">
                      <AsyncImage
                        src={dish.photoUrl}
                        alt={dish.name}
                        wrapperClassName="w-9 h-9 rounded-lg shrink-0"
                        className="object-cover"
                      />
                      <span className="flex-1 min-w-0 truncate text-sm text-slate-700">{dish.name}</span>
                      <div className="hidden sm:block w-12 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 origin-left"
                          style={{ transform: `scaleX(${dish.plannedCount / insights.mostPlanned[0].plannedCount})` }}
                        />
                      </div>
                      <span className="shrink-0 w-8 text-right text-sm font-black tabular-nums text-slate-700">
                        ×{dish.plannedCount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <PlanningDiscoverList dishes={insights.toReview} />
          </div>
        </>
      )}
    </div>
  );
};
