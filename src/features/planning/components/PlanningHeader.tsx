import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, History, List, Loader2, MoreHorizontal, ShoppingCart, Sparkles } from "lucide-react";
import { FloatingMenu } from "../../../shared/components/ui/FloatingMenu";
import { CostEstimate } from "../../../core/logic/price/priceLogic";
import { PlanningCostLabel } from "./PlanningCostLabel";
import { PageHeading } from "../../../shared/components/layout/PageHeading";

export interface PlanningHeaderProps {
  weekNumber: number;
  weekRange: string;
  weekCost: CostEstimate | null;
  selectedDayDate: string;
  isAnyEditing: boolean;
  isSelectionMode: boolean;
  isAddMode: boolean;
  hasShoppingDays: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateChange: (dateStr: string, dayIndex: number) => void;
  onEnterSelectionMode: () => void;
  onOpenGenerator?: () => void;
  onCopyPreviousWeek: () => void;
  copyingPreviousWeek: boolean;
  mobileWeekView: boolean;
  onToggleMobileWeekView: () => void;
}

export const PlanningHeader = ({
  weekNumber, weekRange, weekCost, selectedDayDate,
  isAnyEditing, isSelectionMode, isAddMode, hasShoppingDays,
  onPrevWeek, onNextWeek, onDateChange, onEnterSelectionMode, onOpenGenerator,
  onCopyPreviousWeek, copyingPreviousWeek, mobileWeekView, onToggleMobileWeekView,
}: PlanningHeaderProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const runMore = (action: () => void) => () => { setMoreOpen(false); action(); };

  const handleChange = (val: string) => {
    if (!val) return;
    const d = new Date(val + "T12:00:00");
    onDateChange(val, (d.getDay() + 6) % 7);
  };

  return (
    <div className="flex items-center justify-between gap-3 shrink-0">
      <PageHeading
        title="Ma Semaine"
        subtitle={
          <button
            onClick={() => !isAnyEditing && dateInputRef.current?.showPicker?.()}
            className="sm:pointer-events-none text-left hover:text-orange-500 sm:hover:text-slate-500 transition-colors"
          >
            Sem. {weekNumber} · {weekRange}
            {weekCost && weekCost.total > 0 && <> · <PlanningCostLabel estimate={weekCost} /></>}
          </button>
        }
      />

      <div className="flex items-center gap-2 shrink-0">
        <input
          ref={dateInputRef}
          type="date"
          tabIndex={-1}
          className="absolute opacity-0 w-px h-px pointer-events-none"
          value={selectedDayDate}
          onChange={(e) => handleChange(e.target.value)}
        />
        <div className={`flex items-center gap-1 bg-surface px-2 py-1 rounded-2xl shadow-sm border border-slate-200 ${isAnyEditing ? "opacity-40 pointer-events-none" : ""}`}>
          <button aria-label="Semaine précédente" onClick={onPrevWeek} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <input
            type="date"
            className="h-8 px-2 bg-muted rounded-xl text-xs font-semibold text-slate-500 border-0 outline-none cursor-pointer hover:bg-orange-50 focus:ring-2 focus:ring-orange-400 scheme-light dark:scheme-dark transition-colors [&::-webkit-calendar-picker-indicator]:hidden sm:[&::-webkit-calendar-picker-indicator]:block"
            value={selectedDayDate}
            onChange={(e) => handleChange(e.target.value)}
          />
          <button aria-label="Semaine suivante" onClick={onNextWeek} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {!isSelectionMode && !isAddMode && (
          <>
            <button
              ref={moreRef}
              onClick={isAnyEditing ? undefined : () => setMoreOpen((o) => !o)}
              aria-label="Plus d'actions"
              aria-expanded={moreOpen}
              className={`sm:hidden flex items-center px-3 py-2 rounded-2xl shadow-sm border border-slate-200 bg-surface text-slate-600 hover:bg-muted transition-colors ${isAnyEditing ? "opacity-40 pointer-events-none" : ""}`}
            >
              {copyingPreviousWeek ? <Loader2 size={15} className="animate-spin text-orange-500" /> : <MoreHorizontal size={15} />}
            </button>
            <FloatingMenu open={moreOpen} anchorRef={moreRef} onClose={() => setMoreOpen(false)}>
              <button onClick={runMore(onToggleMobileWeekView)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-subtle transition-colors">
                {mobileWeekView ? <CalendarDays className="w-4 h-4 shrink-0" /> : <List className="w-4 h-4 shrink-0" />}
                {mobileWeekView ? "Voir le jour" : "Voir la semaine"}
              </button>
              <button onClick={runMore(onCopyPreviousWeek)} disabled={copyingPreviousWeek} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-subtle transition-colors disabled:opacity-50">
                <History className="w-4 h-4 shrink-0" />
                Reprendre la semaine précédente
              </button>
              {onOpenGenerator && (
                <button onClick={runMore(onOpenGenerator)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-subtle transition-colors">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Générer des menus
                </button>
              )}
            </FloatingMenu>
          </>
        )}

        {!isSelectionMode && !isAddMode && (
          <button
            onClick={isAnyEditing || copyingPreviousWeek ? undefined : onCopyPreviousWeek}
            aria-label="Reprendre la semaine précédente"
            title="Reprendre la semaine précédente"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border border-slate-200 bg-surface font-bold text-sm text-slate-600 hover:bg-muted transition-colors ${isAnyEditing ? "opacity-40 pointer-events-none" : ""}`}
          >
            {copyingPreviousWeek ? <Loader2 size={15} className="animate-spin text-orange-500" /> : <History size={15} className="text-orange-500" />}
            <span className="hidden lg:inline">Reprendre</span>
          </button>
        )}

        {onOpenGenerator && !isSelectionMode && !isAddMode && (
          <button
            onClick={isAnyEditing ? undefined : onOpenGenerator}
            aria-label="Générer des menus"
            title="Générer des menus"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border border-slate-200 bg-surface font-bold text-sm text-slate-600 hover:bg-muted transition-colors ${isAnyEditing ? "opacity-40 pointer-events-none" : ""}`}
          >
            <Sparkles size={15} className="text-orange-500" />
            <span className="hidden lg:inline">Générer</span>
          </button>
        )}

        {!isSelectionMode && !isAddMode && (
          <button
            onClick={isAnyEditing ? undefined : onEnterSelectionMode}
            className={[
              "flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-sm border font-bold text-sm transition-colors",
              isAnyEditing ? "opacity-40 pointer-events-none bg-surface border-slate-200 text-slate-600"
                : hasShoppingDays ? "bg-orange-500 border-orange-400 text-white hover:bg-orange-600"
                  : "bg-surface border-slate-200 text-slate-600 hover:bg-muted",
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
