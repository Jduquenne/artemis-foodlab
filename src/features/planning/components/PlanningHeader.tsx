import { useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

export interface PlanningHeaderProps {
  weekNumber: number;
  weekRange: string;
  selectedDayDate: string;
  isAnyEditing: boolean;
  isSelectionMode: boolean;
  isAddMode: boolean;
  hasShoppingDays: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateChange: (dateStr: string, dayIndex: number) => void;
  onEnterSelectionMode: () => void;
}

export const PlanningHeader = ({
  weekNumber, weekRange, selectedDayDate,
  isAnyEditing, isSelectionMode, isAddMode, hasShoppingDays,
  onPrevWeek, onNextWeek, onDateChange, onEnterSelectionMode,
}: PlanningHeaderProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (val: string) => {
    if (!val) return;
    const d = new Date(val + "T12:00:00");
    onDateChange(val, (d.getDay() + 6) % 7);
  };

  return (
    <div className="flex items-center justify-between gap-3 shrink-0">
      <div className="flex flex-col leading-tight">
        <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Ma Semaine</h1>
        <button
          onClick={() => !isAnyEditing && dateInputRef.current?.showPicker?.()}
          className="sm:pointer-events-none text-left text-xs sm:text-sm font-bold text-slate-400 hover:text-orange-500 sm:hover:text-slate-400 transition-colors"
        >
          Sem. {weekNumber} · {weekRange}
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <input
          ref={dateInputRef}
          type="date"
          tabIndex={-1}
          className="absolute opacity-0 w-px h-px pointer-events-none"
          value={selectedDayDate}
          onChange={(e) => handleChange(e.target.value)}
        />
        <div className={`flex items-center gap-1 bg-white dark:bg-slate-100 px-2 py-1 rounded-2xl shadow-sm border border-slate-200 ${isAnyEditing ? "opacity-40 pointer-events-none" : ""}`}>
          <button aria-label="Semaine précédente" onClick={onPrevWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <input
            type="date"
            className="h-8 px-2 bg-slate-100 dark:bg-slate-200 rounded-xl text-xs font-semibold text-slate-500 border-0 outline-none cursor-pointer hover:bg-orange-50 focus:ring-2 focus:ring-orange-400 scheme-light dark:scheme-dark transition-colors [&::-webkit-calendar-picker-indicator]:hidden sm:[&::-webkit-calendar-picker-indicator]:block"
            value={selectedDayDate}
            onChange={(e) => handleChange(e.target.value)}
          />
          <button aria-label="Semaine suivante" onClick={onNextWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-200 rounded-xl transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {!isSelectionMode && !isAddMode && (
          <button
            onClick={isAnyEditing ? undefined : onEnterSelectionMode}
            className={[
              "flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border font-bold text-sm transition-colors",
              isAnyEditing ? "opacity-40 pointer-events-none bg-white dark:bg-slate-100 border-slate-200 text-slate-600"
                : hasShoppingDays ? "bg-orange-500 border-orange-400 text-white hover:bg-orange-600"
                  : "bg-white dark:bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200",
            ].join(" ")}
          >
            <ShoppingCart size={15} />
            <span className="hidden sm:inline">Courses</span>
          </button>
        )}
      </div>
    </div>
  );
};
