import { CategoryBreakdownRow } from "../../../../core/logic/dashboard/dashboardStats";
import { getCardColors } from "../../../../shared/utils/cards/cardColors";

export interface CategoryBreakdownProps {
  rows: CategoryBreakdownRow[];
}

export const CategoryBreakdown = ({ rows }: CategoryBreakdownProps) => {
  const max = Math.max(...rows.map((row) => row.recipes), 1);

  return (
    <div className="h-full max-h-44 rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <h2 className="shrink-0 px-4 pt-4 pb-2 text-sm text-slate-500">Recettes par catégorie</h2>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: getCardColors(row.id).band }}
            />
            <span className="flex-1 min-w-0 truncate text-xs text-slate-600">{row.name}</span>
            <div className="hidden xl:block w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full origin-left"
                style={{
                  backgroundColor: getCardColors(row.id).band,
                  transform: `scaleX(${row.recipes / max})`,
                }}
              />
            </div>
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-500">{row.recipes}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
