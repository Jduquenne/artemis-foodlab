export interface CalorieProgressProps {
  consumed: number;
  target: number;
}

export const CalorieProgress = ({ consumed, target }: CalorieProgressProps) => {
  const pct = Math.min(100, Math.round((consumed / target) * 100));
  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl px-4 py-3 shrink-0">
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-black leading-none ${isOver ? "text-orange-600" : "text-slate-900"}`}>
            {Math.round(consumed)}
          </span>
          <span className="text-sm text-slate-400 leading-none">kcal</span>
        </div>
        <span className="text-xs text-slate-400">
          {isOver
            ? `+${Math.round(consumed - target)} au-dessus`
            : `${Math.round(remaining)} restantes · obj. ${target}`}
        </span>
      </div>

      <div className="h-2 bg-slate-100 dark:bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-300">0</span>
        <span className="text-[10px] font-bold text-orange-500">{pct}%</span>
        <span className="text-[10px] text-slate-300">{target}</span>
      </div>
    </div>
  );
};
