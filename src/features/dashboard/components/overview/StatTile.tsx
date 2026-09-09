export interface StatTileBreakdown {
  label: string;
  value: number;
}

export interface StatTileProps {
  label: string;
  value: number;
  breakdown?: StatTileBreakdown[];
}

export const StatTile = ({ label, value, breakdown }: StatTileProps) => (
  <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 p-4 flex flex-col">
    <span className="text-3xl font-black text-slate-800 tabular-nums leading-none">{value}</span>
    <span className="mt-1.5 text-sm text-slate-500">{label}</span>
    {breakdown && breakdown.length > 0 && (
      <ul className="mt-3 flex flex-col gap-0.5">
        {breakdown.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between text-xs text-slate-400">
            <span>{row.label}</span>
            <span className="tabular-nums text-slate-500">{row.value}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
