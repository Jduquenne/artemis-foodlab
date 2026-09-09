import { CategoryBreakdownRow } from "../../../../core/logic/dashboard/dashboardStats";
import { getCardColors } from "../../../../shared/utils/cards/cardColors";

export interface CategoryBreakdownProps {
  rows: CategoryBreakdownRow[];
}

export const CategoryBreakdown = ({ rows }: CategoryBreakdownProps) => {
  const max = Math.max(...rows.map((row) => row.recipes), 1);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <h2 className="shrink-0 px-4 pt-4 pb-2 text-sm font-bold text-slate-500">Recettes par catégorie</h2>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-slate-600">{row.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full origin-left"
                style={{
                  backgroundColor: getCardColors(row.id).band,
                  transform: `scaleX(${row.recipes / max})`,
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-500">{row.recipes}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
